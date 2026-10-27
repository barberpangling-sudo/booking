import React, { useState } from 'react';
import { X, Search, AlertCircle, MessageCircle } from 'lucide-react';
import { Booking } from '../types';
import { lookupBooking, generateWhatsAppLink } from '../lib/bookingService';

interface LookupBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LookupBookingModal: React.FC<LookupBookingModalProps> = ({ isOpen, onClose }) => {
  const [code, setCode] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<Booking | null>(null);

  const OFFICIAL_WA = '6285735382159'; // 0857-3538-2159

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !phone.trim()) {
      setError('Mohon masukkan Kode Booking dan Nomor WhatsApp Anda.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await lookupBooking(code, phone);
      if (!data) {
        setError('Pemesanan tidak ditemukan. Pastikan Kode Booking (contoh: PLS-123456) dan Nomor WhatsApp sesuai saat mendaftar.');
      } else {
        setResult(data);
      }
    } catch (err: any) {
      console.error('Error looking up booking:', err);
      setError('Gagal mencari booking. Silakan coba kembali.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_payment':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">Menunggu Verifikasi Pembayaran</span>;
      case 'confirmed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-black text-white">Dikonfirmasi (Aktif)</span>;
      case 'completed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-neutral-200 text-black border border-neutral-300">Selesai (Completed)</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-neutral-100 text-neutral-600 line-through">Dibatalkan</span>;
      case 'no-show':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-neutral-100 text-neutral-700">Tidak Hadir (No-Show)</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-neutral-100 text-neutral-900">{status}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative bg-white text-neutral-900 w-full max-w-lg rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden">
        {/* Header - Black & White */}
        <div className="bg-black text-white px-5 py-4 flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-white" />
            <h3 className="font-serif text-lg font-bold">Cek Status Booking</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <form onSubmit={handleSearch} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Kode Booking
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                placeholder="Contoh: PLS-839210"
                className="w-full p-3 uppercase font-mono tracking-wider rounded-xl border border-neutral-300 focus:ring-2 focus:ring-black outline-none text-sm text-neutral-900 bg-neutral-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Nomor WhatsApp
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Nomor WA yang dipakai saat booking"
                className="w-full p-3 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-black outline-none text-sm text-neutral-900 bg-neutral-50"
              />
            </div>

            {/* Black button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-black hover:bg-neutral-800 disabled:bg-neutral-300 text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 shadow"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Mencari Data...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 text-white" />
                  Periksa Status Sekarang
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Search Result */}
          {result && (
            <div className="border border-neutral-300 bg-neutral-50 rounded-xl p-4 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold">
                    Kode Booking
                  </span>
                  <p className="font-mono text-lg font-black text-black">{result.bookingCode}</p>
                </div>
                <div>{getStatusBadge(result.status)}</div>
              </div>

              <div className="space-y-1.5 text-xs text-neutral-700">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Nama Tamu:</span>
                  <strong className="text-neutral-900">{result.customerName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Cabang:</span>
                  <strong className="text-neutral-900">{result.branchName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Layanan:</span>
                  <strong className="text-neutral-900">{result.serviceName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Barber:</span>
                  <strong className="text-neutral-900">{result.barberName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Jadwal:</span>
                  <strong className="text-black">{result.date} @ {result.startTime} - {result.endTime} WIB</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Biaya:</span>
                  <strong className="text-neutral-900">Rp {result.servicePrice.toLocaleString('id-ID')}</strong>
                </div>
                {result.notes && (
                  <div className="pt-1 text-[11px] text-neutral-500 italic">
                    Catatan: {result.notes}
                  </div>
                )}
              </div>

              {result.status === 'pending_payment' && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                    Menunggu Verifikasi Admin
                  </div>
                  <p className="text-[11px] text-amber-800">
                    Pembayaran via QRIS Anda sedang dicek oleh admin Pangling Hairstudio. Kirimkan bukti transfer ke WhatsApp cabang untuk percepatan konfirmasi.
                  </p>
                </div>
              )}

              <a
                href={generateWhatsAppLink(result, OFFICIAL_WA)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block w-full py-2.5 px-3 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl text-center transition flex items-center justify-center gap-1.5 shadow"
              >
                <MessageCircle className="w-4 h-4 text-white" />
                Hubungi WhatsApp Cabang (0857-3538-2159)
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
