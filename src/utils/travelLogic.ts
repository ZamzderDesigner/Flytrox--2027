import type {
  InquiryFormPayload,
  PackageCategory,
  PackageFormPayload,
  TourPackage,
} from '../types/travel';

export interface PackageFilterOptions {
  query?: string;
  category?: 'All' | PackageCategory;
  minPrice?: number;
  maxPrice?: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

/**
 * Formats an integer INR amount using Indian digit grouping (e.g. 19999 -> "₹19,999", 125000 -> "₹1,25,000").
 */
export function formatINR(amount: number): string {
  const safe = Number.isFinite(amount) ? Math.max(0, Math.round(amount)) : 0;
  return `₹${safe.toLocaleString('en-IN')}`;
}

/**
 * Filters tour packages by keyword, category, and optional price bounds.
 */
export function filterPackages(
  packages: TourPackage[],
  options: PackageFilterOptions
): TourPackage[] {
  const normalizedQuery = (options.query ?? '').trim().toLowerCase();
  const category = options.category ?? 'All';

  return packages.filter((pkg) => {
    if (category !== 'All' && pkg.category !== category) {
      return false;
    }

    if (
      typeof options.minPrice === 'number' &&
      Number.isFinite(options.minPrice) &&
      pkg.priceINR < options.minPrice
    ) {
      return false;
    }

    if (
      typeof options.maxPrice === 'number' &&
      Number.isFinite(options.maxPrice) &&
      pkg.priceINR > options.maxPrice
    ) {
      return false;
    }

    if (normalizedQuery.length > 0) {
      const searchable = [
        pkg.title,
        pkg.destination,
        pkg.category,
        pkg.duration,
        ...pkg.highlights,
      ]
        .join(' ')
        .toLowerCase();

      return searchable.includes(normalizedQuery);
    }

    return true;
  });
}

export function validateEmail(email: string): boolean {
  const trimmed = email.trim();
  if (!trimmed || trimmed.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed);
}

export function validatePhone(phone: string): boolean {
  const digits = phone.replace(/[\s\-()+]/g, '');
  return /^\d{7,15}$/.test(digits);
}

export function validateInquiryPayload(
  payload: Partial<InquiryFormPayload>
): ValidationResult {
  const errors: Record<string, string> = {};

  const fullName = (payload.fullName ?? '').trim();
  if (fullName.length < 2) {
    errors.fullName = 'Please enter your full name (at least 2 characters).';
  }

  const phone = (payload.phone ?? '').trim();
  if (!validatePhone(phone)) {
    errors.phone = 'Please enter a valid phone or WhatsApp number (7–15 digits).';
  }

  const email = (payload.email ?? '').trim();
  if (email.length > 0 && !validateEmail(email)) {
    errors.email = 'Please enter a valid email address.';
  }

  const destination = (payload.destination ?? '').trim();
  if (destination.length < 2) {
    errors.destination = 'Please enter your preferred destination.';
  }

  const travelDate = (payload.travelDate ?? '').trim();
  if (!travelDate) {
    errors.travelDate = 'Please select a tentative travel date.';
  }

  const travelers = Number(payload.travelersCount ?? 0);
  if (!Number.isInteger(travelers) || travelers < 1 || travelers > 50) {
    errors.travelersCount = 'Travelers must be between 1 and 50.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validatePackagePayload(
  payload: Partial<PackageFormPayload>
): ValidationResult {
  const errors: Record<string, string> = {};

  if (!(payload.title ?? '').trim() || (payload.title ?? '').trim().length < 3) {
    errors.title = 'Package title must be at least 3 characters.';
  }

  if (!(payload.destination ?? '').trim()) {
    errors.destination = 'Destination is required.';
  }

  if (payload.category !== 'Domestic' && payload.category !== 'International') {
    errors.category = 'Category must be Domestic or International.';
  }

  if (!(payload.duration ?? '').trim()) {
    errors.duration = 'Duration is required (e.g. 5 Days / 4 Nights).';
  }

  const price = Number(payload.priceINR);
  if (!Number.isFinite(price) || price < 1000) {
    errors.priceINR = 'Price must be at least ₹1,000.';
  }

  if (!Array.isArray(payload.highlights) || payload.highlights.filter((h) => h.trim()).length === 0) {
    errors.highlights = 'Please provide at least one itinerary highlight.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
