import React from 'react';
import { Scissors, Calendar, Clock, MapPin, CheckCircle } from 'lucide-react';
import { Barber, Branch } from '../types';

interface BarbersSectionProps {
  barbers: Barber[];
  branches: Branch[];
  onSelectBarber: (barber: Barber) => void;
}

export const BarbersSection: React.FC<BarbersSectionProps> = ({
  barbers,
  branches,
  onSelectBarber,
}) => {
  const getBranchName = (branchId: string) => {
    const branch = branches.find(b => b.id === branchId);
    return branch ? branch.name : 'Pangling Hairstudio Kab. Tegal';
  };

  return (
    <section id="barbers" className="py-16 sm:py-24 bg-white text-neutral-900 scroll-mt-12 border-b border-neutral-200">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-neutral-900 border border-neutral-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Scissors className="w-3.5 h-3.5 text-black" /> Tim Barber Profesional
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-black tracking-tight text-neutral-950">
            Pilih Barber Terbaik Anda
          </h2>
          <p className="text-neutral-600 text-sm sm:text-base mt-2">
            Setiap barber di Pangling Hairstudio telah tersertifikasi dengan keahlian khusus,
            mulai dari teknik fade presisi, scissor work, hingga perlakuan treatment kimiawi modern.
          </p>
        </div>

        {/* Barber Cards - White with Black Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {barbers.map(barber => (
            <div
              key={barber.id}
              className="bg-white rounded-2xl p-5 border border-neutral-200 hover:border-black transition flex flex-col justify-between group shadow-sm hover:shadow-lg"
            >
              <div>
                {/* Avatar / Photo Profile */}
                <div className="flex items-center justify-between mb-4">
                  {barber.photoUrl ? (
                    <img
                      src={barber.photoUrl}
                      alt={barber.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-neutral-300 shadow group-hover:scale-105 transition transform"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center font-serif text-xl font-bold shadow">
                      {barber.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-black bg-neutral-100 border border-neutral-300 px-2.5 py-1 rounded-full">
                    <CheckCircle className="w-3 h-3 text-black" /> Siap Melayani
                  </span>
                </div>

                <h3 className="font-serif text-xl font-bold text-neutral-950 group-hover:text-black transition">
                  {barber.name}
                </h3>

                <div className="flex items-center gap-1 text-xs text-neutral-600 font-medium mt-1">
                  <MapPin className="w-3.5 h-3.5 text-black shrink-0" />
                  <span>{getBranchName(barber.branchId)}</span>
                </div>

                <p className="text-xs text-neutral-600 mt-3 line-clamp-3 bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                  {barber.specialties}
                </p>

                <div className="mt-3 space-y-1 text-[11px] text-neutral-500">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-black" />
                    <span>Jam Kerja: {barber.workStart} - {barber.workEnd} WIB</span>
                  </div>
                  {barber.breakStart && barber.breakEnd && (
                    <div className="flex items-center gap-1.5 text-neutral-400">
                      <span className="w-3 h-3 flex items-center justify-center text-[9px] font-bold">☕</span>
                      <span>Istirahat: {barber.breakStart} - {barber.breakEnd} WIB</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-neutral-100">
                <button
                  onClick={() => onSelectBarber(barber)}
                  className="w-full py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition shadow flex items-center justify-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5 text-white" />
                  Booking {barber.name}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
