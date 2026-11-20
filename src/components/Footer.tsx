import { useState, type FormEvent } from 'react';
import { Globe, Instagram, Mail, Phone, Send } from 'lucide-react';
import { FlytroxLogo } from './FlytroxLogo';
import { subscribeToNewsletter } from '../services/api';
import { validateEmail } from '../utils/travelLogic';

interface FooterProps {
  onNavigateAdmin: () => void;
}

export function Footer({ onNavigateAdmin }: FooterProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; text: string }>({
    type: 'idle',
    text: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubscribe = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setStatus({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }

    setSubmitting(true);
    setStatus({ type: 'idle', text: '' });
    try {
      const res = await subscribeToNewsletter(email);
      setStatus({ type: 'success', text: res.message });
      if (!res.alreadySubscribed) {
        setEmail('');
      }
    } catch (err) {
      setStatus({
        type: 'error',
        text: err instanceof Error ? err.message : 'Subscription failed.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="bg-[#0A421D] text-emerald-50">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Left: White Flytrox Logo & Agency Bio */}
          <div className="lg:col-span-4">
            <FlytroxLogo variant="light" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-emerald-100/85">
              Flytrox Tours &amp; Travels (flytroxtravels.in) crafts effortless domestic and
              international holidays, flight bookings, visa assistance, and 100% paperless
              travel documentation.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href="mailto:flytroxtravels@gmail.com"
                aria-label="Email Flytrox Tours & Travels"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white hover:text-[#0E5A28]"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href="tel:+919847024500"
                aria-label="Call Flytrox Tours & Travels"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white hover:text-[#0E5A28]"
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href="#destinations"
                aria-label="Flytrox Global Destinations"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white hover:text-[#0E5A28]"
              >
                <Globe className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href="#contact"
                aria-label="Flytrox Travel Updates"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white hover:text-[#0E5A28]"
              >
                <Instagram className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Center: Quick Navigation & Services */}
          <div className="grid grid-cols-2 gap-8 lg:col-span-4">
            <div>
              <h3 className="text-xs font-bold tracking-wider text-emerald-200 uppercase">
                Explore
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm text-emerald-100/85">
                <li>
                  <a href="#home" className="hover:text-white transition-colors">
                    Home
                  </a>
                </li>
                <li>
                  <a href="#destinations" className="hover:text-white transition-colors">
                    Popular Destinations
                  </a>
                </li>
                <li>
                  <a href="#services" className="hover:text-white transition-colors">
                    Travel Services
                  </a>
                </li>
                <li>
                  <a href="#about" className="hover:text-white transition-colors">
                    Who We Are
                  </a>
                </li>
                <li>
                  <a href="#packages" className="hover:text-white transition-colors">
                    Holiday Packages
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold tracking-wider text-emerald-200 uppercase">
                Services
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm text-emerald-100/85">
                <li>
                  <a href="#services" className="hover:text-white transition-colors">
                    Flight Ticketing
                  </a>
                </li>
                <li>
                  <a href="#services" className="hover:text-white transition-colors">
                    Custom Holidays
                  </a>
                </li>
                <li>
                  <a href="#services" className="hover:text-white transition-colors">
                    Hotel &amp; Resort Stays
                  </a>
                </li>
                <li>
                  <a href="#services" className="hover:text-white transition-colors">
                    Visa &amp; Attestation
                  </a>
                </li>
                <li>
                  <a href="#services" className="hover:text-white transition-colors">
                    Travel Insurance
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Right: Newsletter Subscription */}
          <div className="lg:col-span-4">
            <h3 className="text-xs font-bold tracking-wider text-emerald-200 uppercase">
              Seasonal Fare Alerts
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-emerald-100/85">
              Subscribe for early-bird INR package drops, festival flight fares, and visa-free
              getaway guides.
            </p>
            <form onSubmit={handleSubscribe} noValidate className="mt-4 flex flex-col gap-3 sm:flex-row">
              <label htmlFor="footer-newsletter-email" className="sr-only">
                Email address for Flytrox newsletter
              </label>
              <input
                id="footer-newsletter-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="min-w-0 flex-1 rounded-full border border-white/25 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-emerald-200/75 focus:border-white focus:bg-white/15 focus:outline-none"
              />
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-[#0E5A28] transition-all duration-150 hover:bg-emerald-50 active:scale-[0.98] disabled:opacity-60 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{submitting ? 'Joining...' : 'Subscribe'}</span>
              </button>
            </form>
            {status.type !== 'idle' && (
              <p
                role={status.type === 'error' ? 'alert' : 'status'}
                className={`mt-2.5 text-xs font-medium ${
                  status.type === 'error' ? 'text-amber-200' : 'text-emerald-200'
                }`}
              >
                {status.text}
              </p>
            )}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/15 pt-6 text-xs text-emerald-200/80 sm:flex-row">
          <p>© {new Date().getFullYear()} Flytrox Tours &amp; Travels (flytroxtravels.in). All rights reserved.</p>
          <div className="flex items-center gap-5">
            <a href="#contact" className="hover:text-white transition-colors">
              flytroxtravels@gmail.com
            </a>
            <button
              type="button"
              onClick={onNavigateAdmin}
              className="font-semibold text-emerald-200 underline-offset-4 hover:text-white hover:underline cursor-pointer"
            >
              Staff Portal
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
