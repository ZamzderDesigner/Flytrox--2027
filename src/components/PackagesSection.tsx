import { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Check,
  Clock,
  MapPin,
  Star,
  Users,
  X,
} from 'lucide-react';
import type { PackageCategory, TourPackage } from '../types/travel';
import { filterPackages, formatINR } from '../utils/travelLogic';
import { SafeImage } from './SafeImage';

interface PackagesSectionProps {
  packages: TourPackage[];
  loading: boolean;
  searchQuery: string;
  selectedCategory: 'All' | PackageCategory;
  onCategoryChange: (cat: 'All' | PackageCategory) => void;
  onClearSearch: () => void;
  onBookPackage: (pkg: TourPackage) => void;
}

const CATEGORIES: Array<{ label: string; value: 'All' | PackageCategory }> = [
  { label: 'All Packages', value: 'All' },
  { label: 'Domestic', value: 'Domestic' },
  { label: 'International', value: 'International' },
];

export function PackagesSection({
  packages,
  loading,
  searchQuery,
  selectedCategory,
  onCategoryChange,
  onClearSearch,
  onBookPackage,
}: PackagesSectionProps) {
  const [showAll, setShowAll] = useState(false);

  const filtered = filterPackages(packages, {
    category: selectedCategory,
    query: searchQuery,
  });

  const visiblePackages = showAll || searchQuery ? filtered : filtered.slice(0, 4);
  const canExpand = !searchQuery && filtered.length > 4;

  return (
    <section
      id="packages"
      className="scroll-mt-16 bg-[#F4F7F5] py-20 sm:py-24"
      aria-labelledby="packages-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-sm font-semibold text-[#0E5A28]">
            Transparent INR Holiday Pricing
          </p>
          <h2
            id="packages-heading"
            className="mt-2 text-3xl font-extrabold tracking-tight uppercase text-[#111827] sm:text-4xl"
          >
            CHECKOUT OUR PACKAGES
          </h2>
          <p className="mt-3 text-base leading-relaxed text-[#4B5563]">
            Thoughtfully paced domestic and international itineraries with handpicked hotels,
            transfers, and guided highlights included.
          </p>
        </motion.div>

        {/* Interactive Category Filter Segmented Control + Active Search Notice */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <div
            role="tablist"
            aria-label="Filter packages by region"
            className="inline-flex items-center gap-1 rounded-full bg-white p-1 border border-slate-200 shadow-2xs"
          >
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => onCategoryChange(cat.value)}
                  className={`rounded-full px-4 py-2 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#0E5A28] text-white'
                      : 'text-slate-600 hover:text-[#0E5A28]'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 text-sm text-[#4B5563]">
            {searchQuery && (
              <div className="inline-flex items-center gap-2 rounded-full bg-[#E6F2EA] px-4 py-1.5 text-xs font-semibold text-[#0E5A28]">
                <span>Showing matches for &ldquo;{searchQuery}&rdquo;</span>
                <button
                  type="button"
                  onClick={onClearSearch}
                  aria-label="Clear destination search filter"
                  className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-[#0E5A28] hover:bg-[#0E5A28] hover:text-white transition-colors cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            <span className="text-xs font-medium text-slate-500 tabular-nums">
              {filtered.length} {filtered.length === 1 ? 'package' : 'packages'} available
            </span>
          </div>
        </div>

        {/* Horizontal 3-Part Split Cards */}
        {loading ? (
          <div className="mt-8 space-y-6">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-56 animate-pulse rounded-2xl bg-white border border-slate-200/70"
              />
            ))}
          </div>
        ) : visiblePackages.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <p className="text-lg font-bold text-[#111827]">
              No packages matched &ldquo;{searchQuery}&rdquo;
            </p>
            <p className="mt-2 text-sm text-[#4B5563]">
              Try clearing your filter or request a custom itinerary tailored to your exact destination.
            </p>
            <button
              type="button"
              onClick={onClearSearch}
              className="mt-5 rounded-full bg-[#0E5A28] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#136F33] transition-colors cursor-pointer"
            >
              Reset Package Filters
            </button>
          </div>
        ) : (
          <div data-testid="packages-list" className="mt-8 space-y-6">
            {visiblePackages.map((pkg, idx) => (
              <motion.article
                key={pkg._id}
                initial={{ opacity: 0, y: -24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.12 }}
                transition={{
                  duration: 0.45,
                  delay: Math.min(idx, 3) * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="group grid grid-cols-1 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs transition-all duration-300 hover:shadow-lg lg:grid-cols-12"
              >
                {/* Left: Scenic Thumbnail */}
                <div className="relative aspect-[4/3] overflow-hidden bg-[#0D1512] lg:col-span-4 lg:aspect-auto lg:h-full">
                  <SafeImage
                    src={pkg.imageUrl}
                    alt={`${pkg.title} — ${pkg.destination}`}
                    fallbackTitle={pkg.title}
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
                  />
                </div>

                {/* Middle: Title, Metadata & Highlights */}
                <div className="flex flex-col justify-between p-6 sm:p-7 lg:col-span-5">
                  <div>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-[#0E5A28]">
                      <span>{pkg.category}</span>
                      <span aria-hidden="true" className="text-slate-300">
                        ·
                      </span>
                      <span className="inline-flex items-center gap-1 text-[#4B5563]">
                        <MapPin className="h-3.5 w-3.5 text-[#0E5A28]" aria-hidden="true" />
                        {pkg.destination}
                      </span>
                    </div>

                    <h3 className="mt-2 text-xl font-extrabold tracking-tight text-[#111827] sm:text-2xl">
                      {pkg.title}
                    </h3>

                    <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-[#4B5563] tabular-nums">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-[#0E5A28]" aria-hidden="true" />
                        {pkg.duration}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-[#0E5A28]" aria-hidden="true" />
                        {pkg.paxLabel}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
                        {pkg.rating.toFixed(1)} ({pkg.reviewsCount} reviews)
                      </span>
                    </div>

                    <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                      {pkg.highlights.slice(0, 3).map((highlight, hIdx) => (
                        <li
                          key={hIdx}
                          className="flex items-start gap-2 text-sm text-[#4B5563]"
                        >
                          <Check
                            className="mt-0.5 h-4 w-4 shrink-0 text-[#0E5A28]"
                            aria-hidden="true"
                          />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Right: Solid Emerald Price Block */}
                <div className="flex flex-col items-center justify-center bg-[#0E5A28] p-6 text-center text-white transition-colors duration-300 group-hover:bg-[#136F33] sm:p-7 lg:col-span-3">
                  <span className="text-xs font-semibold tracking-wider text-emerald-200 uppercase">
                    Starting From
                  </span>
                  <p className="mt-1.5 text-3xl font-extrabold tracking-tight text-white tabular-nums sm:text-4xl">
                    {formatINR(pkg.priceINR)}
                  </p>
                  <span className="mt-1 text-xs font-medium text-emerald-100/90">
                    per person · twin sharing
                  </span>

                  <button
                    type="button"
                    onClick={() => onBookPackage(pkg)}
                    aria-label={`Book Now for ${pkg.title}`}
                    className="mt-6 inline-flex items-center justify-center gap-2 rounded-full border-2 border-white bg-white/10 px-6 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:bg-white hover:text-[#0E5A28] active:scale-[0.98] whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    <span>Book Now</span>
                    <ArrowRight
                      className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        )}

        {canExpand && (
          <div className="mt-12 text-center">
            <button
              type="button"
              onClick={() => setShowAll((prev) => !prev)}
              className="btn-liquid inline-flex items-center justify-center rounded-full bg-[#0E5A28] px-8 py-3.5 text-sm font-bold text-white shadow-xs transition-all duration-150 hover:bg-[#136F33] active:scale-[0.98] whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E5A28]"
            >
              {showAll
                ? 'Show Featured Packages'
                : `View All Packages (${filtered.length})`}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
