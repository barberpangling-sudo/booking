import { Branch, Service, Barber } from '../types';

export const INITIAL_BRANCHES: Branch[] = [
  {
    id: 'slawi',
    name: 'Pangling Hairstudio Slawi',
    address: 'Kalisapu, Slawi',
    whatsapp: '6285735382159',
    openTime: '10:00',
    closeTime: '21:00',
    slotIntervalMin: 30,
    isActive: true,
    notes: 'Kalisapu, Slawi. Layanan potong rambut profesional & treatment studio lengkap.'
  },
  {
    id: 'pagerbarang',
    name: 'Pangling hairstudio 1 Pagerbarang',
    address: 'Pagerbarang, Tegal',
    whatsapp: '6285735382159',
    openTime: '10:00',
    closeTime: '21:00',
    slotIntervalMin: 30,
    isActive: true,
    notes: 'Cabang 1 Pagerbarang, Tegal. Pelayanan ramah, rapi, dan berkelas.'
  },
  {
    id: 'pesarean-jatibarang',
    name: 'Pangling hairstudio 2 Bong cina Pesarean Jatibarang',
    address: 'Bong cina Pesarean Jatibarang',
    whatsapp: '6285735382159',
    openTime: '10:00',
    closeTime: '21:00',
    slotIntervalMin: 30,
    isActive: true,
    notes: 'Cabang 2 Bong cina Pesarean Jatibarang. Gaya rambut modern & SOP barbershop profesional.'
  }
];

export const INITIAL_SERVICES: Service[] = [
  {
    id: 'gentleman-haircut',
    name: 'Gentleman Haircut & Wash',
    category: 'haircut',
    price: 45000,
    isPriceStartingFrom: false,
    durationMinutes: 45,
    description: 'Potong rambut rapi sesuai bentuk wajah, keramas fresh mint, styling pomade/powder.',
    isActive: true
  },
  {
    id: 'signature-cut-beard',
    name: 'Signature Cut & Beard Trim',
    category: 'haircut',
    price: 60000,
    isPriceStartingFrom: false,
    durationMinutes: 50,
    description: 'Potong rambut signature Pangling + perapian kumis/jenggot, hot towel & massage.',
    isActive: true
  },
  {
    id: 'junior-haircut',
    name: 'Junior Haircut (Anak-Anak)',
    category: 'haircut',
    price: 35000,
    isPriceStartingFrom: false,
    durationMinutes: 35,
    description: 'Potongan rambut sabar dan ramah anak dengan hasil trendy.',
    isActive: true
  },
  {
    id: 'keratin-treatment',
    name: 'Keratin Treatment',
    category: 'treatment',
    price: 250000,
    isPriceStartingFrom: true,
    durationMinutes: 90,
    description: 'Menutrisi rambut rusak, kusam, dan mengembang menjadi halus, lembut, serta berkilau alami.',
    isActive: true
  },
  {
    id: 'design-perm',
    name: 'Design Perm',
    category: 'treatment',
    price: 250000,
    isPriceStartingFrom: true,
    durationMinutes: 120,
    description: 'Pengeritingan gaya modern (Korean Wave, Textured Curls) yang disesuaikan dengan kontur kepala.',
    isActive: true
  },
  {
    id: 'hair-coloring',
    name: 'Hair Coloring & Bleaching',
    category: 'treatment',
    price: 250000,
    isPriceStartingFrom: true,
    durationMinutes: 90,
    description: 'Pewarnaan rambut profesional (Ash grey, brown tone, pastel, highlights) menggunakan produk premium.',
    isActive: true
  },
  {
    id: 'rootlift',
    name: 'Rootlift Treatment',
    category: 'treatment',
    price: 80000,
    isPriceStartingFrom: false,
    durationMinutes: 45,
    description: 'Memberikan volume ekstra pada akar rambut agar tidak lepek dan mudah ditata seharian.',
    isActive: true
  },
  {
    id: 'down-perm',
    name: 'Down Perm',
    category: 'treatment',
    price: 100000,
    isPriceStartingFrom: false,
    durationMinutes: 60,
    description: 'Merapikan rambut samping/belakang yang berdiri atau jabrik agar menempel rapi dan proporsional.',
    isActive: true
  },
  {
    id: 'catok-styling',
    name: 'Catok & Blow Styling',
    category: 'styling',
    price: 50000,
    isPriceStartingFrom: false,
    durationMinutes: 30,
    description: 'Pencatokan profesional dan pembentukan tekstur rambut untuk acara khusus atau hangout.',
    isActive: true
  },
  {
    id: 'wedding-styling',
    name: 'Wedding Hair Styling & Grooming',
    category: 'styling',
    price: 300000,
    isPriceStartingFrom: true,
    durationMinutes: 60,
    description: 'Paket styling rambut & grooming eksklusif untuk pengantin pria di hari pernikahan istimewa.',
    isActive: true
  },
  {
    id: 'shaving-hot-towel',
    name: 'Gentleman Shave & Hot Towel',
    category: 'grooming',
    price: 30000,
    isPriceStartingFrom: false,
    durationMinutes: 30,
    description: 'Cukur jenggot dan kumis bersih dengan ritual handuk hangat dan aftershave soothing.',
    isActive: true
  },
  {
    id: 'facial-black-mask',
    name: 'Facial & Black Mask Peeling',
    category: 'grooming',
    price: 45000,
    isPriceStartingFrom: false,
    durationMinutes: 30,
    description: 'Pembersihan komedo dan sel kulit mati dengan masker charcoal agar wajah segar dan bersih.',
    isActive: true
  }
];

export const INITIAL_BARBERS: Barber[] = [
  {
    id: 'barber-fitron',
    name: 'Fitron',
    branchId: 'slawi',
    specialties: 'Senior Barber & Treatment Specialist (Keratin, Perm, Coloring, Haircut)',
    active: true,
    workDays: [0, 1, 2, 3, 4, 5, 6],
    workStart: '10:00',
    workEnd: '21:00',
    breakStart: '12:00',
    breakEnd: '13:00',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'barber-wawan',
    name: 'Wawan',
    branchId: 'slawi',
    specialties: 'Master Barber, Classic Pompadour & Beard Sculpting Specialist',
    active: true,
    workDays: [0, 1, 2, 3, 4, 5, 6],
    workStart: '10:00',
    workEnd: '21:00',
    breakStart: '13:00',
    breakEnd: '14:00',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'barber-bayu',
    name: 'Bayu',
    branchId: 'slawi',
    specialties: 'Korean Perm, Down Perm, Fade Cut & Modern Texture',
    active: true,
    workDays: [0, 1, 2, 3, 4, 5, 6],
    workStart: '10:00',
    workEnd: '21:00',
    breakStart: '12:30',
    breakEnd: '13:30',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'barber-dwike',
    name: 'Dwike',
    branchId: 'pagerbarang',
    specialties: 'Barber & Styling, Scumbag Boogie, Taper & Sidepart',
    active: true,
    workDays: [0, 1, 2, 3, 4, 5, 6],
    workStart: '10:00',
    workEnd: '21:00',
    breakStart: '12:00',
    breakEnd: '13:00',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'barber-dwiky',
    name: 'Dwiky',
    branchId: 'pagerbarang',
    specialties: 'High Fade, Low Taper, Crop Cut & Sharp Line-Up',
    active: true,
    workDays: [0, 1, 2, 3, 4, 5, 6],
    workStart: '10:00',
    workEnd: '21:00',
    breakStart: '13:00',
    breakEnd: '14:00',
    photoUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'barber-baihaqi',
    name: 'Baihaqi',
    branchId: 'pesarean-jatibarang',
    specialties: 'Classic & Modern Cut, Mullet, Two-Block & Kids Haircut',
    active: true,
    workDays: [0, 1, 2, 3, 4, 5, 6],
    workStart: '10:00',
    workEnd: '21:00',
    breakStart: '12:00',
    breakEnd: '13:00',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'barber-najid',
    name: 'Najid',
    branchId: 'pesarean-jatibarang',
    specialties: 'Beard Grooming, Hot Towel Shave, Quiff & Texture Waves',
    active: true,
    workDays: [0, 1, 2, 3, 4, 5, 6],
    workStart: '10:00',
    workEnd: '21:00',
    breakStart: '13:00',
    breakEnd: '14:00',
    photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
  }
];
