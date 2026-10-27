import React from 'react';
import { MapPin, Phone, Clock, MessageCircle, ExternalLink, CalendarCheck } from 'lucide-react';
import { Branch } from '../types';

interface BranchesSectionProps {
  branches: Branch[];
  onOpenBookingForBranch: (branch: Branch) => void;
}

export const BranchesSection: React.FC<BranchesSectionProps> = ({
  branches,
  onOpenBookingForBranch,
}) => {
  const OFFICIAL_WA = '6285735382159'; // 0857-3538-2159

  return (
    <section id="cabang" className="py-16 sm:py-24 bg-white text-neutral-900 scroll-mt-12 border-b border-neutral-200">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-neutral-900 border border-neutral-300 text-xs font-bold uppercase tracking-wider mb-2">
            <MapPin className="w-3.5 h-3.5 text-black" /> Jaringan Cabang
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-black tracking-tight text-neutral-950">
            Lokasi Cabang di Kabupaten Tegal
          </h2>
          <p className="text-neutral-600 text-sm sm:text-base mt-2">
            Temukan studio Pangling Hairstudio terdekat. Hotline WhatsApp terpusat:{' '}
            <a href="https://wa.me/6285735382159" className="font-bold text-black underline">
              0857-3538-2159
            </a>.
          </p>
        </div>

        {/* Branch Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {branches.map(branch => (
            <div
              key={branch.id}
              className="bg-white rounded-2xl p-6 border border-neutral-200 hover:border-black shadow-sm hover:shadow-lg transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="w-3 h-3 rounded-full bg-black animate-pulse" />
                  <span className="text-[11px] font-bold text-black uppercase tracking-wider bg-neutral-100 border border-neutral-300 px-2.5 py-0.5 rounded-full">
                    {branch.isActive ? 'Cabang Aktif' : 'Tutup Sementara'}
                  </span>
                </div>

                <h3 className="font-serif text-xl font-bold text-neutral-950">
                  {branch.name}
                </h3>

                <div className="flex items-start gap-2 mt-3 text-xs text-neutral-600">
                  <MapPin className="w-4 h-4 text-black shrink-0 mt-0.5" />
                  <span>{branch.address}</span>
                </div>

                <div className="flex items-center gap-2 mt-2 text-xs text-neutral-600">
                  <Clock className="w-4 h-4 text-black shrink-0" />
                  <span>Buka Setiap Hari: <strong>{branch.openTime} - {branch.closeTime} WIB</strong></span>
                </div>

                <div className="flex items-center gap-2 mt-2 text-xs text-neutral-600">
                  <Phone className="w-4 h-4 text-black shrink-0" />
                  <span>WhatsApp: <strong>0857-3538-2159</strong></span>
                </div>

                {branch.notes && (
                  <p className="text-xs text-neutral-500 mt-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                    {branch.notes}
                  </p>
                )}
              </div>

              <div className="pt-6 mt-6 border-t border-neutral-100 space-y-2">
                <button
                  onClick={() => onOpenBookingForBranch(branch)}
                  className="w-full py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition shadow flex items-center justify-center gap-1.5"
                >
                  <CalendarCheck className="w-3.5 h-3.5 text-white" />
                  Booking di Cabang Ini
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`https://wa.me/${OFFICIAL_WA}?text=Halo%20Pangling%20Hairstudio%2C%20saya%20ingin%20tanya%20informasi.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-3 border border-neutral-300 hover:border-black text-neutral-800 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 hover:bg-neutral-50"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-black" />
                    WhatsApp
                  </a>

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      branch.id === 'slawi'
                        ? 'Pangling Hairstudio Slawi, Kalisapu, Slawi'
                        : branch.id === 'pagerbarang'
                        ? 'Pangling hairstudio 1 Pagerbarang, Tegal'
                        : branch.id === 'pesarean-jatibarang'
                        ? 'Pangling hairstudio 2 Bong cina Pesarean Jatibarang'
                        : `${branch.name}, ${branch.address}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-3 border border-neutral-300 hover:border-black text-neutral-800 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 hover:bg-neutral-50"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Buka Peta
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
