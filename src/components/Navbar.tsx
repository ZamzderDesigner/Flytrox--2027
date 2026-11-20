import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FlytroxLogo } from './FlytroxLogo';

interface NavbarProps {
  onOpenBooking: () => void;
  ready: boolean;
}

const NAV_LINKS = [
  { label: 'Home', href: '#home', id: 'home' },
  { label: 'Destinations', href: '#destinations', id: 'destinations' },
  { label: 'Services', href: '#services', id: 'services' },
  { label: 'About Us', href: '#about', id: 'about' },
  { label: 'Packages', href: '#packages', id: 'packages' },
  { label: 'Contact', href: '#contact', id: 'contact' },
];

export function Navbar({ onOpenBooking, ready }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState('home');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 28);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const sections = NAV_LINKS.map((l) => document.getElementById(l.id)).filter(
      Boolean
    ) as HTMLElement[];

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-25% 0px -55% 0px', threshold: [0.1, 0.3, 0.6] }
    );

    sections.forEach((sec) => observer.observe(sec));
    return () => observer.disconnect();
  }, []);

  const handleLinkClick = () => {
    setMobileOpen(false);
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -24 }}
      animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: -24 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-200 ${
        scrolled
          ? 'bg-white/92 backdrop-blur-md border-b border-slate-200/80 shadow-xs'
          : 'bg-[#0D1512]/70 backdrop-blur-md border-b border-white/10'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <a
          href="#home"
          aria-label="Flytrox Tours & Travels Home"
          className="focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0E5A28] rounded"
        >
          <FlytroxLogo variant={scrolled ? 'dark' : 'light'} />
        </a>

        {/* Zone 2: Clean single-line navigation links */}
        <nav aria-label="Primary navigation" className="hidden lg:flex items-center gap-7">
          {NAV_LINKS.map((link) => {
            const isActive = activeId === link.id;
            return (
              <a
                key={link.id}
                href={link.href}
                className={`relative py-1 text-sm font-semibold whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0E5A28] ${
                  scrolled
                    ? isActive
                      ? 'text-[#0E5A28]'
                      : 'text-slate-700 hover:text-[#0E5A28]'
                    : isActive
                      ? 'text-emerald-300'
                      : 'text-white/90 hover:text-white'
                }`}
              >
                {link.label}
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-0 -bottom-0.5 h-0.5 origin-left rounded-full transition-transform duration-200 ${
                    scrolled ? 'bg-[#0E5A28]' : 'bg-emerald-300'
                  } ${isActive ? 'scale-x-100' : 'scale-x-0'}`}
                />
              </a>
            );
          })}
        </nav>

        {/* Zone 3: Single Primary CTA + Mobile Trigger */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenBooking}
            className="btn-liquid rounded-full bg-[#0E5A28] px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-all duration-150 hover:bg-[#136F33] active:scale-[0.98] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#136F33]"
          >
            Book Now
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full lg:hidden transition-colors cursor-pointer ${
              scrolled
                ? 'text-slate-800 hover:bg-slate-100'
                : 'text-white hover:bg-white/15'
            }`}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            aria-label="Mobile navigation"
            className="border-t border-slate-200 bg-white px-6 py-4 shadow-lg lg:hidden"
          >
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={handleLinkClick}
                  className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                    activeId === link.id
                      ? 'bg-[#E6F2EA] text-[#0E5A28]'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-[#0E5A28]'
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
