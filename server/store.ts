import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import mongoose from 'mongoose';
import {
  DestinationModel,
  InquiryModel,
  PackageModel,
  SubscriberModel,
} from './models/index';
import { SEED_DESTINATIONS, SEED_INQUIRIES, SEED_PACKAGES } from './seedData';
import type {
  AdminStats,
  DestinationItem,
  InquiryFormPayload,
  InquiryItem,
  InquiryStatus,
  PackageFormPayload,
  TourPackage,
} from '../src/types/travel';

interface LocalDbSchema {
  destinations: DestinationItem[];
  packages: TourPackage[];
  inquiries: InquiryItem[];
  subscribers: { email: string; subscribedAt: string }[];
}

const DATA_DIR = path.resolve(process.cwd(), '.flytrox-data');
const DATA_FILE = path.join(DATA_DIR, 'db.json');

let useMongo = false;

function ensureLocalStore(): LocalDbSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DATA_FILE)) {
    const initial: LocalDbSchema = {
      destinations: [...SEED_DESTINATIONS],
      packages: [...SEED_PACKAGES],
      inquiries: [...SEED_INQUIRIES],
      subscribers: [{ email: 'concierge@flytroxtravels.in', subscribedAt: new Date().toISOString() }],
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }

  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<LocalDbSchema>;
    return {
      destinations: Array.isArray(parsed.destinations) && parsed.destinations.length > 0
        ? parsed.destinations
        : [...SEED_DESTINATIONS],
      packages: Array.isArray(parsed.packages) && parsed.packages.length > 0
        ? parsed.packages
        : [...SEED_PACKAGES],
      inquiries: Array.isArray(parsed.inquiries) ? parsed.inquiries : [...SEED_INQUIRIES],
      subscribers: Array.isArray(parsed.subscribers) ? parsed.subscribers : [],
    };
  } catch {
    const fallback: LocalDbSchema = {
      destinations: [...SEED_DESTINATIONS],
      packages: [...SEED_PACKAGES],
      inquiries: [...SEED_INQUIRIES],
      subscribers: [],
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(fallback, null, 2), 'utf-8');
    return fallback;
  }
}

function saveLocalStore(data: LocalDbSchema): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export async function initDatabase(): Promise<'mongodb' | 'local'> {
  const uri = process.env.MONGODB_URI?.trim();
  if (uri) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 4000 });
      useMongo = true;
      await seedIfEmptyMongo();
      return 'mongodb';
    } catch (err) {
      console.warn('[Flytrox DB] MongoDB connection unavailable, falling back to local JSON store:', (err as Error).message);
      useMongo = false;
    }
  }
  ensureLocalStore();
  return 'local';
}

async function seedIfEmptyMongo(): Promise<void> {
  const destCount = await DestinationModel.countDocuments();
  if (destCount === 0) {
    await DestinationModel.insertMany(
      SEED_DESTINATIONS.map(({ _id: _omit, ...rest }) => rest)
    );
  }
  const pkgCount = await PackageModel.countDocuments();
  if (pkgCount === 0) {
    await PackageModel.insertMany(
      SEED_PACKAGES.map(({ _id: _omit, ...rest }) => rest)
    );
  }
}

export async function resetAndSeedStore(): Promise<void> {
  if (useMongo) {
    await DestinationModel.deleteMany({});
    await PackageModel.deleteMany({});
    await DestinationModel.insertMany(
      SEED_DESTINATIONS.map(({ _id: _omit, ...rest }) => rest)
    );
    await PackageModel.insertMany(
      SEED_PACKAGES.map(({ _id: _omit, ...rest }) => rest)
    );
    return;
  }

  const seeded: LocalDbSchema = {
    destinations: [...SEED_DESTINATIONS],
    packages: [...SEED_PACKAGES],
    inquiries: [...SEED_INQUIRIES],
    subscribers: [{ email: 'concierge@flytroxtravels.in', subscribedAt: new Date().toISOString() }],
  };
  saveLocalStore(seeded);
}

export async function getDestinations(search?: string): Promise<DestinationItem[]> {
  let items: DestinationItem[];

  if (useMongo) {
    const docs = await DestinationModel.find().lean();
    items = docs.map((d: Record<string, unknown>) => ({
      _id: String(d._id),
      name: String(d.name),
      country: String(d.country),
      tagline: String(d.tagline),
      imageUrl: String(d.imageUrl),
      startingPrice: Number(d.startingPrice),
      badgeText: String(d.badgeText),
      rating: Number(d.rating ?? 4.8),
      isPopular: Boolean(d.isPopular),
    }));
  } else {
    items = ensureLocalStore().destinations;
  }

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    return items.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.country.toLowerCase().includes(q) ||
        d.tagline.toLowerCase().includes(q)
    );
  }

  return items;
}

export async function getPackages(filters?: {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
}): Promise<TourPackage[]> {
  let items: TourPackage[];

  if (useMongo) {
    const docs = await PackageModel.find().lean();
    items = docs.map((p: Record<string, unknown>) => ({
      _id: String(p._id),
      title: String(p.title),
      destination: String(p.destination),
      category: p.category as 'Domestic' | 'International',
      duration: String(p.duration),
      paxLabel: String(p.paxLabel ?? '2–6 Travelers'),
      priceINR: Number(p.priceINR),
      imageUrl: String(p.imageUrl),
      highlights: Array.isArray(p.highlights) ? p.highlights.map(String) : [],
      rating: Number(p.rating ?? 4.8),
      reviewsCount: Number(p.reviewsCount ?? 48),
      isPopular: Boolean(p.isPopular),
      isFeatured: Boolean(p.isFeatured),
    }));
  } else {
    items = ensureLocalStore().packages;
  }

  return items.filter((pkg) => {
    if (filters?.category && filters.category !== 'All' && pkg.category !== filters.category) {
      return false;
    }
    if (typeof filters?.minPrice === 'number' && !Number.isNaN(filters.minPrice) && pkg.priceINR < filters.minPrice) {
      return false;
    }
    if (typeof filters?.maxPrice === 'number' && !Number.isNaN(filters.maxPrice) && pkg.priceINR > filters.maxPrice) {
      return false;
    }
    if (filters?.search && filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      const hay = `${pkg.title} ${pkg.destination} ${pkg.category} ${pkg.duration} ${pkg.highlights.join(' ')}`.toLowerCase();
      return hay.includes(q);
    }
    return true;
  });
}

export async function createPackage(payload: PackageFormPayload): Promise<TourPackage> {
  if (useMongo) {
    const doc = await PackageModel.create({
      ...payload,
      paxLabel: payload.paxLabel?.trim() || '2–6 Travelers',
      rating: payload.rating ?? 4.8,
      reviewsCount: payload.reviewsCount ?? 24,
      isPopular: payload.isPopular ?? false,
      isFeatured: payload.isFeatured ?? true,
    });
    const obj = doc.toObject();
    return {
      _id: String(obj._id),
      title: obj.title,
      destination: obj.destination,
      category: obj.category,
      duration: obj.duration,
      paxLabel: obj.paxLabel,
      priceINR: obj.priceINR,
      imageUrl: obj.imageUrl,
      highlights: obj.highlights,
      rating: obj.rating,
      reviewsCount: obj.reviewsCount,
      isPopular: obj.isPopular,
      isFeatured: obj.isFeatured,
    };
  }

  const db = ensureLocalStore();
  const created: TourPackage = {
    _id: `pkg-${crypto.randomBytes(4).toString('hex')}`,
    title: payload.title.trim(),
    destination: payload.destination.trim(),
    category: payload.category,
    duration: payload.duration.trim(),
    paxLabel: payload.paxLabel?.trim() || '2–6 Travelers',
    priceINR: Math.round(Number(payload.priceINR)),
    imageUrl: payload.imageUrl.trim() || SEED_PACKAGES[0].imageUrl,
    highlights: payload.highlights.map((h) => h.trim()).filter(Boolean),
    rating: Number(payload.rating ?? 4.8),
    reviewsCount: Number(payload.reviewsCount ?? 24),
    isPopular: Boolean(payload.isPopular ?? false),
    isFeatured: Boolean(payload.isFeatured ?? true),
  };
  db.packages.unshift(created);
  saveLocalStore(db);
  return created;
}

export async function updatePackage(
  id: string,
  payload: Partial<PackageFormPayload>
): Promise<TourPackage | null> {
  if (useMongo) {
    const updated = await PackageModel.findByIdAndUpdate(id, payload, { new: true }).lean();
    if (!updated) return null;
    const u = updated as Record<string, unknown>;
    return {
      _id: String(u._id),
      title: String(u.title),
      destination: String(u.destination),
      category: u.category as 'Domestic' | 'International',
      duration: String(u.duration),
      paxLabel: String(u.paxLabel ?? '2–6 Travelers'),
      priceINR: Number(u.priceINR),
      imageUrl: String(u.imageUrl),
      highlights: Array.isArray(u.highlights) ? u.highlights.map(String) : [],
      rating: Number(u.rating ?? 4.8),
      reviewsCount: Number(u.reviewsCount ?? 48),
      isPopular: Boolean(u.isPopular),
      isFeatured: Boolean(u.isFeatured),
    };
  }

  const db = ensureLocalStore();
  const idx = db.packages.findIndex((p) => p._id === id);
  if (idx === -1) return null;

  const existing = db.packages[idx];
  const merged: TourPackage = {
    ...existing,
    ...payload,
    priceINR: payload.priceINR !== undefined ? Math.round(Number(payload.priceINR)) : existing.priceINR,
    highlights: payload.highlights
      ? payload.highlights.map((h) => h.trim()).filter(Boolean)
      : existing.highlights,
  };
  db.packages[idx] = merged;
  saveLocalStore(db);
  return merged;
}

export async function deletePackage(id: string): Promise<boolean> {
  if (useMongo) {
    const res = await PackageModel.findByIdAndDelete(id);
    return Boolean(res);
  }

  const db = ensureLocalStore();
  const before = db.packages.length;
  db.packages = db.packages.filter((p) => p._id !== id);
  if (db.packages.length === before) return false;
  saveLocalStore(db);
  return true;
}

export async function createInquiry(payload: InquiryFormPayload): Promise<InquiryItem> {
  if (useMongo) {
    const doc = await InquiryModel.create({
      fullName: payload.fullName.trim(),
      email: (payload.email ?? '').trim().toLowerCase(),
      phone: payload.phone.trim(),
      packageId: payload.packageId,
      packageTitle: payload.packageTitle,
      destination: payload.destination.trim(),
      travelDate: payload.travelDate.trim(),
      travelersCount: Number(payload.travelersCount),
      message: (payload.message ?? '').trim(),
      status: 'New',
    });
    const obj = doc.toObject();
    return {
      _id: String(obj._id),
      fullName: obj.fullName,
      email: obj.email,
      phone: obj.phone,
      packageId: obj.packageId,
      packageTitle: obj.packageTitle,
      destination: obj.destination,
      travelDate: obj.travelDate,
      travelersCount: obj.travelersCount,
      message: obj.message,
      status: obj.status,
      createdAt: new Date(obj.createdAt).toISOString(),
    };
  }

  const db = ensureLocalStore();
  const created: InquiryItem = {
    _id: `inq-${crypto.randomBytes(4).toString('hex')}`,
    fullName: payload.fullName.trim(),
    email: (payload.email ?? '').trim().toLowerCase(),
    phone: payload.phone.trim(),
    packageId: payload.packageId,
    packageTitle: payload.packageTitle,
    destination: payload.destination.trim(),
    travelDate: payload.travelDate.trim(),
    travelersCount: Number(payload.travelersCount),
    message: (payload.message ?? '').trim(),
    status: 'New',
    createdAt: new Date().toISOString(),
  };
  db.inquiries.unshift(created);
  saveLocalStore(db);
  return created;
}

export async function getInquiries(): Promise<InquiryItem[]> {
  if (useMongo) {
    const docs = await InquiryModel.find().sort({ createdAt: -1 }).lean();
    return docs.map((i: Record<string, unknown>) => ({
      _id: String(i._id),
      fullName: String(i.fullName),
      email: String(i.email ?? ''),
      phone: String(i.phone),
      packageId: i.packageId ? String(i.packageId) : undefined,
      packageTitle: i.packageTitle ? String(i.packageTitle) : undefined,
      destination: String(i.destination),
      travelDate: String(i.travelDate),
      travelersCount: Number(i.travelersCount),
      message: String(i.message ?? ''),
      status: (i.status as InquiryStatus) ?? 'New',
      createdAt: new Date(String(i.createdAt)).toISOString(),
    }));
  }

  const db = ensureLocalStore();
  return [...db.inquiries].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function updateInquiryStatus(
  id: string,
  status: InquiryStatus
): Promise<InquiryItem | null> {
  if (useMongo) {
    const updated = await InquiryModel.findByIdAndUpdate(id, { status }, { new: true }).lean();
    if (!updated) return null;
    const i = updated as Record<string, unknown>;
    return {
      _id: String(i._id),
      fullName: String(i.fullName),
      email: String(i.email ?? ''),
      phone: String(i.phone),
      packageId: i.packageId ? String(i.packageId) : undefined,
      packageTitle: i.packageTitle ? String(i.packageTitle) : undefined,
      destination: String(i.destination),
      travelDate: String(i.travelDate),
      travelersCount: Number(i.travelersCount),
      message: String(i.message ?? ''),
      status: i.status as InquiryStatus,
      createdAt: new Date(String(i.createdAt)).toISOString(),
    };
  }

  const db = ensureLocalStore();
  const idx = db.inquiries.findIndex((inq) => inq._id === id);
  if (idx === -1) return null;
  db.inquiries[idx] = { ...db.inquiries[idx], status };
  saveLocalStore(db);
  return db.inquiries[idx];
}

export async function deleteInquiry(id: string): Promise<boolean> {
  if (useMongo) {
    const res = await InquiryModel.findByIdAndDelete(id);
    return Boolean(res);
  }

  const db = ensureLocalStore();
  const before = db.inquiries.length;
  db.inquiries = db.inquiries.filter((inq) => inq._id !== id);
  if (db.inquiries.length === before) return false;
  saveLocalStore(db);
  return true;
}

export async function subscribeNewsletter(
  email: string
): Promise<{ alreadySubscribed: boolean; email: string }> {
  const normalized = email.trim().toLowerCase();

  if (useMongo) {
    const existing = await SubscriberModel.findOne({ email: normalized });
    if (existing) {
      return { alreadySubscribed: true, email: normalized };
    }
    await SubscriberModel.create({ email: normalized });
    return { alreadySubscribed: false, email: normalized };
  }

  const db = ensureLocalStore();
  const exists = db.subscribers.some((s) => s.email === normalized);
  if (exists) {
    return { alreadySubscribed: true, email: normalized };
  }
  db.subscribers.push({ email: normalized, subscribedAt: new Date().toISOString() });
  saveLocalStore(db);
  return { alreadySubscribed: false, email: normalized };
}

export async function getAdminStats(): Promise<AdminStats> {
  const [packages, destinations, inquiries] = await Promise.all([
    getPackages(),
    getDestinations(),
    getInquiries(),
  ]);

  let totalSubscribers = 0;
  if (useMongo) {
    totalSubscribers = await SubscriberModel.countDocuments();
  } else {
    totalSubscribers = ensureLocalStore().subscribers.length;
  }

  return {
    totalPackages: packages.length,
    totalDestinations: destinations.length,
    totalInquiries: inquiries.length,
    newInquiries: inquiries.filter((i) => i.status === 'New').length,
    bookedInquiries: inquiries.filter((i) => i.status === 'Booked').length,
    totalSubscribers,
  };
}
