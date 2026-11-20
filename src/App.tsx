import { useCallback, useEffect, useState } from 'react';
import { PageLoader } from './components/PageLoader';
import { ScrollProgressBar } from './components/ScrollProgressBar';
import { Navbar } from './components/Navbar';
import { HeroSection, type QuickSearchCriteria } from './components/HeroSection';
import { DestinationsSection } from './components/DestinationsSection';
import { EmeraldBanner } from './components/EmeraldBanner';
import { ServicesSection } from './components/ServicesSection';
import { WhoWeAreSection } from './components/WhoWeAreSection';
import { PackagesSection } from './components/PackagesSection';
import { ContactSustainableSection } from './components/ContactSustainableSection';
import { Footer } from './components/Footer';
import { BookingModal, type BookingModalContext } from './components/BookingModal';
import { AdminDashboard } from './pages/AdminDashboard';
import { fetchDestinations, fetchPackages } from './services/api';
import type { DestinationItem, PackageCategory, TourPackage } from './types/travel';

function getIsAdminRoute(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.pathname.startsWith('/admin');
}

export default function App() {
  const [isAdmin, setIsAdmin] = useState<boolean>(getIsAdminRoute);
  const [loaderReady, setLoaderReady] = useState(false);

  const [destinations, setDestinations] = useState<DestinationItem[]>([]);
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | PackageCategory>('All');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTravelers, setPreferredTravelers] = useState(2);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalContext, setModalContext] = useState<BookingModalContext>({});

  // Sync browser back/forward navigation between / and /admin
  useEffect(() => {
    const onPopState = () => setIsAdmin(getIsAdminRoute());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    try {
      const [destData, pkgData] = await Promise.all([
        fetchDestinations(),
        fetchPackages(),
      ]);
      setDestinations(destData);
      setPackages(pkgData);
    } catch (err) {
      console.error('Failed to fetch Flytrox travel catalog:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      loadCatalog();
    }
  }, [isAdmin, loadCatalog]);

  const navigateTo = (path: '/' | '/admin') => {
    window.history.pushState({}, '', path);
    setIsAdmin(path === '/admin');
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const handleLoaderComplete = useCallback(() => {
    setLoaderReady(true);
  }, []);

  const handleQuickSearch = (criteria: QuickSearchCriteria) => {
    setSearchQuery(criteria.query);
    setSelectedCategory('All');
    if (criteria.travelDate) setPreferredDate(criteria.travelDate);
    setPreferredTravelers(criteria.travelers);
    const section = document.getElementById('packages');
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openGeneralBooking = (prefill?: Partial<BookingModalContext>) => {
    setModalContext({
      selectedPackage: null,
      prefillDate: preferredDate,
      prefillTravelers: preferredTravelers,
      ...prefill,
    });
    setModalOpen(true);
  };

  const openPackageBooking = (pkg: TourPackage) => {
    setModalContext({
      selectedPackage: pkg,
      prefillDestination: pkg.destination,
      prefillDate: preferredDate,
      prefillTravelers: preferredTravelers,
    });
    setModalOpen(true);
  };

  if (isAdmin) {
    return <AdminDashboard onBackToSite={() => navigateTo('/')} />;
  }

  return (
    <div className="min-h-screen bg-white text-[#111827]">
      <PageLoader onComplete={handleLoaderComplete} />
      <ScrollProgressBar />

      <Navbar ready={loaderReady} onOpenBooking={() => openGeneralBooking()} />

      <main>
        {/* 2. Hero Section */}
        <HeroSection
          ready={loaderReady}
          onQuickSearch={handleQuickSearch}
          onOpenContact={() => {
            document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* 3. Popular Destinations */}
        <DestinationsSection
          destinations={destinations}
          loading={loading}
          onSelectDestination={(destName) =>
            openGeneralBooking({
              prefillDestination: destName,
              prefillMessage: `Interested in curated itinerary & flights for ${destName}.`,
            })
          }
        />

        {/* 4. Full-Width Emerald Banner 1 */}
        <EmeraldBanner
          eyebrow="Flytrox Assurance"
          headline="DISCOVER THE WORLD WITH CONFIDENCE — BECAUSE..."
          ctaLabel="Learn More"
          href="#about"
        />

        {/* 5. Our Travel Services (6-Card Grid) */}
        <ServicesSection
          onInquireService={(serviceTitle) =>
            openGeneralBooking({
              prefillDestination: serviceTitle,
              prefillMessage: `Requesting assistance with ${serviceTitle}.`,
            })
          }
        />

        {/* 6. Who We Are (Interactive Accordion + Mission Card) */}
        <WhoWeAreSection />

        {/* 7. Full-Width Emerald Banner 2 */}
        <EmeraldBanner
          eyebrow="Curated Escapes"
          headline="DISCOVER THE WORLD — SEE MORE. LOVE MORE."
          ctaLabel="Explore Packages"
          href="#packages"
        />

        {/* 8. Checkout Our Packages (Horizontal 3-Part Split Cards) */}
        <PackagesSection
          packages={packages}
          loading={loading}
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          onClearSearch={() => {
            setSearchQuery('');
            setSelectedCategory('All');
          }}
          onBookPackage={openPackageBooking}
        />

        {/* 9. Full-Width Emerald Banner 3 */}
        <EmeraldBanner
          eyebrow="Ready To Take Off?"
          headline="READY FOR UNFORGETTABLE TRAVEL. REMEMBER US!"
          ctaLabel="Contact Us"
          onAction={() => openGeneralBooking()}
        />

        {/* 10. Paperless, Smart, Sustainable Travel & Quick Inquiry */}
        <ContactSustainableSection />
      </main>

      {/* 11. Deep Green Footer */}
      <Footer onNavigateAdmin={() => navigateTo('/admin')} />

      {/* Interactive Booking / Quote Modal */}
      <BookingModal
        open={modalOpen}
        context={modalContext}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
