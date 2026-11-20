import { motion } from 'motion/react';
import {
  Building2,
  Compass,
  FileCheck2,
  Headphones,
  Plane,
  ShieldCheck,
} from 'lucide-react';

interface ServicesSectionProps {
  onInquireService: (serviceTitle: string) => void;
}

const TRAVEL_SERVICES = [
  {
    id: 'flight-ticketing',
    title: 'Flight Ticketing',
    description:
      'Competitive domestic and international airfares with instant e-ticket delivery, multi-city routing, and flexible rescheduling guidance.',
    icon: Plane,
  },
  {
    id: 'holiday-packages',
    title: 'Customized Holiday Packages',
    description:
      'Bespoke honeymoons, family retreats, and corporate getaways structured around your travel pace, comfort tier, and dates.',
    icon: Compass,
  },
  {
    id: 'hotel-bookings',
    title: 'Hotel & Resort Bookings',
    description:
      'Verified boutique villas, city business hotels, and coastal resorts vetted for cleanliness, location, and transparent meal plans.',
    icon: Building2,
  },
  {
    id: 'visa-attestation',
    title: 'Visa & Attestation Assistance',
    description:
      'End-to-end tourist visa filing, document checklists, embassy appointment scheduling, and certificate attestation support.',
    icon: FileCheck2,
  },
  {
    id: 'travel-insurance',
    title: 'Travel Insurance',
    description:
      'Comprehensive overseas medical coverage, baggage delay protection, and trip cancellation policies issued digitally before takeoff.',
    icon: ShieldCheck,
  },
  {
    id: 'support-24-7',
    title: '24/7 Customer Travel Support',
    description:
      'Direct WhatsApp and phone concierge available across time zones for boarding updates, transfer coordination, and emergency rebooking.',
    icon: Headphones,
  },
];

export function ServicesSection({ onInquireService }: ServicesSectionProps) {
  return (
    <section
      id="services"
      className="scroll-mt-16 bg-[#F4F7F5] py-20 sm:py-24"
      aria-labelledby="services-heading"
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
            End-to-End Travel Management
          </p>
          <h2
            id="services-heading"
            className="mt-2 text-3xl font-extrabold tracking-tight uppercase text-[#111827] sm:text-4xl"
          >
            OUR TRAVEL SERVICES
          </h2>
          <p className="mt-3 text-base leading-relaxed text-[#4B5563]">
            Everything required for a smooth departure and stress-free return, unified under
            one responsive desk.
          </p>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TRAVEL_SERVICES.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.article
                key={service.id}
                initial={{ opacity: 0, y: -24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.45,
                  delay: (index % 3) * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-7 transition-all duration-200 hover:-translate-y-1.5 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E6F2EA] text-[#0E5A28] transition-colors duration-200 group-hover:bg-[#0E5A28] group-hover:text-white">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>

                <h3 className="mt-5 text-lg font-bold text-[#111827]">{service.title}</h3>
                <p className="mt-2.5 flex-1 text-sm leading-relaxed text-[#4B5563]">
                  {service.description}
                </p>

                <button
                  type="button"
                  onClick={() => onInquireService(service.title)}
                  className="mt-5 self-start text-xs font-bold tracking-wide text-[#0E5A28] uppercase transition-colors hover:text-[#136F33] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E5A28] rounded"
                >
                  Request Assistance →
                </button>

                {/* Animated Emerald Bottom Accent Bar expanding left-to-right via compositor scaleX */}
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-[#0E5A28] transition-transform duration-300 ease-out group-hover:scale-x-100"
                />
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
