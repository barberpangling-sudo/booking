import React from 'react';
import { Sparkles, MapPin, ExternalLink, CalendarCheck, ShieldCheck, Award } from 'lucide-react';

interface AboutSectionProps {
  onOpenBooking: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onOpenBooking }) => {
  const MAPS_LOCATIONS = [
    {
      name: 'Pangling Hairstudio Slawi',
      address: 'Kalisapu, Slawi',
      query: 'Pangling Hairstudio Slawi, Kalisapu, Slawi',
      tag: 'Cabang Utama Slawi',
    },
    {
      name: 'Pangling hairstudio 1 Pagerbarang',
      address: 'Pagerbarang, Tegal',
      query: 'Pangling hairstudio 1 Pagerbarang, Tegal',
      tag: 'Cabang 1 Pagerbarang',
    },
    {
      name: 'Pangling hairstudio 2 Bong cina Pesarean Jatibarang',
      address: 'Bong cina Pesarean Jatibarang',
      query: 'Pangling hairstudio 2 Bong cina Pesarean Jatibarang',
      tag: 'Cabang 2 Pesarean',
    },
  ];

  return (
    <section id="tentang" className="py-16 sm:py-24 bg-neutral-50 text-neutral-900 scroll-mt-12 border-b border-neutral-200">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Tagline Badge */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-neutral-300 text-neutral-900 text-xs sm:text-sm font-bold tracking-wide uppercase shadow-sm">
              <Sparkles className="w-4 h-4 text-black" />
              <span>“Looks Good, Feels Good”</span>
            </div>
          </div>

          {/* Heading */}
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-center text-neutral-950 tracking-tight mb-8">
            Tentang Pangling Hairstudio
          </h2>

          {/* Main Description Box */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-neutral-200 shadow-sm space-y-6">
            {/* Paragraph 1 */}
            <p className="text-base sm:text-lg text-neutral-700 leading-relaxed font-normal">
              Kami adalah <strong className="text-neutral-950 font-bold">Pangling Hairstudio</strong> yang sepenuhnya berfokus pada memberikan hasil potongan rambut terbaik. Berdiri sejak tahun 2021, kami hadir dengan dedikasi penuh untuk menghadirkan gaya rambut yang tidak hanya modis tetapi juga sesuai dengan karakter Anda.
            </p>

            {/* Paragraph 2 */}
            <p className="text-base sm:text-lg text-neutral-700 leading-relaxed font-normal">
              Dengan menerapkan <strong className="text-neutral-950 font-semibold">SOP (Standar Operasional Prosedur)</strong> dan kualitas potongan rambut yang benar-benar setara <strong className="text-neutral-950 font-semibold">Barbershop Profesional</strong>, kami siap memberikan pengalaman layanan yang profesional, detail, dan memuaskan.
            </p>

            {/* Google Maps Showcase */}
            <div className="pt-4 border-t border-neutral-100">
              <div className="mb-4">
                <span className="text-xs uppercase font-bold tracking-wider text-neutral-500 block">
                  Temukan hairstudio kami di google maps :
                </span>
                <p className="font-serif text-xl sm:text-2xl font-black text-neutral-950 mt-1">
                  Google Maps Cabang Resmi
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {MAPS_LOCATIONS.map((loc, idx) => (
                  <a
                    key={idx}
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.query)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 rounded-2xl border border-neutral-200 hover:border-black bg-neutral-50 hover:bg-white transition flex flex-col justify-between group shadow-xs"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 bg-white border border-neutral-200 px-2 py-0.5 rounded-full">
                          {loc.tag}
                        </span>
                        <ExternalLink className="w-4 h-4 text-neutral-400 group-hover:text-black transition" />
                      </div>
                      <h4 className="font-bold text-sm text-neutral-950 leading-snug group-hover:underline">
                        {loc.name}
                      </h4>
                      <p className="text-xs text-neutral-600 mt-1.5 flex items-start gap-1">
                        <MapPin className="w-3.5 h-3.5 text-black shrink-0 mt-0.5" />
                        <span>{loc.address}</span>
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-neutral-200/60 flex items-center justify-between text-xs font-bold text-black">
                      <span>Buka di Maps</span>
                      <span className="text-[11px] font-normal text-neutral-500 group-hover:text-black">↗</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Paragraph 4: Closing Commitment */}
            <div className="p-4 sm:p-5 rounded-2xl bg-neutral-100 border border-neutral-200 text-center">
              <p className="font-serif text-base sm:text-lg italic font-semibold text-neutral-900 leading-snug">
                “Kami siap membantu Anda menemukan gaya rambut yang sempurna dan memberikan transformasi terbaik untuk penampilan Anda”
              </p>
              <p className="text-xs uppercase tracking-widest font-bold text-neutral-500 mt-2">
                — Pangling Hairstudio • Looks Good, Feels Good
              </p>
            </div>

            {/* Call to action */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={onOpenBooking}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
              >
                <CalendarCheck className="w-4 h-4 text-white" />
                Booking Jadwal Sekarang
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
