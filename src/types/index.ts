export type ServiceCategory = 'haircut' | 'treatment' | 'styling' | 'grooming';

export type BookingStatus = 'confirmed' | 'pending_payment' | 'completed' | 'cancelled' | 'no-show';

export interface Branch {
  id: string;
  name: string;
  address: string;
  whatsapp: string;
  openTime: string; // "10:00"
  closeTime: string; // "21:00"
  slotIntervalMin: number; // 30
  isActive: boolean;
  notes?: string;
}

export interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  price: number;
  isPriceStartingFrom: boolean;
  durationMinutes: number;
  description: string;
  isActive: boolean;
}

export interface Barber {
  id: string;
  name: string;
  branchId: string;
  specialties: string;
  active: boolean;
  workDays: number[]; // 0=Sunday, 1=Monday, ... 6=Saturday
  workStart: string; // "10:00"
  workEnd: string; // "21:00"
  breakStart: string; // "12:00"
  breakEnd: string; // "13:00"
  photoUrl?: string; // Foto profil barber
}

export interface Booking {
  id?: string;
  bookingCode: string; // PLS-XXXXXX
  branchId: string;
  branchName: string;
  barberId: string;
  barberName: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  customerName: string;
  customerPhone: string;
  date: string; // "YYYY-MM-DD"
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  status: BookingStatus;
  paymentStatus?: 'unpaid' | 'waiting_verification' | 'verified';
  notes?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface TimeSlot {
  time: string; // "10:00"
  endTime: string; // "11:30"
  availableBarbers: { id: string; name: string }[];
}

export interface AdminUser {
  uid: string;
  email: string;
  role: 'superadmin' | 'manager';
  name: string;
}
