import React from 'react';
import { CalendarCheck, Search, Sparkles, CheckCircle2, Clock, MapPin, Award, Phone } from 'lucide-react';

interface HeroSectionProps {
  onOpenBooking: () => void;
  onOpenLookup: () => void;
  branchCount: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenBooking,
  onOpenLookup,
  branchCount,
}) => {
  return (
    <section className="relative overflow-hidden bg-white text-neutral-900 pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-neutral-200">
      {/* Subtle modern dot background */}
      <div className="absolute inset-0 opacity-40 pointer-events-none bg-[radial-gradient(#d4d4d4_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          {/* Tagline Badge - Black & White */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-100 border border-neutral-300 text-neutral-900 text-xs sm:text-sm font-bold tracking-wide uppercase shadow-sm">
            <Sparkles className="w-4 h-4 text-black" />
            <span>Looks Good, Feels Good</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-neutral-950 leading-[1.15]">
            Gaya Rambut Berkelas, <br />
            <span className="text-black underline decoration-neutral-300 underline-offset-8">
              Looks Good, Feels Good
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-neutral-600 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Sistem booking online resmi <strong>Pangling Hairstudio</strong>. Pesan jadwal potong rambut, perawatan keratin, perm modern, dan coloring dengan <span className="text-black font-bold">konfirmasi otomatis</span> langsung dari smartphone Anda.
          </p>

          {/* Main CTAs - Black & White Buttons Only */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <button
              onClick={onOpenBooking}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-black hover:bg-neutral-800 active:scale-[0.98] text-white font-bold text-base shadow-xl transition flex items-center justify-center gap-2"
            >
              <CalendarCheck className="w-5 h-5 text-white" />
              Booking Jadwal Sekarang
            </button>
            <button
              onClick={onOpenLookup}
              className="w-full sm:w-auto px-6 py-4 rounded-xl bg-white hover:bg-neutral-50 text-black font-bold text-base border-2 border-black transition flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5 text-black" />
              Cek Status Booking
            </button>
          </div>

          {/* Trust Guarantees - Clean Monochrome Cards */}
          <div className="pt-8 border-t border-neutral-200 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            <div className="flex items-start gap-2.5 bg-neutral-50 p-3.5 rounded-xl border border-neutral-200">
              <CheckCircle2 className="w-5 h-5 text-black shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-black">Konfirmasi Otomatis</p>
                <p className="text-[11px] text-neutral-500">Slot terkunci aman di server</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 bg-neutral-50 p-3.5 rounded-xl border border-neutral-200">
              <Clock className="w-5 h-5 text-black shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-black">Bebas Antre</p>
                <p className="text-[11px] text-neutral-500">Waktu terencana & presisi</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 bg-neutral-50 p-3.5 rounded-xl border border-neutral-200">
              <Award className="w-5 h-5 text-black shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-black">7 Barber Ahli</p>
                <p className="text-[11px] text-neutral-500">Fitron, Wawan, Bayu, dll.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 bg-neutral-50 p-3.5 rounded-xl border border-neutral-200">
              <MapPin className="w-5 h-5 text-black shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-black">{branchCount} Cabang Resmi</p>
                <p className="text-[11px] text-neutral-500">Slawi, Pagerbarang, Pesarean</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
