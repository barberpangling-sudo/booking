import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  User,
  Scissors,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  Plus,
  Edit2,
  LogOut,
  TrendingUp,
  MessageCircle,
  Eye,
  Check,
  Building,
  DollarSign,
  CalendarCheck,
  Camera,
  Upload,
  Image as ImageIcon,
  QrCode,
} from 'lucide-react';
import { Branch, Service, Barber, Booking, BookingStatus } from '../types';
import {
  getAllBookingsForAdmin,
  updateBookingStatus,
  saveBranch,
  saveService,
  saveBarber,
  generateWhatsAppLink,
  compressAndResizeImage,
} from '../lib/bookingService';

interface AdminDashboardProps {
  branches: Branch[];
  services: Service[];
  barbers: Barber[];
  onRefreshData: () => Promise<void>;
  onLogout: () => void;
  onBackToCustomerView: () => void;
  adminEmail: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  branches,
  services,
  barbers,
  onRefreshData,
  onLogout,
  onBackToCustomerView,
  adminEmail,
}) => {
  // Navigation tabs in Admin
  const [activeTab, setActiveTab] = useState<'bookings' | 'branches' | 'services' | 'barbers' | 'schedule'>('bookings');

  // Bookings list state
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [filterBranch, setFilterBranch] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [filterBarber, setFilterBarber] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals for CRUD
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingBarber, setEditingBarber] = useState<Barber | null>(null);
  const [isCompressingPhoto, setIsCompressingPhoto] = useState(false);
  const [photoCompressionInfo, setPhotoCompressionInfo] = useState<{ originalMb: number; compressedKb: number } | null>(null);

  // Load bookings
  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await getAllBookingsForAdmin();
      setBookings(data);
    } catch (err) {
      console.error('Error loading admin bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  // Update status handler
  const handleStatusChange = async (bookingId: string, newStatus: BookingStatus) => {
    try {
      await updateBookingStatus(bookingId, newStatus);
      // Optimistically update local view
      setBookings(prev =>
        prev.map(b => (b.id === bookingId || b.bookingCode === bookingId ? { ...b, status: newStatus } : b))
      );
    } catch (err) {
      console.error('Error changing booking status:', err);
    }
  };

  // Filtered bookings
  const filteredBookings = bookings.filter(b => {
    if (filterBranch !== 'all' && b.branchId !== filterBranch) return false;
    if (filterDate && b.date !== filterDate) return false;
    if (filterBarber !== 'all' && b.barberId !== filterBarber) return false;
    if (filterStatus !== 'all' && b.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = b.customerName?.toLowerCase().includes(q);
      const matchPhone = b.customerPhone?.includes(q);
      const matchCode = b.bookingCode?.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchCode) return false;
    }
    return true;
  });

  // Analytics Metrics
  const todayStr = new Date().toISOString().split('T')[0];
  const todayBookings = bookings.filter(b => b.date === todayStr);
  const completedBookings = bookings.filter(b => b.status === 'completed');
  const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.servicePrice || 0), 0);
  const activeConfirmed = bookings.filter(b => b.status === 'confirmed');
  const pendingPaymentBookings = bookings.filter(b => b.status === 'pending_payment');

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 pb-16">
      {/* Top Admin Header - Black & White */}
      <header className="bg-black text-white px-4 sm:px-8 py-4 shadow-md sticky top-0 z-30 border-b border-neutral-800">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center font-bold shadow">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-lg sm:text-xl font-bold tracking-wide">
                  PANGLING HAIRSTUDIO DASHBOARD
                </h1>
                <span className="text-[10px] bg-white text-black font-bold px-2 py-0.5 rounded">
                  ADMIN AKTIF
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Login sebagai: <span className="text-white font-mono font-semibold">{adminEmail}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onBackToCustomerView}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 transition flex items-center gap-1.5"
            >
              <Eye className="w-4 h-4 text-white" />
              Lihat Website Pelanggan
            </button>
            <button
              onClick={onLogout}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-red-600 hover:bg-red-700 text-white transition flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              Keluar
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="container mx-auto flex gap-2 overflow-x-auto pt-4 border-t border-neutral-800 mt-4 scrollbar-none">
          {[
            { id: 'bookings', label: 'Daftar Booking & Antrean', icon: CalendarCheck },
            { id: 'schedule', label: 'Jadwal Harian Barber', icon: Clock },
            { id: 'branches', label: 'Kelola Cabang', icon: Building },
            { id: 'services', label: 'Layanan & Tarif', icon: DollarSign },
            { id: 'barbers', label: 'Daftar Barber', icon: User },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-black shadow'
                    : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800 border border-neutral-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Body */}
      <main className="container mx-auto px-4 sm:px-8 py-6 space-y-6">
        {/* ================= TAB 1: BOOKINGS LIST ================= */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 font-bold uppercase">Booking Hari Ini</span>
                  <div className="text-xl sm:text-2xl font-black text-stone-900">{todayBookings.length}</div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/40 shadow-sm flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-amber-800 font-bold uppercase">Cek QRIS Masuk</span>
                  <div className="text-xl sm:text-2xl font-black text-amber-800">{pendingPaymentBookings.length}</div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 font-bold uppercase">Aktif Confirmed</span>
                  <div className="text-xl sm:text-2xl font-black text-emerald-700">{activeConfirmed.length}</div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center shrink-0">
                  <Scissors className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 font-bold uppercase">Selesai (Completed)</span>
                  <div className="text-xl sm:text-2xl font-black text-stone-900">{completedBookings.length}</div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-3 col-span-2 lg:col-span-1">
                <div className="w-11 h-11 rounded-xl bg-stone-900 text-white flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 font-bold uppercase">Estimasi Omset</span>
                  <div className="text-base sm:text-lg font-black text-black">
                    Rp {totalRevenue.toLocaleString('id-ID')}
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#c5a059]" />
                  <span className="font-bold text-xs uppercase tracking-wider text-stone-700">
                    Filter Antrean Booking
                  </span>
                </div>
                <button
                  onClick={loadBookings}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition flex items-center gap-1"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  Muat Ulang
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Cari Tamu / Kode</label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Nama / WA / Kode"
                      className="w-full pl-8 pr-2 py-1.5 text-xs border rounded-lg focus:ring-1 focus:ring-[#103927] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Cabang</label>
                  <select
                    value={filterBranch}
                    onChange={e => setFilterBranch(e.target.value)}
                    className="w-full p-1.5 text-xs border rounded-lg focus:ring-1 focus:ring-[#103927] outline-none"
                  >
                    <option value="all">Semua Cabang</option>
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name.replace('Pangling Hairstudio - ', '')}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={filterDate}
                    onChange={e => setFilterDate(e.target.value)}
                    className="w-full p-1.5 text-xs border rounded-lg focus:ring-1 focus:ring-[#103927] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Barber</label>
                  <select
                    value={filterBarber}
                    onChange={e => setFilterBarber(e.target.value)}
                    className="w-full p-1.5 text-xs border rounded-lg focus:ring-1 focus:ring-[#103927] outline-none"
                  >
                    <option value="all">Semua Barber</option>
                    {barbers.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Status</label>
                  <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    className="w-full p-1.5 text-xs border rounded-lg focus:ring-1 focus:ring-[#103927] outline-none"
                  >
                    <option value="all">Semua Status</option>
                    <option value="pending_payment">Menunggu Verifikasi QRIS</option>
                    <option value="confirmed">Confirmed (Aktif)</option>
                    <option value="completed">Completed (Selesai)</option>
                    <option value="cancelled">Cancelled (Batal)</option>
                    <option value="no-show">No-Show (Tidak Hadir)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-stone-200 flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
                  Daftar Pesanan ({filteredBookings.length} data ditemukan)
                </span>
                {filterDate && (
                  <button
                    onClick={() => setFilterDate('')}
                    className="text-xs text-[#103927] hover:underline"
                  >
                    Reset Filter Tanggal
                  </button>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-stone-50 text-stone-600 uppercase tracking-wider border-b border-stone-200">
                      <th className="p-3.5 font-bold">Kode</th>
                      <th className="p-3.5 font-bold">Pelanggan</th>
                      <th className="p-3.5 font-bold">Layanan</th>
                      <th className="p-3.5 font-bold">Barber</th>
                      <th className="p-3.5 font-bold">Cabang</th>
                      <th className="p-3.5 font-bold">Jadwal (WIB)</th>
                      <th className="p-3.5 font-bold">Status</th>
                      <th className="p-3.5 font-bold text-center">Kelola Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {loading ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-stone-500">
                          Memuat data booking...
                        </td>
                      </tr>
                    ) : filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-stone-400">
                          Tidak ada pesanan yang sesuai dengan filter.
                        </td>
                      </tr>
                    ) : (
                      filteredBookings.map(b => (
                        <tr key={b.id || b.bookingCode} className="hover:bg-stone-50 transition">
                          <td className="p-3.5 font-mono font-bold text-[#103927] whitespace-nowrap">
                            {b.bookingCode}
                          </td>
                          <td className="p-3.5">
                            <div className="font-bold text-stone-900">{b.customerName}</div>
                            <div className="flex items-center gap-1 text-[11px] text-stone-500">
                              <span>{b.customerPhone}</span>
                              <a
                                href={`https://wa.me/${b.customerPhone.replace(/\D/g, '')}?text=Halo%20${encodeURIComponent(b.customerName)}%2C%20kami%20dari%20Pangling%20Hairstudio...`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-600 hover:text-emerald-800"
                                title="Chat WhatsApp Tamu"
                              >
                                <MessageCircle className="w-3.5 h-3.5 inline" />
                              </a>
                            </div>
                            {b.notes && (
                              <p className="text-[10px] text-stone-500 italic mt-0.5 max-w-xs truncate">
                                Catatan: {b.notes}
                              </p>
                            )}
                          </td>
                          <td className="p-3.5">
                            <div className="font-semibold text-stone-800">{b.serviceName}</div>
                            <div className="text-[11px] text-stone-500">
                              Rp {b.servicePrice?.toLocaleString('id-ID')}
                            </div>
                          </td>
                          <td className="p-3.5 font-medium text-stone-800">
                            {b.barberName}
                          </td>
                          <td className="p-3.5 text-stone-600 whitespace-nowrap">
                            {b.branchName?.replace('Pangling Hairstudio - ', '')}
                          </td>
                          <td className="p-3.5 whitespace-nowrap">
                            <div className="font-semibold text-stone-800">{b.date}</div>
                            <div className="text-[11px] text-[#103927] font-bold">
                              {b.startTime} - {b.endTime} WIB
                            </div>
                          </td>
                          <td className="p-3.5">
                            {b.status === 'pending_payment' ? (
                              <div className="flex flex-col gap-0.5">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                                  Verifikasi QRIS
                                </span>
                                <span className="text-[9px] text-amber-700 font-semibold">Sudah bayar via QRIS</span>
                              </div>
                            ) : (
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  b.status === 'confirmed'
                                    ? 'bg-blue-100 text-blue-800'
                                    : b.status === 'completed'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : b.status === 'cancelled'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-stone-200 text-stone-800'
                                }`}
                              >
                                {b.status}
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              {b.status === 'pending_payment' && (
                                <button
                                  onClick={() => handleStatusChange(b.id || b.bookingCode, 'confirmed')}
                                  className="px-2.5 py-1 bg-black hover:bg-neutral-800 text-white rounded text-[10px] font-bold transition flex items-center gap-1 shadow"
                                  title="Verifikasi Pembayaran & Setujui Booking"
                                >
                                  <Check className="w-3 h-3 text-white" />
                                  Verifikasi Lunas
                                </button>
                              )}
                              {b.status !== 'completed' && b.status !== 'pending_payment' && (
                                <button
                                  onClick={() => handleStatusChange(b.id || b.bookingCode, 'completed')}
                                  className="px-2 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[10px] font-semibold transition"
                                  title="Tandai Selesai"
                                >
                                  Selesai
                                </button>
                              )}
                              {b.status !== 'no-show' && (
                                <button
                                  onClick={() => handleStatusChange(b.id || b.bookingCode, 'no-show')}
                                  className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[10px] font-semibold transition"
                                  title="Tandai Tidak Hadir"
                                >
                                  No-Show
                                </button>
                              )}
                              {b.status !== 'cancelled' && (
                                <button
                                  onClick={() => handleStatusChange(b.id || b.bookingCode, 'cancelled')}
                                  className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[10px] font-semibold transition"
                                  title="Batalkan Booking"
                                >
                                  Batal
                                </button>
                              )}
                              {b.status !== 'confirmed' && b.status !== 'pending_payment' && (
                                <button
                                  onClick={() => handleStatusChange(b.id || b.bookingCode, 'confirmed')}
                                  className="px-2 py-1 bg-stone-600 hover:bg-stone-700 text-white rounded text-[10px] font-semibold transition"
                                  title="Aktifkan Kembali"
                                >
                                  Aktif
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: JADWAL HARIAN BARBER ================= */}
        {activeTab === 'schedule' && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-200">
              <div>
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  Visual Timeline Jadwal Barber
                </h3>
                <p className="text-xs text-stone-500">
                  Pantau kepadatan slot antrean masing-masing barber per tanggal
                </p>
              </div>

              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-stone-600 uppercase">Pilih Tanggal:</label>
                <input
                  type="date"
                  value={filterDate || todayStr}
                  onChange={e => setFilterDate(e.target.value)}
                  className="p-2 border rounded-xl text-xs font-semibold focus:ring-1 focus:ring-[#103927] outline-none"
                />
              </div>
            </div>

            <div className="space-y-4">
              {barbers.map(barber => {
                const targetDate = filterDate || todayStr;
                const barberBookings = bookings.filter(
                  b => b.barberId === barber.id && b.date === targetDate && b.status === 'confirmed'
                );

                return (
                  <div key={barber.id} className="border border-stone-200 rounded-xl p-4 bg-stone-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#103927] text-[#c5a059] flex items-center justify-center font-bold text-xs">
                          {barber.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-stone-900">{barber.name}</h4>
                          <p className="text-[11px] text-stone-500">
                            Jam Kerja: {barber.workStart} - {barber.workEnd} WIB • Istirahat: {barber.breakStart || '12:00'} - {barber.breakEnd || '13:00'} WIB
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-[#103927] bg-[#103927]/10 px-2.5 py-1 rounded-full">
                        {barberBookings.length} Slot Terisi
                      </span>
                    </div>

                    {/* Timeline Chips */}
                    {barberBookings.length === 0 ? (
                      <p className="text-xs text-stone-400 italic">
                        Belum ada pesanan aktif untuk {barber.name} pada {targetDate}.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {barberBookings.map(bk => (
                          <div
                            key={bk.id || bk.bookingCode}
                            className="p-2 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs flex flex-col"
                          >
                            <span className="font-bold">{bk.startTime} - {bk.endTime} WIB</span>
                            <span className="text-[11px]">{bk.customerName} ({bk.serviceName})</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= TAB 3: KELOLA CABANG ================= */}
        {activeTab === 'branches' && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <div>
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  Kelola Cabang Pangling Hairstudio
                </h3>
                <p className="text-xs text-stone-500">
                  Tambah, ubah nama, alamat, nomor WhatsApp, atau jam operasional cabang tanpa menyentuh kode.
                </p>
              </div>
              <button
                onClick={() =>
                  setEditingBranch({
                    id: 'cabang-' + Date.now(),
                    name: 'Pangling Hairstudio - Cabang Baru',
                    address: 'Alamat lengkap cabang di Kab. Tegal',
                    whatsapp: '6285712345678',
                    openTime: '10:00',
                    closeTime: '21:00',
                    slotIntervalMin: 30,
                    isActive: true,
                  })
                }
                className="px-4 py-2 bg-[#103927] hover:bg-[#154734] text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow"
              >
                <Plus className="w-4 h-4 text-[#c5a059]" />
                Tambah Cabang
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {branches.map(branch => (
                <div
                  key={branch.id}
                  className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          branch.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                        }`}
                      >
                        {branch.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                      <button
                        onClick={() => setEditingBranch(branch)}
                        className="p-1 text-stone-500 hover:text-[#103927]"
                        title="Edit Cabang"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>

                    <h4 className="font-bold text-stone-900 mt-2">{branch.name}</h4>
                    <p className="text-xs text-stone-600 mt-1">{branch.address}</p>
                    <p className="text-xs text-stone-500 mt-1">WA: <strong>{branch.whatsapp}</strong></p>
                    <p className="text-xs text-stone-500">Jam: <strong>{branch.openTime} - {branch.closeTime} WIB</strong></p>
                  </div>

                  <button
                    onClick={() => setEditingBranch(branch)}
                    className="w-full py-1.5 text-xs font-semibold text-[#103927] border border-[#103927]/30 rounded-lg hover:bg-[#103927]/5"
                  >
                    Edit Data Cabang
                  </button>
                </div>
              ))}
            </div>

            {/* Modal Edit Branch */}
            {editingBranch && (
              <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
                  <h4 className="font-bold text-lg text-stone-900">Edit / Tambah Cabang</h4>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="font-bold text-stone-700 block mb-1">Nama Cabang</label>
                      <input
                        type="text"
                        value={editingBranch.name}
                        onChange={e => setEditingBranch({ ...editingBranch, name: e.target.value })}
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-stone-700 block mb-1">Alamat Lengkap</label>
                      <textarea
                        value={editingBranch.address}
                        onChange={e => setEditingBranch({ ...editingBranch, address: e.target.value })}
                        className="w-full p-2 border rounded-lg"
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="font-bold text-stone-700 block mb-1">Nomor WhatsApp Cabang</label>
                      <input
                        type="text"
                        value={editingBranch.whatsapp}
                        onChange={e => setEditingBranch({ ...editingBranch, whatsapp: e.target.value })}
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-bold text-stone-700 block mb-1">Jam Buka</label>
                        <input
                          type="text"
                          value={editingBranch.openTime}
                          onChange={e => setEditingBranch({ ...editingBranch, openTime: e.target.value })}
                          className="w-full p-2 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-stone-700 block mb-1">Jam Tutup</label>
                        <input
                          type="text"
                          value={editingBranch.closeTime}
                          onChange={e => setEditingBranch({ ...editingBranch, closeTime: e.target.value })}
                          className="w-full p-2 border rounded-lg"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="checkbox"
                        id="branchActive"
                        checked={editingBranch.isActive}
                        onChange={e => setEditingBranch({ ...editingBranch, isActive: e.target.checked })}
                        className="rounded"
                      />
                      <label htmlFor="branchActive" className="font-bold text-stone-700">
                        Status Cabang Aktif Menerima Booking
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <button
                      onClick={() => setEditingBranch(null)}
                      className="px-4 py-2 border rounded-xl text-xs font-semibold"
                    >
                      Batal
                    </button>
                    <button
                      onClick={async () => {
                        await saveBranch(editingBranch);
                        await onRefreshData();
                        setEditingBranch(null);
                      }}
                      className="px-4 py-2 bg-[#103927] text-white rounded-xl text-xs font-bold"
                    >
                      Simpan Cabang
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 4: LAYANAN & TARIF ================= */}
        {activeTab === 'services' && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <div>
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  Kelola Layanan, Tarif & Durasi
                </h3>
                <p className="text-xs text-stone-500">
                  Sesuaikan nama treatment, harga (termasuk label mulai dari), durasi pengerjaan, dan status aktif.
                </p>
              </div>
              <button
                onClick={() =>
                  setEditingService({
                    id: 'srv-' + Date.now(),
                    name: 'Layanan Baru',
                    category: 'haircut',
                    price: 50000,
                    isPriceStartingFrom: false,
                    durationMinutes: 45,
                    description: 'Deskripsi layanan baru.',
                    isActive: true,
                  })
                }
                className="px-4 py-2 bg-[#103927] hover:bg-[#154734] text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow"
              >
                <Plus className="w-4 h-4 text-[#c5a059]" />
                Tambah Layanan
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {services.map(service => (
                <div
                  key={service.id}
                  className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-2 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-stone-200 text-stone-700">
                        {service.category}
                      </span>
                      <button
                        onClick={() => setEditingService(service)}
                        className="p-1 text-stone-500 hover:text-[#103927]"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>

                    <h4 className="font-bold text-stone-900 mt-2">{service.name}</h4>
                    <p className="text-xs text-stone-600 line-clamp-2">{service.description}</p>
                    <div className="mt-2 text-xs">
                      <span className="text-stone-400 block">Tarif & Durasi:</span>
                      <strong className="text-[#103927]">
                        {service.isPriceStartingFrom ? 'Mulai ' : ''}Rp {service.price.toLocaleString('id-ID')}
                      </strong>{' '}
                      • <span>{service.durationMinutes} Menit</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setEditingService(service)}
                    className="w-full py-1.5 text-xs font-semibold text-[#103927] border border-[#103927]/30 rounded-lg hover:bg-[#103927]/5"
                  >
                    Edit Tarif & Durasi
                  </button>
                </div>
              ))}
            </div>

            {/* Modal Edit Service */}
            {editingService && (
              <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
                  <h4 className="font-bold text-lg text-stone-900">Edit / Tambah Layanan</h4>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="font-bold text-stone-700 block mb-1">Nama Layanan</label>
                      <input
                        type="text"
                        value={editingService.name}
                        onChange={e => setEditingService({ ...editingService, name: e.target.value })}
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-stone-700 block mb-1">Kategori</label>
                      <select
                        value={editingService.category}
                        onChange={e => setEditingService({ ...editingService, category: e.target.value as any })}
                        className="w-full p-2 border rounded-lg"
                      >
                        <option value="haircut">Haircut</option>
                        <option value="treatment">Treatment (Keratin / Perm / Color)</option>
                        <option value="styling">Styling & Catok</option>
                        <option value="grooming">Grooming & Facial</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-bold text-stone-700 block mb-1">Harga (Rp)</label>
                        <input
                          type="number"
                          value={editingService.price}
                          onChange={e => setEditingService({ ...editingService, price: Number(e.target.value) })}
                          className="w-full p-2 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-stone-700 block mb-1">Durasi (Menit)</label>
                        <input
                          type="number"
                          value={editingService.durationMinutes}
                          onChange={e => setEditingService({ ...editingService, durationMinutes: Number(e.target.value) })}
                          className="w-full p-2 border rounded-lg"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="font-bold text-stone-700 block mb-1">Deskripsi Layanan</label>
                      <textarea
                        value={editingService.description}
                        onChange={e => setEditingService({ ...editingService, description: e.target.value })}
                        className="w-full p-2 border rounded-lg"
                        rows={2}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="startFrom"
                        checked={editingService.isPriceStartingFrom}
                        onChange={e => setEditingService({ ...editingService, isPriceStartingFrom: e.target.checked })}
                      />
                      <label htmlFor="startFrom" className="font-semibold text-stone-700">
                        Harga adalah harga awal ("Mulai Rp ...")
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="serviceActive"
                        checked={editingService.isActive}
                        onChange={e => setEditingService({ ...editingService, isActive: e.target.checked })}
                      />
                      <label htmlFor="serviceActive" className="font-semibold text-stone-700">
                        Layanan Aktif Ditampilkan
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <button
                      onClick={() => setEditingService(null)}
                      className="px-4 py-2 border rounded-xl text-xs font-semibold"
                    >
                      Batal
                    </button>
                    <button
                      onClick={async () => {
                        await saveService(editingService);
                        await onRefreshData();
                        setEditingService(null);
                      }}
                      className="px-4 py-2 bg-[#103927] text-white rounded-xl text-xs font-bold"
                    >
                      Simpan Layanan
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 5: BARBERS ================= */}
        {activeTab === 'barbers' && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <div>
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  Kelola Profil & Jadwal Barber
                </h3>
                <p className="text-xs text-stone-500">
                  Atur penugasan cabang, jam kerja harian, dan jam istirahat untuk Fitron, Wawan, Bayu, Dwike, Dwiky, Baihaqi, Najid.
                </p>
              </div>
              <button
                onClick={() => {
                  setPhotoCompressionInfo(null);
                  setEditingBarber({
                    id: 'barber-' + Date.now(),
                    name: 'Barber Baru',
                    branchId: branches[0]?.id || 'slawi',
                    specialties: 'Haircut & Styling Specialist',
                    active: true,
                    workDays: [0, 1, 2, 3, 4, 5, 6],
                    workStart: '10:00',
                    workEnd: '21:00',
                    breakStart: '12:00',
                    breakEnd: '13:00',
                  });
                }}
                className="px-4 py-2 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow"
              >
                <Plus className="w-4 h-4 text-white" />
                Tambah Barber
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {barbers.map(barber => {
                const branchName = branches.find(b => b.id === barber.branchId)?.name.replace('Pangling Hairstudio - ', '');
                return (
                  <div
                    key={barber.id}
                    className="p-4 rounded-2xl border border-stone-200 bg-white space-y-3 flex flex-col justify-between shadow-sm hover:border-black/30 transition"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                        <span
                          className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                            barber.active ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                          }`}
                        >
                          {barber.active ? 'Aktif Bertugas' : 'Sedang Cuti'}
                        </span>
                        <button
                          onClick={() => {
                            setPhotoCompressionInfo(null);
                            setEditingBarber(barber);
                          }}
                          className="p-1.5 text-stone-500 hover:text-black rounded-lg hover:bg-stone-100 transition"
                          title="Edit Barber"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Barber Photo & Name */}
                      <div className="flex items-center gap-3 mt-3">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0 flex items-center justify-center shadow-inner">
                          {barber.photoUrl ? (
                            <img
                              src={barber.photoUrl}
                              alt={barber.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-6 h-6 text-stone-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-base text-stone-900 truncate">{barber.name}</h4>
                          <p className="text-xs text-stone-500 font-semibold">{branchName || 'Semua Cabang'}</p>
                          <span className="text-[10px] text-emerald-700 font-medium">
                            {barber.photoUrl ? '✓ Foto Profil Terpasang' : 'Foto belum ada'}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-stone-600 line-clamp-2 mt-2 bg-stone-50 p-2 rounded-lg">
                        {barber.specialties}
                      </p>

                      <div className="text-[11px] text-stone-500 mt-2 space-y-0.5">
                        <p>Jam Kerja: <strong>{barber.workStart} - {barber.workEnd} WIB</strong></p>
                        <p>Istirahat: <strong>{barber.breakStart} - {barber.breakEnd} WIB</strong></p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setPhotoCompressionInfo(null);
                        setEditingBarber(barber);
                      }}
                      className="w-full py-2 text-xs font-bold text-black bg-stone-100 hover:bg-black hover:text-white rounded-xl transition flex items-center justify-center gap-1.5"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      Ganti Foto & Jadwal
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Modal Edit Barber */}
            {editingBarber && (
              <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-4 my-8 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                    <h4 className="font-bold text-lg text-stone-900">
                      Kelola Profil & Foto Barber: <span className="font-serif">{editingBarber.name}</span>
                    </h4>
                    <button
                      onClick={() => setEditingBarber(null)}
                      className="text-stone-400 hover:text-stone-700"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-4 text-xs">
                    {/* FOTO PROFIL SECTION */}
                    <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50 space-y-3">
                      <label className="font-bold text-stone-800 block text-xs">
                        Foto Profil Barber (Tampil di Website Pelanggan)
                      </label>

                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-stone-200 border-2 border-white shadow shrink-0 flex items-center justify-center relative group">
                          {editingBarber.photoUrl ? (
                            <img
                              src={editingBarber.photoUrl}
                              alt={editingBarber.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-8 h-8 text-stone-400" />
                          )}
                          {isCompressingPhoto && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <RefreshCw className="w-5 h-5 text-white animate-spin" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 space-y-2">
                          <div>
                            <input
                              type="file"
                              id="barberPhotoInput"
                              accept="image/*"
                              disabled={isCompressingPhoto}
                              className="hidden"
                              onChange={async e => {
                                const file = e.target.files?.[0];
                                if (!file) return;

                                // Allow up to 30 MB
                                if (file.size > 30 * 1024 * 1024) {
                                  alert('Ukuran file foto maksimal 30 MB. Silakan pilih foto dengan ukuran lebih kecil.');
                                  return;
                                }

                                setIsCompressingPhoto(true);
                                setPhotoCompressionInfo(null);

                                try {
                                  const result = await compressAndResizeImage(file, 1000, 0.85);
                                  setEditingBarber({
                                    ...editingBarber,
                                    photoUrl: result.dataUrl,
                                  });
                                  setPhotoCompressionInfo({
                                    originalMb: result.originalSizeMb,
                                    compressedKb: result.compressedSizeKb,
                                  });
                                } catch (err: any) {
                                  console.error('Error compressing image:', err);
                                  alert('Gagal memproses gambar: ' + (err.message || 'Format tidak didukung'));
                                } finally {
                                  setIsCompressingPhoto(false);
                                  // Reset input so re-selecting same file works
                                  e.target.value = '';
                                }
                              }}
                            />
                            <label
                              htmlFor="barberPhotoInput"
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${
                                isCompressingPhoto ? 'bg-neutral-400 cursor-not-allowed' : 'bg-black hover:bg-neutral-800 cursor-pointer'
                              } text-white font-bold rounded-xl text-xs shadow-sm transition`}
                            >
                              {isCompressingPhoto ? (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5 text-white animate-spin" />
                                  Mengompres Foto Besar...
                                </>
                              ) : (
                                <>
                                  <Upload className="w-3.5 h-3.5 text-white" />
                                  Upload Foto (Bisa Foto Resolusi Tinggi / HP)
                                </>
                              )}
                            </label>
                            <p className="text-[10px] text-stone-500 mt-1">
                              Mendukung foto kamera HP berukuran besar (hingga 30 MB). Otomatis dioptimalkan tajam dan ringan.
                            </p>
                          </div>

                          {photoCompressionInfo && (
                            <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 flex items-center gap-1.5 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>
                                Foto berhasil dioptimalkan: {photoCompressionInfo.originalMb} MB → {photoCompressionInfo.compressedKb} KB (Tajam & Cepat)
                              </span>
                            </div>
                          )}

                          {editingBarber.photoUrl && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingBarber({ ...editingBarber, photoUrl: '' });
                                setPhotoCompressionInfo(null);
                              }}
                              className="text-[11px] text-red-600 hover:underline block font-semibold"
                            >
                              Hapus Foto
                            </button>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                          Atau Masukkan URL Gambar (Opsional)
                        </label>
                        <input
                          type="text"
                          value={editingBarber.photoUrl || ''}
                          onChange={e => setEditingBarber({ ...editingBarber, photoUrl: e.target.value })}
                          placeholder="https://images.unsplash.com/... atau link foto lainnya"
                          className="w-full p-2 text-xs border rounded-lg bg-white outline-none focus:ring-1 focus:ring-black"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-stone-700 block mb-1">Nama Barber</label>
                      <input
                        type="text"
                        value={editingBarber.name}
                        onChange={e => setEditingBarber({ ...editingBarber, name: e.target.value })}
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-stone-700 block mb-1">Penugasan Cabang</label>
                      <select
                        value={editingBarber.branchId}
                        onChange={e => setEditingBarber({ ...editingBarber, branchId: e.target.value })}
                        className="w-full p-2 border rounded-lg"
                      >
                        {branches.map(b => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-stone-700 block mb-1">Keahlian & Spesialisasi</label>
                      <textarea
                        value={editingBarber.specialties}
                        onChange={e => setEditingBarber({ ...editingBarber, specialties: e.target.value })}
                        className="w-full p-2 border rounded-lg"
                        rows={2}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-bold text-stone-700 block mb-1">Jam Mulai Kerja</label>
                        <input
                          type="text"
                          value={editingBarber.workStart}
                          onChange={e => setEditingBarber({ ...editingBarber, workStart: e.target.value })}
                          className="w-full p-2 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-stone-700 block mb-1">Jam Selesai Kerja</label>
                        <input
                          type="text"
                          value={editingBarber.workEnd}
                          onChange={e => setEditingBarber({ ...editingBarber, workEnd: e.target.value })}
                          className="w-full p-2 border rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-bold text-stone-700 block mb-1">Mulai Istirahat</label>
                        <input
                          type="text"
                          value={editingBarber.breakStart}
                          onChange={e => setEditingBarber({ ...editingBarber, breakStart: e.target.value })}
                          className="w-full p-2 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-stone-700 block mb-1">Selesai Istirahat</label>
                        <input
                          type="text"
                          value={editingBarber.breakEnd}
                          onChange={e => setEditingBarber({ ...editingBarber, breakEnd: e.target.value })}
                          className="w-full p-2 border rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="barberActiveCheck"
                        checked={editingBarber.active}
                        onChange={e => setEditingBarber({ ...editingBarber, active: e.target.checked })}
                      />
                      <label htmlFor="barberActiveCheck" className="font-semibold text-stone-700">
                        Barber Aktif Menerima Booking
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t border-stone-200">
                    <button
                      onClick={() => setEditingBarber(null)}
                      className="px-4 py-2 border rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-100"
                    >
                      Batal
                    </button>
                    <button
                      onClick={async () => {
                        await saveBarber(editingBarber);
                        await onRefreshData();
                        setEditingBarber(null);
                      }}
                      className="px-5 py-2 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold shadow"
                    >
                      Simpan Perubahan Barber
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
