import React from 'react';
import { Scissors, MapPin, Clock, ShieldCheck, Phone } from 'lucide-react';
import { Branch } from '../types';

interface FooterProps {
  branches: Branch[];
  onOpenBooking: () => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  branches,
  onOpenBooking,
  onOpenAdmin,
}) => {
  return (
    <footer id="tentang" className="bg-white text-neutral-900 border-t border-neutral-200 pt-14 pb-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-neutral-200">
          {/* Col 1: Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center shadow">
                <Scissors className="w-5 h-5" />
              </div>
              <div>
                <span className="font-serif text-xl font-black tracking-wider text-black">
                  PANGLING
                </span>
                <p className="text-[10px] tracking-widest uppercase text-neutral-500 font-semibold -mt-1">
                  HAIRSTUDIO • KAB. TEGAL
                </p>
              </div>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Kami adalah <strong>Pangling Hairstudio</strong> yang berfokus pada hasil potongan rambut terbaik sejak tahun 2021. Menerapkan SOP Barbershop Profesional untuk pengalaman terbaik Anda.
            </p>
            <div className="pt-1">
              <span className="text-[11px] font-bold text-black bg-neutral-100 px-3 py-1 rounded-full border border-neutral-300">
                “Looks Good, Feels Good”
              </span>
            </div>
          </div>

          {/* Col 2: Jam Operasional & Layanan */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-bold uppercase tracking-wider text-neutral-900">
              Jam Operasional & Kontak
            </h4>
            <div className="space-y-2 text-xs text-neutral-600">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-black shrink-0 mt-0.5" />
                <div>
                  <strong className="text-black block">Senin - Minggu:</strong>
                  <span>10:00 - 21:00 WIB</span>
                </div>
              </div>
              <div className="flex items-start gap-2 pt-1">
                <Phone className="w-4 h-4 text-black shrink-0 mt-0.5" />
                <div>
                  <strong className="text-black block">WhatsApp Resmi:</strong>
                  <a href="https://wa.me/6285735382159" className="text-black font-bold hover:underline">
                    0857-3538-2159
                  </a>
                </div>
              </div>
            </div>
            <div className="pt-2">
              <button
                onClick={onOpenBooking}
                className="px-4 py-2 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition shadow"
              >
                Pesan Jadwal Sekarang
              </button>
            </div>
          </div>

          {/* Col 3: Cabang Tegal */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-bold uppercase tracking-wider text-neutral-900">
              Cabang Kabupaten Tegal
            </h4>
            <ul className="space-y-2 text-xs text-neutral-600">
              {branches.map(b => (
                <li key={b.id} className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-black shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-neutral-900">{b.name}:</strong>{' '}
                    {b.address}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Layanan Unggulan & Admin Portal */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-bold uppercase tracking-wider text-neutral-900">
              Menu Unggulan
            </h4>
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              <span className="bg-neutral-100 border border-neutral-200 px-2 py-1 rounded text-neutral-800">Gentleman Haircut</span>
              <span className="bg-neutral-100 border border-neutral-200 px-2 py-1 rounded text-neutral-800">Keratin Treatment</span>
              <span className="bg-neutral-100 border border-neutral-200 px-2 py-1 rounded text-neutral-800">Korean Perm</span>
              <span className="bg-neutral-100 border border-neutral-200 px-2 py-1 rounded text-neutral-800">Hair Coloring</span>
              <span className="bg-neutral-100 border border-neutral-200 px-2 py-1 rounded text-neutral-800">Rootlift</span>
              <span className="bg-neutral-100 border border-neutral-200 px-2 py-1 rounded text-neutral-800">Down Perm</span>
            </div>

            <div className="pt-2">
              <button
                onClick={onOpenAdmin}
                className="flex items-center gap-1.5 text-xs text-neutral-600 hover:text-black font-semibold transition"
              >
                <ShieldCheck className="w-3.5 h-3.5" /> Portal Admin Pangling Hairstudio
              </button>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500 text-center sm:text-left">
          <p>© {new Date().getFullYear()} PANGLING HAIRSTUDIO. Hak Cipta Dilindungi Undang-Undang.</p>
          <p className="flex items-center gap-1 text-[11px]">
            Sistem Booking Online Resmi Kabupaten Tegal, Jawa Tengah • WA: 0857-3538-2159
          </p>
        </div>
      </div>
    </footer>
  );
};
