import { useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import {
  CheckCircle2,
  Clock,
  Leaf,
  Mail,
  Phone,
  Send,
} from 'lucide-react';
import { submitInquiry, ApiError } from '../services/api';
import { validateInquiryPayload } from '../utils/travelLogic';

export function ContactSustainableSection() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [destination, setDestination] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [travelersCount, setTravelersCount] = useState(2);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError('');
    setSuccessMsg('');

    const payload = {
      fullName,
      phone,
      email,
      destination,
      travelDate,
      travelersCount,
      message: 'Quick callback request from Paperless Travel desk.',
    };

    const validation = validateInquiryPayload(payload);
    if (!validation.valid) {
      setFieldErrors(validation.errors);
      return;
    }

    setFieldErrors({});
    setSubmitting(true);
    try {
      const res = await submitInquiry(payload);
      setSuccessMsg(res.message);
      setFullName('');
      setPhone('');
      setEmail('');
      setDestination('');
      setTravelDate('');
      setTravelersCount(2);
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors) {
        setFieldErrors(err.fieldErrors);
      }
      setServerError(err instanceof Error ? err.message : 'Unable to send request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      className="scroll-mt-16 bg-white py-20 sm:py-24"
      aria-labelledby="paperless-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0E5A28]">
            <Leaf className="h-4 w-4" aria-hidden="true" />
            Digital-First Travel Desk
          </p>
          <h2
            id="paperless-heading"
            className="mt-2 text-3xl font-extrabold tracking-tight uppercase text-[#111827] sm:text-4xl"
          >
            PAPERLESS. SMART. SUSTAINABLE TRAVEL.
          </h2>
          <p className="mt-3 text-base leading-relaxed text-[#4B5563]">
            Every itinerary, e-ticket, hotel voucher, and visa checklist is issued digitally—fast
            for you, lighter on the planet. Connect with our virtual travel desk anytime.
          </p>
        </motion.div>

        {/* 3-Column Contact Info Cards */}
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, delay: 0 }}
            className="rounded-2xl border border-slate-200/80 bg-[#F4F7F5] p-7 text-center transition-all duration-200 hover:-translate-y-1 hover:border-[#0E5A28]/35"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#E6F2EA] text-[#0E5A28]">
              <Phone className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="mt-4 text-base font-bold text-[#111827]">Phone &amp; WhatsApp</h3>
            <p className="mt-1.5 text-sm font-semibold text-[#0E5A28] tabular-nums">
              +91 98470 24500
            </p>
            <p className="mt-1 text-xs text-[#4B5563]">
              Direct advisor line for urgent flight &amp; holiday assistance
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="rounded-2xl border border-slate-200/80 bg-[#F4F7F5] p-7 text-center transition-all duration-200 hover:-translate-y-1 hover:border-[#0E5A28]/35"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#E6F2EA] text-[#0E5A28]">
              <Mail className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="mt-4 text-base font-bold text-[#111827]">Email Our Desk</h3>
            <a
              href="mailto:flytroxtravels@gmail.com"
              className="mt-1.5 inline-block text-sm font-semibold text-[#0E5A28] hover:underline"
            >
              flytroxtravels@gmail.com
            </a>
            <p className="mt-1 text-xs text-[#4B5563]">
              Custom group quotes, corporate itineraries &amp; visa inquiries
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, delay: 0.16 }}
            className="rounded-2xl border border-slate-200/80 bg-[#F4F7F5] p-7 text-center transition-all duration-200 hover:-translate-y-1 hover:border-[#0E5A28]/35"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#E6F2EA] text-[#0E5A28]">
              <Clock className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="mt-4 text-base font-bold text-[#111827]">Virtual Desk Hours</h3>
            <p className="mt-1.5 text-sm font-semibold text-[#0E5A28]">
              Mon – Sun · 08:30 AM – 10:00 PM IST
            </p>
            <p className="mt-1 text-xs text-[#4B5563]">
              24/7 WhatsApp helpline for active traveling guests
            </p>
          </motion.div>
        </div>

        {/* Wide Emerald-Gradient Quick Inquiry / Callback Card */}
        <motion.div
          initial={{ opacity: 0, y: -24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 overflow-hidden rounded-3xl bg-gradient-to-br from-[#0A421D] via-[#0E5A28] to-[#136F33] p-7 text-white shadow-lg sm:p-10"
        >
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-4">
              <p className="text-xs font-semibold tracking-wider text-emerald-200 uppercase">
                Instant Callback Desk
              </p>
              <h3 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                Request a Personalized Travel Quote
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-emerald-100/90">
                Share your destination and tentative dates. Our travel planner will reply on
                WhatsApp or email with flight + stay options within 30 minutes.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              noValidate
              aria-label="Quick travel callback inquiry form"
              className="rounded-2xl bg-white p-6 text-[#111827] shadow-md lg:col-span-8"
            >
              {successMsg && (
                <div
                  role="status"
                  className="mb-5 flex items-start gap-2.5 rounded-xl bg-[#E6F2EA] p-4 text-sm font-medium text-[#0E5A28]"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                  <span>{successMsg}</span>
                </div>
              )}

              {serverError && (
                <div
                  role="alert"
                  className="mb-5 rounded-xl bg-red-50 border border-red-200 p-3.5 text-sm font-medium text-red-700"
                >
                  {serverError}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="quick-name" className="block text-xs font-semibold text-slate-700">
                    Full Name *
                  </label>
                  <input
                    id="quick-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ananya Menon"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-[#F4F7F5] px-3.5 py-2.5 text-sm text-[#111827] focus:border-[#0E5A28] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E5A28]/20"
                  />
                  {fieldErrors.fullName && (
                    <p className="mt-1 text-xs font-medium text-red-600">{fieldErrors.fullName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="quick-phone" className="block text-xs font-semibold text-slate-700">
                    Phone / WhatsApp *
                  </label>
                  <input
                    id="quick-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-[#F4F7F5] px-3.5 py-2.5 text-sm text-[#111827] focus:border-[#0E5A28] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E5A28]/20"
                  />
                  {fieldErrors.phone && (
                    <p className="mt-1 text-xs font-medium text-red-600">{fieldErrors.phone}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="quick-email" className="block text-xs font-semibold text-slate-700">
                    Email Address
                  </label>
                  <input
                    id="quick-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-[#F4F7F5] px-3.5 py-2.5 text-sm text-[#111827] focus:border-[#0E5A28] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E5A28]/20"
                  />
                  {fieldErrors.email && (
                    <p className="mt-1 text-xs font-medium text-red-600">{fieldErrors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="quick-destination" className="block text-xs font-semibold text-slate-700">
                    Preferred Destination *
                  </label>
                  <input
                    id="quick-destination"
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. Dubai, Kashmir, Maldives"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-[#F4F7F5] px-3.5 py-2.5 text-sm text-[#111827] focus:border-[#0E5A28] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E5A28]/20"
                  />
                  {fieldErrors.destination && (
                    <p className="mt-1 text-xs font-medium text-red-600">
                      {fieldErrors.destination}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="quick-date" className="block text-xs font-semibold text-slate-700">
                    Tentative Travel Date *
                  </label>
                  <input
                    id="quick-date"
                    type="date"
                    value={travelDate}
                    onChange={(e) => setTravelDate(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-[#F4F7F5] px-3.5 py-2.5 text-sm text-[#111827] focus:border-[#0E5A28] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E5A28]/20 tabular-nums"
                  />
                  {fieldErrors.travelDate && (
                    <p className="mt-1 text-xs font-medium text-red-600">{fieldErrors.travelDate}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="quick-travelers" className="block text-xs font-semibold text-slate-700">
                    Travelers *
                  </label>
                  <select
                    id="quick-travelers"
                    value={travelersCount}
                    onChange={(e) => setTravelersCount(Number(e.target.value))}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-[#F4F7F5] px-3.5 py-2.5 text-sm text-[#111827] focus:border-[#0E5A28] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E5A28]/20"
                  >
                    {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((count) => (
                      <option key={count} value={count}>
                        {count} {count === 1 ? 'Traveler' : 'Travelers'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                <p className="text-xs text-[#4B5563]">
                  Zero spam. Your details are used only for preparing your itinerary.
                </p>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-liquid inline-flex items-center justify-center gap-2 rounded-full bg-[#0E5A28] px-7 py-3 text-sm font-bold text-white transition-all duration-150 hover:bg-[#136F33] active:scale-[0.98] disabled:opacity-60 whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E5A28]"
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                  <span>{submitting ? 'Sending Request...' : 'Request Callback'}</span>
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
