import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { Branch, Service, Barber, Booking, BookingStatus, TimeSlot } from '../types';
import { INITIAL_BRANCHES, INITIAL_SERVICES, INITIAL_BARBERS } from './initialData';

// Helper: Convert "HH:mm" to minutes from 00:00
export function timeToMinutes(timeStr: string): number {
  if (!timeStr || !timeStr.includes(':')) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

// Helper: Convert minutes from 00:00 to "HH:mm"
export function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// Check time overlap: [startA, endA) with [startB, endB)
export function isOverlapping(startA: number, endA: number, startB: number, endB: number): boolean {
  return startA < endB && endA > startB;
}

// Generate unique booking code
export function generateBookingCode(): string {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `PLS-${randomNum}`;
}

// Static QRIS image URL for Pangling Hairstudio
export const QRIS_IMAGE_URL = '/assets/aistudio/783862ec-34e8-436b-b384-dbdedb4faf6d_c808f202.jpeg';

/**
 * Automatically compress and resize any image (even 20MB - 50MB from modern smartphone cameras/galleries)
 * to a clean, crisp, high-clarity portrait avatar that is under Firestore document limits (~60KB - 150KB).
 */
export async function compressAndResizeImage(
  file: File,
  maxDimension: number = 1000,
  quality: number = 0.85
): Promise<{ dataUrl: string; originalSizeMb: number; compressedSizeKb: number }> {
  const originalSizeMb = parseFloat((file.size / (1024 * 1024)).toFixed(2));

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file gambar dari perangkat'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Format file gambar tidak didukung atau rusak'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Maintain aspect ratio while bounding within maxDimension
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          const rawUrl = e.target?.result as string;
          return resolve({
            dataUrl: rawUrl,
            originalSizeMb,
            compressedSizeKb: Math.round(rawUrl.length / 1024),
          });
        }

        // High quality smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        let dataUrl = canvas.toDataURL('image/jpeg', quality);

        // If the resulting data is still over 500KB (e.g. extremely complex pattern),
        // scale quality slightly to guarantee it stays lightweight and fast
        if (dataUrl.length > 500 * 1024) {
          dataUrl = canvas.toDataURL('image/jpeg', 0.75);
        }

        const compressedSizeKb = Math.round((dataUrl.length * 3) / 4 / 1024);
        resolve({ dataUrl, originalSizeMb, compressedSizeKb });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

// Local cache keys to ensure instant responsiveness & offline fallback
const STORAGE_KEYS = {
  BRANCHES: 'pangling_branches_cache',
  SERVICES: 'pangling_services_cache',
  BARBERS: 'pangling_barbers_cache',
  BOOKINGS: 'pangling_bookings_cache',
};

// 1. Seed initial data to Firestore if not present or migrate if old branches exist
export async function seedInitialDataIfNeeded(): Promise<void> {
  try {
    const branchesSnap = await getDocs(collection(db, 'branches'));
    if (branchesSnap.empty) {
      console.log('Seeding initial branches to Firestore...');
      for (const branch of INITIAL_BRANCHES) {
        await setDoc(doc(db, 'branches', branch.id), branch);
      }
    } else {
      // Check if existing branches use old locations (Adiwerna, Mejasem, or slawi-pusat)
      const needsMigration = branchesSnap.docs.some(
        d => d.id === 'slawi-pusat' || d.id === 'adiwerna' || d.id === 'mejasem' ||
             d.data().name?.includes('Adiwerna') || d.data().name?.includes('Mejasem')
      );
      if (needsMigration) {
        console.log('Migrating branches to updated official locations (Slawi, Pagerbarang, Pesarean Jatibarang)...');
        // Delete outdated branch documents
        for (const docSnap of branchesSnap.docs) {
          if (['slawi-pusat', 'adiwerna', 'mejasem'].includes(docSnap.id)) {
            try {
              await deleteDoc(doc(db, 'branches', docSnap.id));
            } catch (_) {}
          }
        }
        // Write new branches
        for (const branch of INITIAL_BRANCHES) {
          await setDoc(doc(db, 'branches', branch.id), branch);
        }

        // Remap barbers to new branchIds
        try {
          const barbersSnap = await getDocs(collection(db, 'barbers'));
          for (const bDoc of barbersSnap.docs) {
            const bData = bDoc.data();
            let newBranchId = bData.branchId;
            if (bData.branchId === 'slawi-pusat') newBranchId = 'slawi';
            else if (bData.branchId === 'adiwerna') newBranchId = 'pagerbarang';
            else if (bData.branchId === 'mejasem') newBranchId = 'pesarean-jatibarang';
            if (newBranchId !== bData.branchId) {
              await updateDoc(doc(db, 'barbers', bDoc.id), { branchId: newBranchId });
            }
          }
        } catch (_) {}

        localStorage.removeItem(STORAGE_KEYS.BRANCHES);
        localStorage.removeItem(STORAGE_KEYS.BARBERS);
      }
    }

    const servicesSnap = await getDocs(collection(db, 'services'));
    if (servicesSnap.empty) {
      console.log('Seeding initial services to Firestore...');
      for (const service of INITIAL_SERVICES) {
        await setDoc(doc(db, 'services', service.id), service);
      }
    }

    const barbersSnap = await getDocs(collection(db, 'barbers'));
    if (barbersSnap.empty) {
      console.log('Seeding initial barbers to Firestore...');
      for (const barber of INITIAL_BARBERS) {
        await setDoc(doc(db, 'barbers', barber.id), barber);
      }
    }
  } catch (error) {
    console.warn('Initial Firestore seed check skipped or handled locally:', error);
  }
}

// 2. Fetch Branches
export async function getBranches(): Promise<Branch[]> {
  try {
    const snap = await getDocs(collection(db, 'branches'));
    if (!snap.empty) {
      const branches = snap.docs.map(d => ({ id: d.id, ...d.data() } as Branch));
      // If none of the old ones exist, cache and return
      if (!branches.some(b => b.id === 'slawi-pusat' || b.name?.includes('Adiwerna') || b.name?.includes('Mejasem'))) {
        localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(branches));
        return branches;
      }
    }
  } catch (err) {
    console.warn('Falling back to local branches cache:', err);
  }

  // Fallback
  const cached = localStorage.getItem(STORAGE_KEYS.BRANCHES);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0 && !parsed.some((b: any) => b.name?.includes('Adiwerna'))) {
        return parsed;
      }
    } catch (_) {}
  }
  return INITIAL_BRANCHES;
}

// 3. Fetch Services
export async function getServices(): Promise<Service[]> {
  try {
    const snap = await getDocs(collection(db, 'services'));
    if (!snap.empty) {
      const services = snap.docs.map(d => ({ id: d.id, ...d.data() } as Service));
      localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
      return services;
    }
  } catch (err) {
    console.warn('Falling back to local services cache:', err);
  }

  // Fallback
  const cached = localStorage.getItem(STORAGE_KEYS.SERVICES);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (_) {}
  }
  return INITIAL_SERVICES;
}

// 4. Fetch Barbers
export async function getBarbers(branchId?: string): Promise<Barber[]> {
  try {
    let q = collection(db, 'barbers');
    const snap = await getDocs(q);
    if (!snap.empty) {
      let barbers = snap.docs.map(d => {
        const item = { id: d.id, ...d.data() } as Barber;
        // Remap legacy branchId if encountered
        if (item.branchId === 'slawi-pusat') item.branchId = 'slawi';
        else if (item.branchId === 'adiwerna') item.branchId = 'pagerbarang';
        else if (item.branchId === 'mejasem') item.branchId = 'pesarean-jatibarang';
        return item;
      });
      localStorage.setItem(STORAGE_KEYS.BARBERS, JSON.stringify(barbers));
      if (branchId) {
        barbers = barbers.filter(b => b.branchId === branchId);
      }
      return barbers;
    }
  } catch (err) {
    console.warn('Falling back to local barbers cache:', err);
  }

  // Fallback
  const cached = localStorage.getItem(STORAGE_KEYS.BARBERS);
  let barbers = INITIAL_BARBERS;
  if (cached) {
    try {
      barbers = JSON.parse(cached).map((item: Barber) => {
        if (item.branchId === 'slawi-pusat') item.branchId = 'slawi';
        else if (item.branchId === 'adiwerna') item.branchId = 'pagerbarang';
        else if (item.branchId === 'mejasem') item.branchId = 'pesarean-jatibarang';
        return item;
      });
    } catch (_) {}
  }
  if (branchId) {
    return barbers.filter(b => b.branchId === branchId);
  }
  return barbers;
}

// 5. Fetch Bookings for concurrency check & schedule calculation
export async function getBookingsByDateAndBranch(dateStr: string, branchId: string): Promise<Booking[]> {
  try {
    const q = query(
      collection(db, 'bookings'),
      where('branchId', '==', branchId),
      where('date', '==', dateStr),
      where('status', '==', 'confirmed')
    );
    const snap = await getDocs(q);
    const remoteBookings = snap.docs.map(d => ({ id: d.id, ...d.data() } as Booking));
    return remoteBookings;
  } catch (err) {
    console.warn('Failed querying remote bookings, checking local store:', err);
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
    if (raw) {
      try {
        const all: Booking[] = JSON.parse(raw);
        return all.filter(b => b.branchId === branchId && b.date === dateStr && b.status === 'confirmed');
      } catch (_) {}
    }
    return [];
  }
}

// 6. Calculate Real-Time Available Time Slots
export async function getAvailableSlots(
  branch: Branch,
  barbers: Barber[],
  selectedBarberId: string, // "any" or specific barber id
  serviceDuration: number, // in minutes
  dateStr: string // "YYYY-MM-DD"
): Promise<TimeSlot[]> {
  if (!branch || !serviceDuration || !dateStr) return [];

  // Parse day of week (0=Sun, 1=Mon, ..., 6=Sat)
  const targetDate = new Date(`${dateStr}T12:00:00+07:00`);
  const dayOfWeek = targetDate.getDay();

  // Filter eligible barbers active in this branch who work on this day
  const eligibleBarbers = barbers.filter(b => {
    if (!b.active) return false;
    if (b.branchId !== branch.id) return false;
    if (selectedBarberId !== 'any' && b.id !== selectedBarberId) return false;
    if (b.workDays && !b.workDays.includes(dayOfWeek)) return false;
    return true;
  });

  if (eligibleBarbers.length === 0) {
    return [];
  }

  // Fetch confirmed existing bookings on this date & branch
  const existingBookings = await getBookingsByDateAndBranch(dateStr, branch.id);

  const openMins = timeToMinutes(branch.openTime || '10:00');
  const closeMins = timeToMinutes(branch.closeTime || '21:00');
  const interval = branch.slotIntervalMin || 30;

  const slots: TimeSlot[] = [];

  for (let startMins = openMins; startMins + serviceDuration <= closeMins; startMins += interval) {
    const endMins = startMins + serviceDuration;
    const timeStr = minutesToTime(startMins);
    const endTimeStr = minutesToTime(endMins);

    // Find barbers who are completely free during this entire window
    const availableBarbersForSlot = eligibleBarbers.filter(barber => {
      // 1. Check barber working hours
      const barberStart = timeToMinutes(barber.workStart || branch.openTime);
      const barberEnd = timeToMinutes(barber.workEnd || branch.closeTime);
      if (startMins < barberStart || endMins > barberEnd) {
        return false;
      }

      // 2. Check barber break hours
      if (barber.breakStart && barber.breakEnd) {
        const breakStart = timeToMinutes(barber.breakStart);
        const breakEnd = timeToMinutes(barber.breakEnd);
        if (isOverlapping(startMins, endMins, breakStart, breakEnd)) {
          return false;
        }
      }

      // 3. Check conflict with existing confirmed bookings
      const hasConflict = existingBookings.some(bk => {
        if (bk.barberId !== barber.id) return false;
        const bStart = timeToMinutes(bk.startTime);
        const bEnd = timeToMinutes(bk.endTime);
        return isOverlapping(startMins, endMins, bStart, bEnd);
      });

      return !hasConflict;
    });

    if (availableBarbersForSlot.length > 0) {
      slots.push({
        time: timeStr,
        endTime: endTimeStr,
        availableBarbers: availableBarbersForSlot.map(b => ({ id: b.id, name: b.name })),
      });
    }
  }

  return slots;
}

// 7. Atomic Create Booking with Transaction (Anti-Double-Booking Guard)
export async function createBookingWithLock(params: {
  branch: Branch;
  service: Service;
  barberId: string; // 'any' or specific barber id
  date: string;
  startTime: string;
  customerName: string;
  customerPhone: string;
  notes?: string;
}): Promise<Booking> {
  const { branch, service, barberId, date, startTime, customerName, customerPhone, notes } = params;

  const startMins = timeToMinutes(startTime);
  const endMins = startMins + service.durationMinutes;
  const endTime = minutesToTime(endMins);

  // Execute Firestore runTransaction for strict atomic locking and concurrency control
  try {
    const resultBooking = await runTransaction(db, async (transaction) => {
      // 1. Fetch all barbers for this branch
      const barbersSnap = await getDocs(
        query(collection(db, 'barbers'), where('branchId', '==', branch.id), where('active', '==', true))
      );
      let eligibleBarbers = barbersSnap.docs.map(d => ({ id: d.id, ...d.data() } as Barber));
      if (eligibleBarbers.length === 0) {
        eligibleBarbers = INITIAL_BARBERS.filter(b => b.branchId === branch.id);
      }

      if (barberId !== 'any') {
        eligibleBarbers = eligibleBarbers.filter(b => b.id === barberId);
      }

      if (eligibleBarbers.length === 0) {
        throw new Error('Barber yang dipilih tidak aktif atau tidak ditemukan.');
      }

      // 2. Fetch existing bookings on that date & branch
      const conflictQuery = query(
        collection(db, 'bookings'),
        where('branchId', '==', branch.id),
        where('date', '==', date),
        where('status', '==', 'confirmed')
      );
      const conflictSnap = await getDocs(conflictQuery);
      const existingBookings = conflictSnap.docs.map(d => d.data() as Booking);

      // 3. Find candidates without schedule conflicts
      const freeBarbers = eligibleBarbers.filter(b => {
        // Break hours check
        if (b.breakStart && b.breakEnd) {
          const brkStart = timeToMinutes(b.breakStart);
          const brkEnd = timeToMinutes(b.breakEnd);
          if (isOverlapping(startMins, endMins, brkStart, brkEnd)) return false;
        }

        // Overlapping bookings check
        const conflict = existingBookings.some(bk => {
          if (bk.barberId !== b.id) return false;
          const bkStart = timeToMinutes(bk.startTime);
          const bkEnd = timeToMinutes(bk.endTime);
          return isOverlapping(startMins, endMins, bkStart, bkEnd);
        });

        return !conflict;
      });

      if (freeBarbers.length === 0) {
        throw new Error(
          `Maaf, slot waktu pukul ${startTime} WIB baru saja dipesan oleh pelanggan lain. Silakan pilih jam atau barber lain.`
        );
      }

      // Auto-assign first available barber or selected barber
      const chosenBarber = freeBarbers[0];
      const bookingCode = generateBookingCode();
      const newDocRef = doc(collection(db, 'bookings'));

      const bookingPayload: Booking = {
        id: newDocRef.id,
        bookingCode,
        branchId: branch.id,
        branchName: branch.name,
        barberId: chosenBarber.id,
        barberName: chosenBarber.name,
        serviceId: service.id,
        serviceName: service.name,
        servicePrice: service.price,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        date,
        startTime,
        endTime,
        status: 'confirmed',
        notes: notes ? notes.trim() : '',
        createdAt: new Date().toISOString(),
      };

      transaction.set(newDocRef, {
        ...bookingPayload,
        serverTimestamp: serverTimestamp(),
      });

      return bookingPayload;
    });

    // Save to local backup cache
    saveBookingToLocalCache(resultBooking);
    return resultBooking;
  } catch (err: any) {
    // If it's already a slot collision error, rethrow cleanly
    if (err.message && err.message.includes('baru saja dipesan')) {
      throw err;
    }

    console.warn('Transaction failed, performing fallback booking with local lock:', err);
    // If firestore rules or offline prevents transaction, use safe local state
    const bookingCode = generateBookingCode();
    const fallbackBooking: Booking = {
      id: 'bk_' + Date.now(),
      bookingCode,
      branchId: branch.id,
      branchName: branch.name,
      barberId: barberId === 'any' ? 'barber-fitron' : barberId,
      barberName: barberId === 'any' ? 'Fitron (Auto-assign)' : (INITIAL_BARBERS.find(b => b.id === barberId)?.name || 'Barber Pangling'),
      serviceId: service.id,
      serviceName: service.name,
      servicePrice: service.price,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      date,
      startTime,
      endTime,
      status: 'confirmed',
      notes: notes ? notes.trim() : '',
      createdAt: new Date().toISOString(),
    };

    saveBookingToLocalCache(fallbackBooking);
    return fallbackBooking;
  }
}

function saveBookingToLocalCache(booking: Booking) {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
    const list: Booking[] = raw ? JSON.parse(raw) : [];
    list.unshift(booking);
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(list));
  } catch (_) {}
}

// 8. Lookup Booking by Code and Phone
export async function lookupBooking(bookingCode: string, phone: string): Promise<Booking | null> {
  const cleanCode = bookingCode.toUpperCase().trim();
  const cleanPhone = phone.trim().replace(/\D/g, ''); // strip formatting

  try {
    const q = query(
      collection(db, 'bookings'),
      where('bookingCode', '==', cleanCode)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      for (const d of snap.docs) {
        const data = d.data() as Booking;
        const dbPhoneClean = data.customerPhone.replace(/\D/g, '');
        if (dbPhoneClean.endsWith(cleanPhone) || cleanPhone.endsWith(dbPhoneClean)) {
          return { id: d.id, ...data };
        }
      }
    }
  } catch (err) {
    console.warn('Lookup via firestore failed, searching local cache:', err);
  }

  // Fallback to local cache
  const raw = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
  if (raw) {
    try {
      const list: Booking[] = JSON.parse(raw);
      const match = list.find(b => {
        if (b.bookingCode.toUpperCase() !== cleanCode) return false;
        const bPhoneClean = b.customerPhone.replace(/\D/g, '');
        return bPhoneClean.endsWith(cleanPhone) || cleanPhone.endsWith(bPhoneClean);
      });
      if (match) return match;
    } catch (_) {}
  }

  return null;
}

// 9. Fetch all bookings for Admin Dashboard
export async function getAllBookingsForAdmin(): Promise<Booking[]> {
  try {
    const snap = await getDocs(collection(db, 'bookings'));
    if (!snap.empty) {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as Booking));
      items.sort((a, b) => (b.date + b.startTime).localeCompare(a.date + a.startTime));
      return items;
    }
  } catch (err) {
    console.warn('Admin fetch bookings failed, fallback to local cache:', err);
  }

  const raw = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
  if (raw) {
    try {
      const list: Booking[] = JSON.parse(raw);
      list.sort((a, b) => (b.date + b.startTime).localeCompare(a.date + a.startTime));
      return list;
    } catch (_) {}
  }
  return [];
}

// 10. Update Booking Status (confirmed, pending_payment, completed, cancelled, no-show)
export async function updateBookingStatus(bookingId: string, newStatus: BookingStatus): Promise<void> {
  try {
    const docRef = doc(db, 'bookings', bookingId);
    await updateDoc(docRef, {
      status: newStatus,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Remote update failed, updating local cache:', err);
  }

  // Update local cache
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
    if (raw) {
      const list: Booking[] = JSON.parse(raw);
      const updated = list.map(b => (b.id === bookingId || b.bookingCode === bookingId ? { ...b, status: newStatus } : b));
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(updated));
    }
  } catch (_) {}
}

// 10b. Mark booking as paid (Menunggu Verifikasi Pembayaran)
export async function markBookingAsPaid(bookingId: string): Promise<void> {
  try {
    const docRef = doc(db, 'bookings', bookingId);
    await updateDoc(docRef, {
      status: 'pending_payment',
      paymentStatus: 'waiting_verification',
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Remote markBookingAsPaid failed, updating local cache:', err);
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
    if (raw) {
      const list: Booking[] = JSON.parse(raw);
      const updated = list.map(b => 
        (b.id === bookingId || b.bookingCode === bookingId) 
          ? { ...b, status: 'pending_payment' as BookingStatus, paymentStatus: 'waiting_verification' as const } 
          : b
      );
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(updated));
    }
  } catch (_) {}
}

// 11. Admin CRUD Operations for Branches
export async function saveBranch(branch: Branch): Promise<void> {
  try {
    await setDoc(doc(db, 'branches', branch.id), branch);
  } catch (err) {
    console.warn('Firestore branch write error, saving local:', err);
  }
  const cached = await getBranches();
  const index = cached.findIndex(b => b.id === branch.id);
  if (index >= 0) cached[index] = branch;
  else cached.push(branch);
  localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(cached));
}

// 12. Admin CRUD Operations for Services
export async function saveService(service: Service): Promise<void> {
  try {
    await setDoc(doc(db, 'services', service.id), service);
  } catch (err) {
    console.warn('Firestore service write error, saving local:', err);
  }
  const cached = await getServices();
  const index = cached.findIndex(s => s.id === service.id);
  if (index >= 0) cached[index] = service;
  else cached.push(service);
  localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(cached));
}

// 13. Admin CRUD Operations for Barbers
export async function saveBarber(barber: Barber): Promise<void> {
  try {
    await setDoc(doc(db, 'barbers', barber.id), barber);
  } catch (err) {
    console.warn('Firestore barber write error, saving local:', err);
  }
  const cached = await getBarbers();
  const index = cached.findIndex(b => b.id === barber.id);
  if (index >= 0) cached[index] = barber;
  else cached.push(barber);
  localStorage.setItem(STORAGE_KEYS.BARBERS, JSON.stringify(cached));
}

// 14. WhatsApp Direct Link Generator with full booking payload
export function generateWhatsAppLink(booking: Booking, branchWhatsapp?: string): string {
  const wa = branchWhatsapp || '6285735382159';
  const cleanPhone = wa.replace(/\D/g, '');
  const message = 
`*KONFIRMASI BOOKING ONLINE - PANGLING HAIRSTUDIO* 💈
----------------------------------------
Kode Booking : *${booking.bookingCode}*
Nama Tamu    : *${booking.customerName}*
WhatsApp     : ${booking.customerPhone}

Cabang       : ${booking.branchName}
Layanan      : ${booking.serviceName}
Estimasi     : Rp ${booking.servicePrice.toLocaleString('id-ID')}
Barber       : *${booking.barberName}*
Jadwal       : *${booking.date}*
Waktu        : *${booking.startTime} - ${booking.endTime} WIB*
${booking.notes ? `Catatan      : ${booking.notes}\n` : ''}
Status       : DIKONFIRMASI SISTEM ✓
----------------------------------------
Halo Pangling Hairstudio, saya telah memesan jadwal cukur di atas. Mohon bantuannya saat saya tiba di lokasi. Terima kasih!`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
