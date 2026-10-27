import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ServicesSection } from './components/ServicesSection';
import { BarbersSection } from './components/BarbersSection';
import { BranchesSection } from './components/BranchesSection';
import { AboutSection } from './components/AboutSection';
import { Footer } from './components/Footer';
import { BookingFlowModal } from './components/BookingFlowModal';
import { LookupBookingModal } from './components/LookupBookingModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboard } from './components/AdminDashboard';
import { Branch, Service, Barber } from './types';
import {
  getBranches,
  getServices,
  getBarbers,
  seedInitialDataIfNeeded,
} from './lib/bookingService';
import { CalendarCheck, Search, ShieldCheck } from 'lucide-react';

export default function App() {
  // Master data states
  const [branches, setBranches] = useState<Branch[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals & Navigation
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);
  const [isLookupOpen, setIsLookupOpen] = useState<boolean>(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState<boolean>(false);
  const [isAdminView, setIsAdminView] = useState<boolean>(false);

  // Preselected items
  const [preselectedService, setPreselectedService] = useState<Service | null>(null);
  const [preselectedBarber, setPreselectedBarber] = useState<Barber | null>(null);

  // Admin authentication state
  const [adminEmail, setAdminEmail] = useState<string | null>(() => {
    return localStorage.getItem('pangling_admin_user');
  });

  // Load initial data
  const loadData = async () => {
    setLoading(true);
    try {
      await seedInitialDataIfNeeded();
      const [bList, sList, brbList] = await Promise.all([
        getBranches(),
        getServices(),
        getBarbers(),
      ]);
      setBranches(bList);
      setServices(sList);
      setBarbers(brbList);
    } catch (err) {
      console.error('Error initializing app data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Admin handlers
  const handleAdminLoginSuccess = (userAccount: string) => {
    setAdminEmail(userAccount);
    localStorage.setItem('pangling_admin_user', userAccount);
    setIsAdminView(true);
  };

  const handleAdminLogout = () => {
    setAdminEmail(null);
    localStorage.removeItem('pangling_admin_user');
    setIsAdminView(false);
  };

  const handleOpenAdmin = () => {
    if (adminEmail) {
      setIsAdminView(true);
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  const handleSelectServiceFromSection = (service: Service) => {
    setPreselectedService(service);
    setPreselectedBarber(null);
    setIsBookingOpen(true);
  };

  const handleSelectBarberFromSection = (barber: Barber) => {
    setPreselectedBarber(barber);
    setPreselectedService(null);
    setIsBookingOpen(true);
  };

  const handleOpenBookingForBranch = (branch: Branch) => {
    setPreselectedBarber(null);
    setPreselectedService(null);
    setIsBookingOpen(true);
  };

  // If in Admin Dashboard mode
  if (isAdminView && adminEmail) {
    return (
      <AdminDashboard
        branches={branches}
        services={services}
        barbers={barbers}
        onRefreshData={loadData}
        onLogout={handleAdminLogout}
        onBackToCustomerView={() => setIsAdminView(false)}
        adminEmail={adminEmail}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col text-neutral-900 font-sans selection:bg-black selection:text-white">
      {/* Top Navbar */}
      <Navbar
        onOpenBooking={() => {
          setPreselectedService(null);
          setPreselectedBarber(null);
          setIsBookingOpen(true);
        }}
        onOpenLookup={() => setIsLookupOpen(true)}
        onOpenAdmin={handleOpenAdmin}
        isAdminLoggedIn={!!adminEmail}
      />

      {/* Main Landing Page Content */}
      <main className="flex-1">
        <HeroSection
          onOpenBooking={() => {
            setPreselectedService(null);
            setPreselectedBarber(null);
            setIsBookingOpen(true);
          }}
          onOpenLookup={() => setIsLookupOpen(true)}
          branchCount={branches.length}
        />

        {/* Loading Indicator for Data */}
        {loading && (
          <div className="py-4 text-center text-xs text-neutral-600 bg-neutral-100 border-b border-neutral-200">
            <span className="inline-flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-black animate-ping" />
              Menghubungkan ke sistem Pangling Hairstudio...
            </span>
          </div>
        )}

        {/* Services & Treatment Catalog */}
        <ServicesSection
          services={services}
          onSelectService={handleSelectServiceFromSection}
        />

        {/* Official Barbers Section */}
        <BarbersSection
          barbers={barbers}
          branches={branches}
          onSelectBarber={handleSelectBarberFromSection}
        />

        {/* Branches in Tegal */}
        <BranchesSection
          branches={branches}
          onOpenBookingForBranch={handleOpenBookingForBranch}
        />

        {/* Tentang Kami / Story & SOP Barbershop Profesional */}
        <AboutSection
          onOpenBooking={() => {
            setPreselectedService(null);
            setPreselectedBarber(null);
            setIsBookingOpen(true);
          }}
        />
      </main>

      {/* Footer */}
      <Footer
        branches={branches}
        onOpenBooking={() => {
          setPreselectedService(null);
          setPreselectedBarber(null);
          setIsBookingOpen(true);
        }}
        onOpenAdmin={handleOpenAdmin}
      />

      {/* Mobile Floating Bottom Bar for Instant Booking - Black & White */}
      <div className="sm:hidden fixed bottom-3 left-3 right-3 z-30 bg-black text-white p-2.5 rounded-2xl shadow-2xl border border-neutral-800 flex items-center justify-between gap-2 backdrop-blur-md">
        <button
          onClick={() => setIsLookupOpen(true)}
          className="p-2.5 text-white hover:text-neutral-300 rounded-xl bg-neutral-800 flex items-center justify-center shrink-0"
          title="Cek Booking"
        >
          <Search className="w-4 h-4 text-white" />
        </button>

        <button
          onClick={() => {
            setPreselectedService(null);
            setPreselectedBarber(null);
            setIsBookingOpen(true);
          }}
          className="flex-1 py-2.5 px-4 bg-white text-black rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow active:scale-95 transition"
        >
          <CalendarCheck className="w-4 h-4 text-black" />
          Booking Jadwal Sekarang
        </button>

        <button
          onClick={handleOpenAdmin}
          className="p-2.5 text-white hover:text-neutral-300 rounded-xl bg-neutral-800 flex items-center justify-center shrink-0"
          title="Admin"
        >
          <ShieldCheck className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Interactive Modals */}
      <BookingFlowModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        branches={branches}
        services={services}
        barbers={barbers}
        preselectedService={preselectedService}
        preselectedBarber={preselectedBarber}
      />

      <LookupBookingModal
        isOpen={isLookupOpen}
        onClose={() => setIsLookupOpen(false)}
      />

      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />
    </div>
  );
}
