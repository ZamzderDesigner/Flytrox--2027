import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  BadgeIndianRupee,
  ChevronDown,
  Globe2,
  Headset,
  MapPinned,
} from 'lucide-react';

const HIGHLIGHTS = [
  {
    id: 'transparent-pricing',
    title: 'Transparent Pricing',
    summary: 'Itemized quotes in INR with zero hidden surcharges or surprise airport add-ons.',
    detail:
      'Every quotation clearly breaks down airfare, accommodation category, private transfers, taxes, and optional activities before you confirm. What you approve on your itinerary is the exact amount you pay.',
    icon: BadgeIndianRupee,
  },
  {
    id: 'tailored-itineraries',
    title: 'Tailored Itineraries',
    summary: 'Custom day-by-day plans designed around your travel style, pace, and budget.',
    detail:
      'We do not force travelers into rigid group bus schedules. Whether you prefer leisurely mornings in Munnar, adventure trails in Gulmarg, or luxury dining in Dubai, your route is customized around your group.',
    icon: MapPinned,
  },
  {
    id: 'trusted-partners',
    title: 'Trusted Global Partners',
    summary: 'Direct contracts with audited hospitality groups, airlines, and licensed ground fleets.',
    detail:
      'Our vetted network across India, the UAE, Malaysia, Indonesia, and island resorts ensures confirmed room allocations, clean private vehicles, and reliable airport meet-and-greet hosts.',
    icon: Globe2,
  },
  {
    id: 'dedicated-support',
    title: 'Dedicated Support',
    summary: 'Real human travel advisors reachable on WhatsApp and phone before and during your trip.',
    detail:
      'From pre-departure web check-ins and visa checklists to real-time flight delay rerouting, one dedicated Flytrox coordinator stays with your booking from takeoff until you return home.',
    icon: Headset,
  },
];

export function WhoWeAreSection() {
  const [openId, setOpenId] = useState<string>('transparent-pricing');

  const toggleItem = (id: string) => {
    setOpenId((current) => (current === id ? '' : id));
  };

  return (
    <section
      id="about"
      className="scroll-mt-16 bg-white py-20 sm:py-24"
      aria-labelledby="who-we-are-heading"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-sm font-semibold text-[#0E5A28]">
            About Flytrox Tours &amp; Travels
          </p>
          <h2
            id="who-we-are-heading"
            className="mt-2 text-3xl font-extrabold tracking-tight uppercase text-[#111827] sm:text-4xl"
          >
            WHO WE ARE
          </h2>
          <p className="mt-3 text-base leading-relaxed text-[#4B5563]">
            Flytrox is a modern, paperless travel agency built around clarity, responsiveness,
            and thoughtful itinerary craft for leisure and corporate travelers across India.
          </p>
        </motion.div>

        {/* Vertical Stack of 4 Soft-Mint Interactive Highlight Bars */}
        <div className="mt-12 space-y-4">
          {HIGHLIGHTS.map((item, idx) => {
            const Icon = item.icon;
            const isOpen = openId === item.id;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: -18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="overflow-hidden rounded-2xl border border-[#0E5A28]/12 bg-[#E6F2EA] transition-colors duration-200 hover:bg-[#dceee2]"
              >
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  aria-expanded={isOpen}
                  aria-controls={`who-panel-${item.id}`}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#0E5A28]"
                >
                  <div className="flex items-center gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#0E5A28] shadow-xs">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-[#111827] sm:text-lg">
                        {item.title}
                      </h3>
                      <p className="mt-0.5 text-sm text-[#4B5563]">{item.summary}</p>
                    </div>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-[#0E5A28] transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : 'rotate-0'
                    }`}
                    aria-hidden="true"
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`who-panel-${item.id}`}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-[#0E5A28]/10 bg-white/70 px-6 py-4 text-sm leading-relaxed text-[#374151] sm:pl-[5.25rem]"
                    >
                      {item.detail}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Wide Green Gradient Mission Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 rounded-2xl bg-gradient-to-r from-[#0A421D] via-[#0E5A28] to-[#136F33] p-8 text-white shadow-md sm:p-10"
        >
          <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:items-center">
            <div className="md:col-span-8">
              <p className="text-xs font-semibold tracking-wider text-emerald-200 uppercase">
                Our Commitment
              </p>
              <h3 className="mt-2 text-2xl font-extrabold tracking-tight text-white">
                Seamless Journeys, Built Around Trust &amp; Digital Simplicity
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-emerald-50/90 sm:text-base">
                Every ticket, hotel confirmation, and transfer schedule is delivered cleanly to
                your phone with zero paper clutter—backed by real travel specialists who care
                about every mile of your journey.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 md:col-span-4 border-t border-white/15 pt-6 md:border-t-0 md:border-l md:pt-0 md:pl-6">
              <div>
                <p className="text-2xl font-extrabold text-white tabular-nums">100%</p>
                <p className="mt-0.5 text-xs text-emerald-100/90">Paperless Vouchers</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-white tabular-nums">24/7</p>
                <p className="mt-0.5 text-xs text-emerald-100/90">Trip Desk Support</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-white tabular-nums">40+</p>
                <p className="mt-0.5 text-xs text-emerald-100/90">Global Routes</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-white tabular-nums">4.9/5</p>
                <p className="mt-0.5 text-xs text-emerald-100/90">Traveler Rating</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
