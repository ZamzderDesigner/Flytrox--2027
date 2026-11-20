import test from 'node:test';
import assert from 'node:assert/strict';
import {
  filterPackages,
  formatINR,
  validateEmail,
  validateInquiryPayload,
  validatePackagePayload,
  validatePhone,
} from './travelLogic';
import type { TourPackage } from '../types/travel';

const SAMPLE_PACKAGES: TourPackage[] = [
  {
    _id: 'pkg-1',
    title: 'Kashmir Dal Lake & Gulmarg Escape',
    destination: 'Kashmir, India',
    category: 'Domestic',
    duration: '5 Days / 4 Nights',
    paxLabel: '2–6 Pax',
    priceINR: 19999,
    imageUrl: '/src/assets/images/pkg_kashmir_dallake.jpg',
    highlights: ['Shikara ride on Dal Lake', 'Gulmarg Gondola tickets', 'Houseboat stay'],
    rating: 4.9,
    reviewsCount: 128,
    isPopular: true,
    isFeatured: true,
  },
  {
    _id: 'pkg-2',
    title: 'Kuala Lumpur & Genting Highlights',
    destination: 'Kuala Lumpur, Malaysia',
    category: 'International',
    duration: '5 Days / 4 Nights',
    paxLabel: '2–8 Pax',
    priceINR: 44000,
    imageUrl: '/src/assets/images/dest_kuala_lumpur.jpg',
    highlights: ['Petronas Twin Towers', 'Batu Caves tour', 'Genting SkyWorlds'],
    rating: 4.8,
    reviewsCount: 94,
    isPopular: true,
    isFeatured: true,
  },
  {
    _id: 'pkg-3',
    title: 'Goa Sun & Coastal Retreat',
    destination: 'South Goa, India',
    category: 'Domestic',
    duration: '4 Days / 3 Nights',
    paxLabel: '2–10 Pax',
    priceINR: 16500,
    imageUrl: '/src/assets/images/pkg_goa_coast.jpg',
    highlights: ['Beachfront resort stay', 'Sunset Mandovi cruise', 'Airport transfers'],
    rating: 4.7,
    reviewsCount: 142,
    isPopular: false,
    isFeatured: true,
  },
];

test('formatINR formats Indian rupee currency accurately', () => {
  assert.equal(formatINR(19999), '₹19,999');
  assert.equal(formatINR(44000), '₹44,000');
  assert.equal(formatINR(125000), '₹1,25,000');
  assert.equal(formatINR(-100), '₹0');
});

test('filterPackages filters by category, search query, and price range', () => {
  const domestic = filterPackages(SAMPLE_PACKAGES, { category: 'Domestic' });
  assert.equal(domestic.length, 2);

  const intl = filterPackages(SAMPLE_PACKAGES, { category: 'International' });
  assert.equal(intl.length, 1);
  assert.equal(intl[0]._id, 'pkg-2');

  const kashmir = filterPackages(SAMPLE_PACKAGES, { query: 'gulmarg' });
  assert.equal(kashmir.length, 1);
  assert.equal(kashmir[0]._id, 'pkg-1');

  const budget = filterPackages(SAMPLE_PACKAGES, { maxPrice: 20000 });
  assert.equal(budget.length, 2);

  const combined = filterPackages(SAMPLE_PACKAGES, {
    category: 'Domestic',
    query: 'goa',
    maxPrice: 17000,
  });
  assert.equal(combined.length, 1);
  assert.equal(combined[0]._id, 'pkg-3');
});

test('validateEmail and validatePhone reject invalid inputs and accept valid ones', () => {
  assert.equal(validateEmail('traveler@flytroxtravels.in'), true);
  assert.equal(validateEmail('bad-email'), false);
  assert.equal(validateEmail('missing@domain'), false);

  assert.equal(validatePhone('+91 98765 43210'), true);
  assert.equal(validatePhone('9876543210'), true);
  assert.equal(validatePhone('123'), false);
  assert.equal(validatePhone('abc-def-ghij'), false);
});

test('validateInquiryPayload returns field errors for invalid data and passes for valid data', () => {
  const invalid = validateInquiryPayload({
    fullName: 'A',
    phone: '123',
    email: 'invalid-mail',
    destination: '',
    travelDate: '',
    travelersCount: 0,
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.fullName);
  assert.ok(invalid.errors.phone);
  assert.ok(invalid.errors.email);
  assert.ok(invalid.errors.destination);
  assert.ok(invalid.errors.travelDate);
  assert.ok(invalid.errors.travelersCount);

  const valid = validateInquiryPayload({
    fullName: 'Aarav Nair',
    phone: '+91 98470 11223',
    email: 'aarav@example.com',
    destination: 'Kashmir',
    travelDate: '2026-12-20',
    travelersCount: 2,
  });
  assert.equal(valid.valid, true);
  assert.deepEqual(valid.errors, {});
});

test('validatePackagePayload enforces valid admin package inputs', () => {
  const invalid = validatePackagePayload({
    title: 'Go',
    destination: '',
    category: 'Domestic',
    duration: '',
    priceINR: 500,
    highlights: [],
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.title);
  assert.ok(invalid.errors.destination);
  assert.ok(invalid.errors.duration);
  assert.ok(invalid.errors.priceINR);
  assert.ok(invalid.errors.highlights);

  const valid = validatePackagePayload({
    title: 'Munnar Emerald Escape',
    destination: 'Munnar, Kerala',
    category: 'Domestic',
    duration: '4 Days / 3 Nights',
    priceINR: 28000,
    imageUrl: '/src/assets/images/pkg_munnar_kerala.jpg',
    highlights: ['Tea plantation walk', 'Eravikulam National Park'],
  });
  assert.equal(valid.valid, true);
});
