import React, { useState } from 'react';
import { Scissors, Clock, Sparkles, ArrowRight } from 'lucide-react';
import { Service } from '../types';

interface ServicesSectionProps {
  services: Service[];
  onSelectService: (service: Service) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ services, onSelectService }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'Semua Layanan' },
    { id: 'haircut', label: 'Gentleman Haircut' },
    { id: 'treatment', label: 'Premium Treatment & Perm' },
    { id: 'styling', label: 'Styling & Catok' },
    { id: 'grooming', label: 'Shaving & Facial' },
  ];

  const filtered = services.filter(s => {
    if (!s.isActive) return false;
    if (activeCategory === 'all') return true;
    return s.category === activeCategory;
  });

  return (
    <section id="layanan" className="py-16 sm:py-24 bg-white text-neutral-900 scroll-mt-12 border-b border-neutral-200">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-neutral-900 border border-neutral-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-black" /> Daftar Menu & Tarif Resmi
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-black tracking-tight text-neutral-950">
            Layanan Terbaik Pangling Hairstudio
          </h2>
          <p className="text-neutral-600 text-sm sm:text-base mt-2">
            Dari potongan rambut klasik, Korean textured perm, hingga perawatan keratin intensif.
            Dikerjakan oleh barber berpengalaman dengan produk premium.
          </p>

          {/* Category Filter Pills - Black & White */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            {categories.map(c => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition shadow-sm ${
                  activeCategory === c.id
                    ? 'bg-black text-white shadow'
                    : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-300'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(service => (
            <div
              key={service.id}
              className="bg-white rounded-2xl p-6 border border-neutral-200 hover:border-black shadow-sm hover:shadow-lg transition flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-800 border border-neutral-300">
                    {service.category}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-neutral-500 font-medium">
                    <Clock className="w-3.5 h-3.5 text-black" /> {service.durationMinutes} Menit
                  </span>
                </div>

                <h3 className="font-serif text-xl font-bold text-neutral-950 group-hover:text-black transition">
                  {service.name}
                </h3>
                <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                  {service.description}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-neutral-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-neutral-400 block font-medium">Biaya</span>
                  <div className="text-lg font-black text-black">
                    {service.isPriceStartingFrom ? 'Mulai ' : ''}Rp{' '}
                    {service.price.toLocaleString('id-ID')}
                  </div>
                </div>

                <button
                  onClick={() => onSelectService(service)}
                  className="px-4 py-2 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow"
                >
                  Pilih Layanan <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
