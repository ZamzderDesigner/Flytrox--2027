import { useState, type FormEvent } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Calendar, MapPin, Search, Users } from 'lucide-react';
import { SafeImage } from './SafeImage';

export interface QuickSearchCriteria {
  query: string;
  travelDate: string;
  travelers: number;
}

interface HeroSectionProps {
  ready: boolean;
  onQuickSearch: (criteria: QuickSearchCriteria) => void;
  onOpenContact: () => void;
}

const HERO_IMAGE = '/src/assets/images/hero_world_travel_1795102318972.jpg';

export function HeroSection({ ready, onQuickSearch, onOpenContact }: HeroSectionProps) {
  const [query, setQuery] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [travelers, setTravelers] = useState(2);

  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 600], ['0%', '14%']);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onQuickSearch({ query: query.trim(), travelDate, travelers });
  };

  return (
    <section
      id="home"
      className="relative overflow-hidden bg-[#0D1512] pt-28 pb-20 sm:pt-36 sm:pb-24 lg:pt-40 lg:pb-28 text-white"
    >
      {/* Subtle Slow-Pan Parallax Scenic Backdrop */}
      <motion.div
        style={{ y: bgY }}
        aria-hidden="true"
        className="pointer-events-none absolute -inset-y-12 inset-x-0 z-0"
      >
        <SafeImage
          src={HERO_IMAGE}
          alt="Scenic ocean mountains at dusk"
          loading="eager"
          className="h-full w-full object-cover object-center opacity-50 scale-[1.03]"
        />
        {/* Measured contrast scrim for guaranteed WCAG AA readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0D1512]/80 via-[#0D1512]/65 to-[#0D1512]/92" />
      </motion.div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
            transition={{ duration: 0.45, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="text-sm font-semibold tracking-wide text-emerald-300"
          >
            Flytrox Tours &amp; Travels · Global Holidays
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: -28 }}
            animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: -28 }}
            transition={{ duration: 0.55, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
            className="mt-4 text-4xl font-extrabold tracking-tight uppercase text-white sm:text-5xl lg:text-[3.75rem] lg:leading-[1.08]"
          >
            JOURNEY TO EXPLORE WORLD
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: -22 }}
            animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: -22 }}
            transition={{ duration: 0.5, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-200 sm:text-lg"
          >
            Hassle-free global flight ticketing, handpicked domestic and international holiday
            itineraries, and seamless paperless travel management tailored around your schedule.
          </motion.p>

          {/* Dual CTA Pill Buttons */}
          <motion.div
            initial={{ opacity: 0, y: -18 }}
            animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: -18 }}
            transition={{ duration: 0.5, delay: 0.34, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <a
              href="#packages"
              className="btn-liquid inline-flex items-center justify-center rounded-full bg-[#0E5A28] px-8 py-3.5 text-sm font-bold tracking-wide text-white shadow-md transition-all duration-150 hover:bg-[#136F33] active:scale-[0.98] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300"
            >
              Explore Packages
            </a>
            <button
              type="button"
              onClick={onOpenContact}
              className="inline-flex items-center justify-center rounded-full border border-white/75 bg-white/5 px-8 py-3.5 text-sm font-bold tracking-wide text-white backdrop-blur-xs transition-all duration-150 hover:bg-white hover:text-[#0D1512] active:scale-[0.98] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Contact Us
            </button>
          </motion.div>
        </div>

        {/* Floating Interactive Quick-Search Bar */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: -18 }}
          animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: -18 }}
          transition={{ duration: 0.55, delay: 0.44, ease: [0.16, 1, 0.3, 1] }}
          aria-label="Quick package search"
          className="mx-auto mt-12 max-w-5xl rounded-2xl bg-white p-4 shadow-xl text-[#111827] sm:p-5"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:items-end">
            <div className="md:col-span-5">
              <label
                htmlFor="hero-search-destination"
                className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600"
              >
                <MapPin className="h-3.5 w-3.5 text-[#0E5A28]" aria-hidden="true" />
                Destination or Package
              </label>
              <input
                id="hero-search-destination"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Kashmir, Dubai, Munnar, Goa, Malaysia"
                className="w-full rounded-xl border border-slate-200 bg-[#F4F7F5] px-4 py-3 text-sm font-medium text-[#111827] placeholder:text-slate-400 focus:border-[#0E5A28] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E5A28]/20"
              />
            </div>

            <div className="md:col-span-3">
              <label
                htmlFor="hero-search-date"
                className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600"
              >
                <Calendar className="h-3.5 w-3.5 text-[#0E5A28]" aria-hidden="true" />
                Travel Date
              </label>
              <input
                id="hero-search-date"
                type="date"
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-[#F4F7F5] px-4 py-3 text-sm font-medium text-[#111827] focus:border-[#0E5A28] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E5A28]/20 tabular-nums"
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="hero-search-travelers"
                className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600"
              >
                <Users className="h-3.5 w-3.5 text-[#0E5A28]" aria-hidden="true" />
                Travelers
              </label>
              <select
                id="hero-search-travelers"
                value={travelers}
                onChange={(e) => setTravelers(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-[#F4F7F5] px-3.5 py-3 text-sm font-medium text-[#111827] focus:border-[#0E5A28] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E5A28]/20"
              >
                {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'Traveler' : 'Travelers'}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                className="btn-liquid flex w-full items-center justify-center gap-2 rounded-full bg-[#0E5A28] px-5 py-3 text-sm font-bold text-white transition-all duration-150 hover:bg-[#136F33] active:scale-[0.98] whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E5A28]"
              >
                <Search className="h-4 w-4" aria-hidden="true" />
                Find Trips
              </button>
            </div>
          </div>
        </motion.form>
      </div>
    </section>
  );
}
