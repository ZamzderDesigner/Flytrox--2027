import { useEffect, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, X } from 'lucide-react';
import type { TourPackage } from '../types/travel';
import { ApiError, submitInquiry } from '../services/api';
import { formatINR, validateInquiryPayload } from '../utils/travelLogic';

export interface BookingModalContext {
  selectedPackage?: TourPackage | null;
  prefillDestination?: string;
  prefillDate?: string;
  prefillTravelers?: number;
  prefillMessage?: string;
}

interface BookingModalProps {
  open: boolean;
  context: BookingModalContext;
  onClose: () => void;
}

export function BookingModal({ open, context, onClose }: BookingModalProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [destination, setDestination] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [travelersCount, setTravelersCount] = useState(2);
  const [message, setMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmedRef, setConfirmedRef] = useState('');

  useEffect(() => {
    if (!open) return;
    setFieldErrors({});
    setServerError('');
    setConfirmedRef('');
    setDestination(
      context.selectedPackage?.destination || context.prefillDestination || ''
    );
    setTravelDate(context.prefillDate || '');
    setTravelersCount(context.prefillTravelers || 2);
    setMessage(context.prefillMessage || '');
  }, [open, context]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError('');

    const payload = {
      fullName,
      email,
      phone,
      packageId: context.selectedPackage?._id,
      packageTitle: context.selectedPackage?.title,
      destination,
      travelDate,
      travelersCount,
      message,
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
      setConfirmedRef(res.data._id);
      setFullName('');
      setEmail('');
      setPhone('');
      setMessage('');
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors) {
        setFieldErrors(err.fieldErrors);
      }
      setServerError(err instanceof Error ? err.message : 'Unable to submit booking inquiry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="booking-modal-title"
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0D1512]/70 backdrop-blur-xs"
          />

          {/* Modal Panel */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 bg-[#0E5A28] px-6 py-5 text-white">
              <div>
                <p className="text-xs font-semibold tracking-wider text-emerald-200 uppercase">
                  Flytrox Booking &amp; Quote Desk
                </p>
                <h2 id="booking-modal-title" className="mt-1 text-xl font-extrabold">
                  {context.selectedPackage ? context.selectedPackage.title : 'Plan Your Next Journey'}
                </h2>
                {context.selectedPackage && (
                  <p className="mt-1 text-xs font-medium text-emerald-100 tabular-nums">
                    {context.selectedPackage.duration} · Starting{' '}
                    {formatINR(context.selectedPackage.priceINR)} per person
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close booking dialog"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              {confirmedRef ? (
                <div className="py-6 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E6F2EA] text-[#0E5A28]">
                    <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 text-xl font-extrabold text-[#111827]">
                    Inquiry Confirmed
                  </h3>
                  <p className="mt-2 text-sm text-[#4B5563]">
                    Thank you for choosing Flytrox Tours &amp; Travels. Your reference ID is{' '}
                    <span className="font-mono font-semibold text-[#0E5A28]">{confirmedRef}</span>.
                    Our travel coordinator will send your paperless itinerary &amp; quote shortly.
                  </p>
                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-6 rounded-full bg-[#0E5A28] px-7 py-2.5 text-sm font-bold text-white hover:bg-[#136F33] transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                  {serverError && (
                    <div
                      role="alert"
                      className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700"
                    >
                      {serverError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="modal-fullName"
                        className="block text-xs font-semibold text-slate-700"
                      >
                        Full Name *
                      </label>
                      <input
                        id="modal-fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Your full name"
                        className="mt-1.5 w-full rounded-xl border border-slate-200 bg-[#F4F7F5] px-3.5 py-2.5 text-sm text-[#111827] focus:border-[#0E5A28] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E5A28]/20"
                      />
                      {fieldErrors.fullName && (
                        <p className="mt-1 text-xs font-medium text-red-600">
                          {fieldErrors.fullName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="modal-phone"
                        className="block text-xs font-semibold text-slate-700"
                      >
                        Phone / WhatsApp *
                      </label>
                      <input
                        id="modal-phone"
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
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="modal-email"
                        className="block text-xs font-semibold text-slate-700"
                      >
                        Email Address
                      </label>
                      <input
                        id="modal-email"
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
                      <label
                        htmlFor="modal-destination"
                        className="block text-xs font-semibold text-slate-700"
                      >
                        Destination *
                      </label>
                      <input
                        id="modal-destination"
                        type="text"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        placeholder="e.g. Kashmir, Dubai, Munnar"
                        className="mt-1.5 w-full rounded-xl border border-slate-200 bg-[#F4F7F5] px-3.5 py-2.5 text-sm text-[#111827] focus:border-[#0E5A28] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E5A28]/20"
                      />
                      {fieldErrors.destination && (
                        <p className="mt-1 text-xs font-medium text-red-600">
                          {fieldErrors.destination}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="modal-travelDate"
                        className="block text-xs font-semibold text-slate-700"
                      >
                        Travel Date *
                      </label>
                      <input
                        id="modal-travelDate"
                        type="date"
                        value={travelDate}
                        onChange={(e) => setTravelDate(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-slate-200 bg-[#F4F7F5] px-3.5 py-2.5 text-sm text-[#111827] focus:border-[#0E5A28] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E5A28]/20 tabular-nums"
                      />
                      {fieldErrors.travelDate && (
                        <p className="mt-1 text-xs font-medium text-red-600">
                          {fieldErrors.travelDate}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="modal-travelers"
                        className="block text-xs font-semibold text-slate-700"
                      >
                        Number of Travelers *
                      </label>
                      <input
                        id="modal-travelers"
                        type="number"
                        min={1}
                        max={50}
                        value={travelersCount}
                        onChange={(e) => setTravelersCount(Number(e.target.value))}
                        className="mt-1.5 w-full rounded-xl border border-slate-200 bg-[#F4F7F5] px-3.5 py-2.5 text-sm text-[#111827] focus:border-[#0E5A28] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E5A28]/20 tabular-nums"
                      />
                      {fieldErrors.travelersCount && (
                        <p className="mt-1 text-xs font-medium text-red-600">
                          {fieldErrors.travelersCount}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="modal-message"
                      className="block text-xs font-semibold text-slate-700"
                    >
                      Special Preferences (Departure city, hotel tier, flight needs)
                    </label>
                    <textarea
                      id="modal-message"
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us your departure airport or any custom itinerary notes..."
                      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-[#F4F7F5] px-3.5 py-2.5 text-sm text-[#111827] focus:border-[#0E5A28] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E5A28]/20"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-liquid rounded-full bg-[#0E5A28] px-7 py-2.5 text-sm font-bold text-white transition-all duration-150 hover:bg-[#136F33] active:scale-[0.98] disabled:opacity-60 cursor-pointer"
                    >
                      {submitting ? 'Submitting...' : 'Submit Booking Request'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
