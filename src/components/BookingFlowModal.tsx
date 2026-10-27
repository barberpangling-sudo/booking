import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  User,
  Scissors,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Phone,
  MessageCircle,
  ShieldCheck,
  Check,
  QrCode,
  Download,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Branch, Service, Barber, Booking, TimeSlot } from '../types';
import {
  getAvailableSlots,
  createBookingWithLock,
  generateWhatsAppLink,
  markBookingAsPaid,
  QRIS_IMAGE_URL,
} from '../lib/bookingService';

interface BookingFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  branches: Branch[];
  services: Service[];
  barbers: Barber[];
  preselectedService?: Service | null;
  preselectedBarber?: Barber | null;
}

export const BookingFlowModal: React.FC<BookingFlowModalProps> = ({
  isOpen,
  onClose,
  branches,
  services,
  barbers,
  preselectedService,
  preselectedBarber,
}) => {
  // Step state (1: Cabang & Layanan, 2: Barber & Tanggal, 3: Jam, 4: Data Diri, 5: Halaman Pembayaran QRIS)
  const [step, setStep] = useState<number>(1);

  // Form selections
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedBarberId, setSelectedBarberId] = useState<string>('any'); // 'any' or barber id
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  // Customer form inputs
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Category filter in Step 1
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Async states
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // Payment confirmation state
  const [isPaymentConfirmed, setIsPaymentConfirmed] = useState<boolean>(false);
  const [updatingPayment, setUpdatingPayment] = useState<boolean>(false);

  // Official Hotline
  const OFFICIAL_WA = '6285735382159'; // 0857-3538-2159

  // Today in YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];

  // Initialize defaults
  useEffect(() => {
    if (isOpen) {
      if (branches.length > 0 && !selectedBranchId) {
        setSelectedBranchId(branches[0].id);
      }
      if (preselectedService) {
        setSelectedServiceId(preselectedService.id);
      } else if (services.length > 0 && !selectedServiceId) {
        setSelectedServiceId(services[0].id);
      }
      if (preselectedBarber) {
        setSelectedBarberId(preselectedBarber.id);
        setSelectedBranchId(preselectedBarber.branchId);
      }
      if (!selectedDate) {
        setSelectedDate(todayStr);
      }
    }
  }, [isOpen, branches, services, preselectedService, preselectedBarber]);

  // Selected entities
  const selectedBranch = branches.find(b => b.id === selectedBranchId) || branches[0];
  const selectedService = services.find(s => s.id === selectedServiceId) || services[0];
  const selectedBarber = barbers.find(b => b.id === selectedBarberId);

  // Filter services by category
  const filteredServices = services.filter(s => {
    if (!s.isActive) return false;
    if (activeCategory === 'all') return true;
    return s.category === activeCategory;
  });

  // Filter barbers available in selected branch
  const branchBarbers = barbers.filter(b => b.active && b.branchId === selectedBranchId);

  // Fetch available slots whenever Step 3 is reached
  useEffect(() => {
    if (step === 3 && selectedBranch && selectedService && selectedDate) {
      loadSlots();
    }
  }, [step, selectedBranchId, selectedServiceId, selectedBarberId, selectedDate]);

  const loadSlots = async () => {
    if (!selectedBranch || !selectedService || !selectedDate) return;
    setLoadingSlots(true);
    setErrorMessage('');
    setSelectedSlot(null);
    try {
      const slots = await getAvailableSlots(
        selectedBranch,
        barbers,
        selectedBarberId,
        selectedService.durationMinutes,
        selectedDate
      );
      setAvailableSlots(slots);
    } catch (err: any) {
      console.error('Error fetching slots:', err);
      setErrorMessage('Gagal memuat jadwal slot. Silakan coba kembali.');
    } finally {
      setLoadingSlots(false);
    }
  };

  // Submit Booking
  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMessage('Mohon lengkapi Nama Lengkap dan Nomor WhatsApp Anda.');
      return;
    }
    if (!selectedSlot) {
      setErrorMessage('Mohon pilih jam kunjungan yang tersedia.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      const booking = await createBookingWithLock({
        branch: selectedBranch,
        service: selectedService,
        barberId: selectedBarberId,
        date: selectedDate,
        startTime: selectedSlot.time,
        customerName,
        customerPhone,
        notes,
      });

      setConfirmedBooking(booking);
      setIsPaymentConfirmed(false);
      setStep(5); // Go to Halaman Pembayaran QRIS

      // Celebration confetti
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#000000', '#444444', '#ffffff'],
        });
      } catch (_) {}
    } catch (err: any) {
      console.error('Booking submission error:', err);
      setErrorMessage(
        err.message || 'Terjadi kendala saat mengonfirmasi booking. Silakan coba slot jam lain.'
      );
      if (err.message && err.message.includes('baru saja dipesan')) {
        setStep(3);
        loadSlots();
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Action: Customer clicks "Saya Sudah Bayar"
  const handleConfirmPayment = async () => {
    if (!confirmedBooking) return;
    setUpdatingPayment(true);
    try {
      const idToUpdate = confirmedBooking.id || confirmedBooking.bookingCode;
      await markBookingAsPaid(idToUpdate);
      setConfirmedBooking(prev => prev ? { ...prev, status: 'pending_payment', paymentStatus: 'waiting_verification' } : null);
      setIsPaymentConfirmed(true);

      // Auto-open WhatsApp with payment confirmation message
      const payMessage = 
`*BUKTI PEMBAYARAN QRIS - PANGLING HAIRSTUDIO*
----------------------------------------
Kode Booking : *${confirmedBooking.bookingCode}*
Nama Tamu    : *${confirmedBooking.customerName}*
WhatsApp     : ${confirmedBooking.customerPhone}

Cabang       : ${confirmedBooking.branchName}
Layanan      : ${confirmedBooking.serviceName}
Total Bayar  : *Rp ${confirmedBooking.servicePrice.toLocaleString('id-ID')}*
Jadwal       : ${confirmedBooking.date} pukul ${confirmedBooking.startTime} WIB
Status       : MENUNGGU VERIFIKASI PEMBAYARAN
----------------------------------------
Halo Pangling Hairstudio, saya sudah melakukan pembayaran scan QRIS sesuai nominal di atas. Mohon verifikasi pembayarannya. Terima kasih!`;

      const waUrl = `https://wa.me/${OFFICIAL_WA}?text=${encodeURIComponent(payMessage)}`;
      try {
        window.open(waUrl, '_blank');
      } catch (_) {}
    } catch (err) {
      console.error('Error confirming payment:', err);
    } finally {
      setUpdatingPayment(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setSelectedSlot(null);
    setCustomerName('');
    setCustomerPhone('');
    setNotes('');
    setErrorMessage('');
    setConfirmedBooking(null);
    setIsPaymentConfirmed(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="relative bg-white text-neutral-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header - Monochrome Black & White */}
        <div className="bg-black text-white px-5 py-4 flex items-center justify-between border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-bold">
              <Scissors className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold tracking-wide">
                Booking Online Pangling Hairstudio
              </h3>
              <p className="text-[11px] text-neutral-400 font-medium">
                WA Resmi: 0857-3538-2159 • Pembayaran QRIS Resmi
              </p>
            </div>
          </div>
          <button
            onClick={resetForm}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar (Steps 1 to 4) */}
        {step < 5 && (
          <div className="bg-neutral-50 px-5 py-3 border-b border-neutral-200 shrink-0">
            <div className="flex items-center justify-between text-xs font-semibold text-neutral-600 mb-1.5">
              <span className={step >= 1 ? 'text-black font-bold' : ''}>1. Cabang & Layanan</span>
              <span className={step >= 2 ? 'text-black font-bold' : ''}>2. Barber & Tanggal</span>
              <span className={step >= 3 ? 'text-black font-bold' : ''}>3. Jam Tersedia</span>
              <span className={step >= 4 ? 'text-black font-bold' : ''}>4. Data Diri</span>
            </div>
            <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-black h-full transition-all duration-300 rounded-full"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-5 mt-4 p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs sm:text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMessage}</div>
          </div>
        )}

        {/* Body Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          {/* ================= STEP 1: PILIH CABANG & LAYANAN ================= */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Pilih Cabang */}
              <div>
                <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-black" /> 1. Pilih Cabang di Kab. Tegal
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {branches.map(branch => {
                    const isSelected = selectedBranchId === branch.id;
                    return (
                      <div
                        key={branch.id}
                        onClick={() => setSelectedBranchId(branch.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition text-left flex flex-col justify-between ${
                          isSelected
                            ? 'border-black bg-neutral-100 ring-1 ring-black'
                            : 'border-neutral-200 hover:border-neutral-400 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs sm:text-sm text-neutral-900">
                            {branch.name.replace('Pangling Hairstudio - ', '')}
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-black" />}
                        </div>
                        <p className="text-[11px] text-neutral-500 line-clamp-2">{branch.address}</p>
                        <div className="mt-2 pt-1 border-t border-neutral-100 flex items-center justify-between text-[10px] text-neutral-400">
                          <span>{branch.openTime} - {branch.closeTime} WIB</span>
                          <span className="text-black font-semibold">Aktif</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Kategori Filter Layanan */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Scissors className="w-3.5 h-3.5 text-black" /> 2. Pilih Layanan / Treatment
                  </label>
                  <span className="text-[11px] text-neutral-500">
                    {filteredServices.length} pilihan
                  </span>
                </div>

                <div className="flex gap-1.5 overflow-x-auto pb-1 mb-3 scrollbar-none">
                  {[
                    { id: 'all', label: 'Semua Layanan' },
                    { id: 'haircut', label: 'Haircut & Cukur' },
                    { id: 'treatment', label: 'Treatment & Perm' },
                    { id: 'styling', label: 'Styling & Catok' },
                    { id: 'grooming', label: 'Grooming & Facial' },
                  ].map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                        activeCategory === cat.id
                          ? 'bg-black text-white shadow-sm'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border border-neutral-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* List Layanan */}
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {filteredServices.map(service => {
                    const isSelected = selectedServiceId === service.id;
                    return (
                      <div
                        key={service.id}
                        onClick={() => setSelectedServiceId(service.id)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'border-black bg-neutral-100 ring-1 ring-black'
                            : 'border-neutral-200 hover:border-neutral-400 bg-white'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-neutral-900 truncate">
                              {service.name}
                            </h4>
                            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-700 border border-neutral-300">
                              {service.category}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1">
                            {service.description}
                          </p>
                          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-neutral-600 font-medium">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-black" /> {service.durationMinutes} Menit
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-sm font-black text-black">
                            {service.isPriceStartingFrom ? 'Mulai ' : ''}Rp{' '}
                            {service.price.toLocaleString('id-ID')}
                          </div>
                          <div
                            className={`w-5 h-5 rounded-full border mt-1.5 ml-auto flex items-center justify-center ${
                              isSelected
                                ? 'bg-black border-black text-white'
                                : 'border-neutral-300'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 2: PILIH BARBER (WITH PHOTOS) & TANGGAL ================= */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Pilihan Barber */}
              <div>
                <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-black" /> Pilih Barber di {selectedBranch?.name.replace('Pangling Hairstudio - ', '')}
                </label>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {/* Option: Any Barber */}
                  <div
                    onClick={() => setSelectedBarberId('any')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                      selectedBarberId === 'any'
                        ? 'border-black bg-neutral-100 ring-1 ring-black'
                        : 'border-neutral-200 hover:border-neutral-400 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm shrink-0">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-sm text-neutral-900">
                            Barber yang Tersedia
                          </h4>
                          <span className="bg-neutral-200 text-black text-[10px] font-bold px-1.5 py-0.5 rounded border border-neutral-300">
                            Rekomendasi Cepat
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          Sistem akan memilihkan barber aktif dengan jadwal paling pas
                        </p>
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        selectedBarberId === 'any'
                          ? 'bg-black border-black text-white'
                          : 'border-neutral-300'
                      }`}
                    >
                      {selectedBarberId === 'any' && <Check className="w-3 h-3" />}
                    </div>
                  </div>

                  {/* Specific Barbers with Photo Profil */}
                  {branchBarbers.map(barber => {
                    const isSelected = selectedBarberId === barber.id;
                    return (
                      <div
                        key={barber.id}
                        onClick={() => setSelectedBarberId(barber.id)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                          isSelected
                            ? 'border-black bg-neutral-100 ring-1 ring-black'
                            : 'border-neutral-200 hover:border-neutral-400 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {barber.photoUrl ? (
                            <img
                              src={barber.photoUrl}
                              alt={barber.name}
                              className="w-12 h-12 rounded-full object-cover border-2 border-neutral-300 shrink-0 shadow-sm"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-neutral-100 border border-neutral-300 text-neutral-900 flex items-center justify-center font-bold text-sm shrink-0">
                              {barber.name.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <h4 className="font-bold text-sm text-neutral-900">{barber.name}</h4>
                            <p className="text-xs text-neutral-500 mt-0.5">{barber.specialties}</p>
                            <span className="text-[10px] text-neutral-400">
                              Jam Kerja: {barber.workStart} - {barber.workEnd} WIB
                            </span>
                          </div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? 'bg-black border-black text-white'
                              : 'border-neutral-300'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pilihan Tanggal */}
              <div>
                <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-black" /> Pilih Tanggal Kunjungan
                </label>
                <input
                  type="date"
                  min={todayStr}
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-black focus:border-black outline-none text-neutral-900 text-sm font-medium bg-neutral-50"
                />
                <p className="text-[11px] text-neutral-500 mt-1">
                  Zona waktu: Asia/Jakarta (WIB). Jadwal dihitung secara otomatis.
                </p>
              </div>
            </div>
          )}

          {/* ================= STEP 3: PILIH JAM ================= */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 text-xs flex justify-between items-center">
                <div>
                  <span className="text-neutral-500 block">Jadwal untuk:</span>
                  <strong className="text-neutral-900 text-sm">
                    {new Date(selectedDate).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </strong>
                </div>
                <div className="text-right">
                  <span className="text-neutral-500 block">Durasi Layanan:</span>
                  <strong className="text-black text-sm">
                    {selectedService.durationMinutes} Menit
                  </strong>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-black" /> Pilih Slot Jam Tersedia
                </label>

                {loadingSlots ? (
                  <div className="text-center py-10 space-y-2">
                    <div className="w-8 h-8 border-3 border-black border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs text-neutral-500">
                      Memeriksa ketersediaan jadwal barber secara real-time...
                    </p>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="text-center py-10 px-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                    <AlertCircle className="w-8 h-8 text-neutral-400 mx-auto" />
                    <p className="text-sm font-bold text-neutral-800">
                      Tidak Ada Slot Tersedia pada Tanggal Ini
                    </p>
                    <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                      Semua jadwal barber pada tanggal ini sudah penuh atau sedang dalam jam istirahat. Silakan pilih tanggal lain.
                    </p>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="mt-3 px-4 py-2 bg-black text-white text-xs font-semibold rounded-lg hover:bg-neutral-800"
                    >
                      Ganti Tanggal / Barber
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-64 overflow-y-auto pr-1">
                    {availableSlots.map(slot => {
                      const isSelected = selectedSlot?.time === slot.time;
                      return (
                        <button
                          key={slot.time}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center ${
                            isSelected
                              ? 'bg-black text-white border-black shadow-md scale-[1.02]'
                              : 'bg-white hover:border-black border-neutral-200 text-neutral-900'
                          }`}
                        >
                          <span className="font-bold text-sm tracking-wide">{slot.time}</span>
                          <span
                            className={`text-[10px] mt-0.5 ${
                              isSelected ? 'text-neutral-300' : 'text-neutral-400'
                            }`}
                          >
                            s/d {slot.endTime}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {selectedSlot && (
                <div className="p-3 bg-neutral-100 border border-neutral-300 rounded-xl text-xs text-neutral-900 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-black" />
                    <span>
                      Slot Terpilih: <strong>{selectedSlot.time} - {selectedSlot.endTime} WIB</strong>
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-black">Tersedia</span>
                </div>
              )}
            </div>
          )}

          {/* ================= STEP 4: DATA DIRI & KONFIRMASI ================= */}
          {step === 4 && (
            <form onSubmit={handleSubmitBooking} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1.5">
                  Nama Lengkap Pelanggan *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="Contoh: Muhammad Rizky"
                  maxLength={100}
                  className="w-full p-3 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-black outline-none text-sm text-neutral-900 bg-neutral-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1.5">
                  Nomor WhatsApp Aktif *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    placeholder="Contoh: 085712345678"
                    maxLength={20}
                    className="w-full pl-10 pr-3 py-3 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-black outline-none text-sm text-neutral-900 bg-neutral-50"
                  />
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Setelah booking, Anda akan diarahkan ke halaman pembayaran QRIS resmi.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1.5">
                  Catatan Tambahan (Opsional)
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={2}
                  maxLength={500}
                  placeholder="Misal: Ingin konsultasi potongan French Crop atau model rambut Korea"
                  className="w-full p-3 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-black outline-none text-sm text-neutral-900 bg-neutral-50"
                />
              </div>

              {/* Order Summary Box */}
              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-2 text-xs text-neutral-700">
                <div className="font-bold text-neutral-900 pb-1.5 border-b border-neutral-200 uppercase tracking-wider text-[11px] flex justify-between">
                  <span>Ringkasan Booking</span>
                  <span className="text-black font-mono">SLOT LOCKED</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Cabang:</span>
                  <strong className="text-neutral-900">{selectedBranch.name}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Layanan:</span>
                  <strong className="text-neutral-900">{selectedService.name}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Barber:</span>
                  <strong className="text-neutral-900">
                    {selectedBarberId === 'any' ? 'Barber Tersedia (Auto-assign)' : (selectedBarber?.name || 'Barber Pangling')}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Jadwal:</span>
                  <strong className="text-neutral-900">
                    {selectedDate} @ {selectedSlot?.time} - {selectedSlot?.endTime} WIB
                  </strong>
                </div>
                <div className="flex justify-between pt-1 border-t border-neutral-200 text-sm">
                  <span className="font-bold text-neutral-900">Total Biaya:</span>
                  <span className="font-black text-black">
                    {selectedService.isPriceStartingFrom ? 'Mulai ' : ''}Rp{' '}
                    {selectedService.price.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </form>
          )}

          {/* ================= STEP 5: HALAMAN PEMBAYARAN QRIS RESMI ================= */}
          {step === 5 && confirmedBooking && (
            <div className="text-center space-y-5 py-1">
              <div>
                <span
                  className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 ${
                    isPaymentConfirmed || confirmedBooking.status === 'pending_payment'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-black text-white'
                  }`}
                >
                  {isPaymentConfirmed || confirmedBooking.status === 'pending_payment' ? (
                    <>
                      <Clock className="w-3.5 h-3.5" /> Menunggu Verifikasi Pembayaran
                    </>
                  ) : (
                    <>
                      <QrCode className="w-3.5 h-3.5" /> Pembayaran QRIS Resmi
                    </>
                  )}
                </span>

                <h3 className="font-serif text-2xl font-black text-neutral-950 mt-2">
                  {isPaymentConfirmed || confirmedBooking.status === 'pending_payment'
                    ? 'Pembayaran Sedang Diverifikasi'
                    : 'Halaman Pembayaran'}
                </h3>

                <p className="text-xs text-neutral-600 mt-1 max-w-md mx-auto">
                  Kode Booking: <strong className="font-mono text-black text-sm">{confirmedBooking.bookingCode}</strong>
                </p>
              </div>

              {/* Total Tagihan Box */}
              <div className="bg-neutral-100 border border-neutral-300 p-4 rounded-2xl max-w-md mx-auto flex items-center justify-between">
                <div className="text-left">
                  <span className="text-[11px] text-neutral-500 uppercase font-bold block">
                    Jumlah yang Harus Dibayar
                  </span>
                  <span className="text-xs text-neutral-700">{confirmedBooking.serviceName}</span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-black">
                  Rp {confirmedBooking.servicePrice.toLocaleString('id-ID')}
                </div>
              </div>

              {/* QRIS Image Display Card - High Resolution & Clear Scan */}
              <div className="bg-white border-2 border-black p-4 sm:p-5 rounded-2xl max-w-sm mx-auto shadow-md space-y-3">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-neutral-200">
                  <span className="font-bold text-neutral-800">QRIS PANGLING HAIRSTUDIO</span>
                  <span className="text-[10px] text-neutral-500">NMID: ID1026609692847</span>
                </div>

                {/* QRIS Official Image */}
                <div className="relative overflow-hidden rounded-xl bg-neutral-50 border border-neutral-200 p-2">
                  <img
                    src={QRIS_IMAGE_URL}
                    alt="QRIS Resmi Pangling Hairstudio"
                    className="w-full max-w-[280px] mx-auto object-contain rounded-lg"
                  />
                </div>

                {/* Wajib Instruksi sesuai permintaan */}
                <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-left text-xs space-y-1">
                  <p className="font-semibold text-neutral-900 flex items-start gap-1.5">
                    <span className="font-bold text-black">•</span>
                    <span>
                      Scan QRIS menggunakan aplikasi pembayaran Anda, lalu masukkan nominal sesuai total pembayaran (<strong>Rp {confirmedBooking.servicePrice.toLocaleString('id-ID')}</strong>).
                    </span>
                  </p>
                  <p className="text-[11px] text-neutral-500 pt-0.5">
                    Mendukung GoPay, BCA, Mandiri, BNI, BRI, DANA, OVO, LinkAja, dan m-Banking lainnya.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="max-w-md mx-auto space-y-3 pt-1">
                {!isPaymentConfirmed && confirmedBooking.status !== 'pending_payment' ? (
                  <button
                    type="button"
                    disabled={updatingPayment}
                    onClick={handleConfirmPayment}
                    className="w-full py-4 px-6 bg-black hover:bg-neutral-800 disabled:bg-neutral-400 text-white font-bold text-sm rounded-xl transition shadow-xl active:scale-[0.99] flex items-center justify-center gap-2"
                  >
                    {updatingPayment ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Menyimpan Status Pembayaran...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-white" />
                        Saya Sudah Bayar
                      </>
                    )}
                  </button>
                ) : (
                  <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-xl text-left text-xs text-emerald-900 space-y-1">
                    <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
                      <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                      Status: Menunggu Verifikasi Pembayaran
                    </div>
                    <p className="text-xs text-emerald-800">
                      Terima kasih! Pembayaran Anda telah dicatat di sistem dan sedang diverifikasi oleh kasir.
                    </p>
                  </div>
                )}

                {/* WhatsApp Button */}
                <a
                  href={`https://wa.me/${OFFICIAL_WA}?text=${encodeURIComponent(
                    `Halo Pangling Hairstudio, saya telah melakukan pembayaran QRIS untuk booking ${confirmedBooking.bookingCode} atas nama ${confirmedBooking.customerName} sebesar Rp ${confirmedBooking.servicePrice.toLocaleString('id-ID')}. Mohon diverifikasi. Terima kasih!`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 bg-white hover:bg-neutral-50 text-neutral-900 border-2 border-black font-bold text-xs sm:text-sm rounded-xl transition shadow flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 text-black" />
                  Kirim Bukti Pembayaran ke WhatsApp (0857-3538-2159)
                </a>

                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full py-2.5 text-xs font-semibold text-neutral-600 hover:text-black transition"
                >
                  Selesai & Tutup Jendela
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        {step < 5 && (
          <div className="bg-neutral-50 px-5 py-3.5 border-t border-neutral-200 flex items-center justify-between shrink-0">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 text-xs font-semibold text-neutral-800 bg-white border border-neutral-300 rounded-xl hover:bg-neutral-100 transition flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Kembali
              </button>
            ) : (
              <div />
            )}

            {step === 1 && (
              <button
                type="button"
                disabled={!selectedBranchId || !selectedServiceId}
                onClick={() => setStep(2)}
                className="px-6 py-2.5 text-xs sm:text-sm font-bold bg-black hover:bg-neutral-800 disabled:bg-neutral-300 text-white rounded-xl transition flex items-center gap-1.5 shadow"
              >
                Pilih Barber & Tanggal <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {step === 2 && (
              <button
                type="button"
                disabled={!selectedDate}
                onClick={() => setStep(3)}
                className="px-6 py-2.5 text-xs sm:text-sm font-bold bg-black hover:bg-neutral-800 disabled:bg-neutral-300 text-white rounded-xl transition flex items-center gap-1.5 shadow"
              >
                Cari Jam Tersedia <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {step === 3 && (
              <button
                type="button"
                disabled={!selectedSlot}
                onClick={() => setStep(4)}
                className="px-6 py-2.5 text-xs sm:text-sm font-bold bg-black hover:bg-neutral-800 disabled:bg-neutral-300 text-white rounded-xl transition flex items-center gap-1.5 shadow"
              >
                Lanjut Isi Data Diri <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {step === 4 && (
              <button
                type="button"
                disabled={submitting || !customerName || !customerPhone}
                onClick={handleSubmitBooking}
                className="px-7 py-2.5 text-xs sm:text-sm font-bold bg-black hover:bg-neutral-800 disabled:bg-neutral-300 text-white rounded-xl transition flex items-center gap-2 shadow-lg"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Mengunci Jadwal & Menyiapkan QRIS...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-white" />
                    Booking & Lanjut Pembayaran QRIS
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
