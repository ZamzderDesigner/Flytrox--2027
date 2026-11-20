import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Star } from 'lucide-react';
import type { DestinationItem } from '../types/travel';
import { formatINR } from '../utils/travelLogic';
import { SafeImage } from './SafeImage';

interface DestinationsSectionProps {
  destinations: DestinationItem[];
  loading: boolean;
  onSelectDestination: (destinationName: string) => void;
}

export function DestinationsSection({
  destinations,
  loading,
  onSelectDestination,
}: DestinationsSectionProps) {
  const [expanded, setExpanded] = useState(false);

  const visibleDestinations = expanded ? destinations : destinations.slice(0, 3);
  const hasMore = destinations.length > 3;

  return (
    <section
      id="destinations"
      className="scroll-mt-16 bg-white py-20 sm:py-24"
      aria-labelledby="destinations-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-sm font-semibold text-[#0E5A28]">
            Curated Places Worth Travelling For
          </p>
          <h2
            id="destinations-heading"
            className="mt-2 text-3xl font-extrabold tracking-tight uppercase text-[#111827] sm:text-4xl"
          >
            POPULAR DESTINATION
          </h2>
          <p className="mt-3 text-base leading-relaxed text-[#4B5563]">
            Handpicked coastal islands, vibrant international skylines, and serene hill
            escapes planned end-to-end with verified stays and flight connections.
          </p>
        </motion.div>

        {loading ? (
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-96 animate-pulse rounded-2xl bg-[#F4F7F5] border border-slate-200/70"
              />
            ))}
          </div>
        ) : (
          <div
            data-testid="destinations-grid"
            className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
          >
            {visibleDestinations.map((dest, idx) => (
              <motion.article
                key={dest._id}
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.42,
                  delay: (idx % 3) * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="group relative flex flex-col"
              >
                {/* Scenic Image Container */}
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#0D1512] shadow-sm ring-1 ring-slate-900/5 transition-all duration-300 group-hover:ring-[#0E5A28]/40">
                  <SafeImage
                    src={dest.imageUrl}
                    alt={`${dest.name}, ${dest.country}`}
                    fallbackTitle={dest.name}
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"
                  />
                  {/* Quiet emerald rating & highlight strip at top */}
                  <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between text-xs font-semibold text-white">
                    <span className="rounded-md bg-[#0E5A28]/90 px-2.5 py-1 backdrop-blur-xs">
                      {dest.badgeText}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-black/55 px-2 py-1 backdrop-blur-xs tabular-nums">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
                      {dest.rating.toFixed(1)}
                    </span>
                  </div>
                </div>

                {/* Overlapping Floating White Detail Card */}
                <div className="relative z-10 -mt-10 mx-4 flex flex-1 flex-col rounded-2xl border border-slate-200/90 bg-white p-5 shadow-md transition-all duration-300 ease-out group-hover:-translate-y-1.5 group-hover:border-[#0E5A28]/45 group-hover:shadow-[0_14px_30px_-10px_rgba(14,90,40,0.22)]">
                  <div className="flex items-baseline justify-between gap-2 text-xs font-medium text-[#4B5563]">
                    <span>{dest.country}</span>
                    <span className="font-semibold text-[#0E5A28] tabular-nums">
                      From {formatINR(dest.startingPrice)}
                    </span>
                  </div>
                  <h3 className="mt-1.5 text-xl font-bold text-[#111827]">{dest.name}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-[#4B5563]">
                    {dest.tagline}
                  </p>
                  <button
                    type="button"
                    onClick={() => onSelectDestination(dest.name)}
                    className="mt-4 inline-flex items-center gap-1.5 self-start text-sm font-bold text-[#0E5A28] transition-colors hover:text-[#136F33] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E5A28] rounded"
                  >
                    <span>Plan {dest.name} Trip</span>
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

        {hasMore && (
          <div className="mt-12 text-center">
            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              className="btn-liquid inline-flex items-center justify-center rounded-full bg-[#0E5A28] px-8 py-3 text-sm font-bold text-white shadow-xs transition-all duration-150 hover:bg-[#136F33] active:scale-[0.98] whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E5A28]"
            >
              {expanded ? 'Show Less' : `View More (${destinations.length - 3} More)`}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
