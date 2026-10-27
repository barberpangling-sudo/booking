import React, { useState } from 'react';
import { Scissors, Search, ShieldCheck, Menu, X, CalendarCheck, Clock, MapPin, Phone } from 'lucide-react';

interface NavbarProps {
  onOpenBooking: () => void;
  onOpenLookup: () => void;
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenBooking,
  onOpenLookup,
  onOpenAdmin,
  isAdminLoggedIn,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white text-neutral-900 shadow-sm border-b border-neutral-200">
      {/* Top micro banner - Clean Minimalist */}
      <div className="bg-neutral-100 text-xs py-1.5 px-4 text-neutral-600 border-b border-neutral-200">
        <div className="container mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-4 text-[11px] sm:text-xs">
            <span className="flex items-center gap-1 font-medium text-neutral-800">
              <MapPin className="w-3.5 h-3.5 text-black" /> Kab. Tegal: Slawi • Pagerbarang • Pesarean Jatibarang
            </span>
            <span className="hidden md:flex items-center gap-1 font-medium text-neutral-700">
              <Clock className="w-3.5 h-3.5 text-black" /> Buka Setiap Hari 10:00 - 21:00 WIB
            </span>
          </div>
          <div className="flex items-center gap-3 ml-auto text-[11px]">
            <a
              href="https://wa.me/6285735382159"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 font-bold text-black hover:underline"
            >
              <Phone className="w-3 h-3 text-black" /> WA: 0857-3538-2159
            </a>
            <span className="bg-black text-white font-semibold px-2 py-0.5 rounded text-[10px]">
              Konfirmasi Otomatis
            </span>
          </div>
        </div>
      </div>

      <nav className="container mx-auto px-4 py-3.5 flex items-center justify-between">
        {/* Brand Logo - Black & White */}
        <div 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center shadow group-hover:scale-105 transition transform">
            <Scissors className="w-5 h-5" />
          </div>
          <div>
            <span className="font-serif text-xl sm:text-2xl font-black tracking-wider text-black flex items-center gap-1">
              PANGLING
              <span className="text-[10px] font-sans tracking-widest uppercase border border-black px-1.5 py-0.2 rounded ml-1 font-bold">
                Studio
              </span>
            </span>
            <p className="text-[10px] sm:text-[11px] tracking-widest uppercase text-neutral-500 font-semibold -mt-1">
              LOOKS GOOD, FEELS GOOD • KAB. TEGAL
            </p>
          </div>
        </div>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-7 text-sm font-semibold text-neutral-700">
          <button onClick={() => scrollTo('layanan')} className="hover:text-black transition">
            Layanan & Tarif
          </button>
          <button onClick={() => scrollTo('barbers')} className="hover:text-black transition">
            Barbers
          </button>
          <button onClick={() => scrollTo('cabang')} className="hover:text-black transition">
            Cabang & Lokasi
          </button>
          <button onClick={() => scrollTo('tentang')} className="hover:text-black transition">
            Tentang Kami
          </button>
        </div>

        {/* Action Buttons - Black & White Only */}
        <div className="hidden sm:flex items-center gap-2.5">
          <button
            onClick={onOpenLookup}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-white text-neutral-800 border border-neutral-300 hover:border-black hover:bg-neutral-50 transition shadow-sm"
            title="Periksa status pesanan dengan kode booking"
          >
            <Search className="w-3.5 h-3.5 text-black" />
            Cek Booking
          </button>

          <button
            onClick={onOpenAdmin}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border transition ${
              isAdminLoggedIn
                ? 'bg-neutral-900 text-white border-black'
                : 'bg-white text-neutral-800 border-neutral-300 hover:border-black hover:bg-neutral-50'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            {isAdminLoggedIn ? 'Dashboard Admin' : 'Admin'}
          </button>

          <button
            onClick={onOpenBooking}
            className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl bg-black text-white hover:bg-neutral-800 active:scale-95 transition shadow-md"
          >
            <CalendarCheck className="w-4 h-4" />
            Booking Sekarang
          </button>
        </div>

        {/* Mobile Hamburger */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            onClick={onOpenBooking}
            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-black text-white"
          >
            Booking
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-neutral-800 hover:text-black focus:outline-none"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white border-b border-neutral-200 px-4 pt-3 pb-5 space-y-3 animate-fadeIn">
          <div className="flex flex-col gap-2 font-semibold text-sm text-neutral-800 pb-3 border-b border-neutral-200">
            <button
              onClick={() => scrollTo('layanan')}
              className="text-left py-1.5 hover:text-black"
            >
              Layanan & Tarif
            </button>
            <button
              onClick={() => scrollTo('barbers')}
              className="text-left py-1.5 hover:text-black"
            >
              Barbers Resmi
            </button>
            <button
              onClick={() => scrollTo('cabang')}
              className="text-left py-1.5 hover:text-black"
            >
              Cabang Kabupaten Tegal
            </button>
            <button
              onClick={() => scrollTo('tentang')}
              className="text-left py-1.5 hover:text-black"
            >
              Tentang Pangling Hairstudio
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenLookup();
              }}
              className="flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl bg-white text-black border border-neutral-300"
            >
              <Search className="w-3.5 h-3.5 text-black" />
              Cek Booking
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl bg-neutral-100 text-black border border-neutral-300"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-black" />
              {isAdminLoggedIn ? 'Admin Panel' : 'Login Admin'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
