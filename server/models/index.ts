import mongoose, { Schema, type Document } from 'mongoose';

export interface IPackageDocument extends Document {
  title: string;
  destination: string;
  category: 'Domestic' | 'International';
  duration: string;
  paxLabel: string;
  priceINR: number;
  imageUrl: string;
  highlights: string[];
  rating: number;
  reviewsCount: number;
  isPopular: boolean;
  isFeatured: boolean;
}

export interface IDestinationDocument extends Document {
  name: string;
  country: string;
  tagline: string;
  imageUrl: string;
  startingPrice: number;
  badgeText: string;
  rating: number;
  isPopular: boolean;
}

export interface IInquiryDocument extends Document {
  fullName: string;
  email: string;
  phone: string;
  packageId?: string;
  packageTitle?: string;
  destination: string;
  travelDate: string;
  travelersCount: number;
  message: string;
  status: 'New' | 'Contacted' | 'Booked';
  createdAt: Date;
}

export interface ISubscriberDocument extends Document {
  email: string;
  subscribedAt: Date;
}

const packageSchema = new Schema<IPackageDocument>(
  {
    title: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    category: { type: String, enum: ['Domestic', 'International'], required: true },
    duration: { type: String, required: true, trim: true },
    paxLabel: { type: String, default: '2–6 Pax', trim: true },
    priceINR: { type: Number, required: true, min: 1000 },
    imageUrl: { type: String, required: true, trim: true },
    highlights: [{ type: String, trim: true }],
    rating: { type: Number, default: 4.8, min: 1, max: 5 },
    reviewsCount: { type: Number, default: 48, min: 0 },
    isPopular: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const destinationSchema = new Schema<IDestinationDocument>(
  {
    name: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    tagline: { type: String, required: true, trim: true },
    imageUrl: { type: String, required: true, trim: true },
    startingPrice: { type: Number, required: true, min: 1000 },
    badgeText: { type: String, required: true, trim: true },
    rating: { type: Number, default: 4.8, min: 1, max: 5 },
    isPopular: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const inquirySchema = new Schema<IInquiryDocument>({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, default: '', trim: true, lowercase: true },
  phone: { type: String, required: true, trim: true },
  packageId: { type: String, default: undefined },
  packageTitle: { type: String, default: undefined },
  destination: { type: String, required: true, trim: true },
  travelDate: { type: String, required: true, trim: true },
  travelersCount: { type: Number, required: true, min: 1, max: 50 },
  message: { type: String, default: '', trim: true },
  status: { type: String, enum: ['New', 'Contacted', 'Booked'], default: 'New' },
  createdAt: { type: Date, default: Date.now },
});

const subscriberSchema = new Schema<ISubscriberDocument>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  subscribedAt: { type: Date, default: Date.now },
});

export const PackageModel =
  mongoose.models.Package || mongoose.model<IPackageDocument>('Package', packageSchema);

export const DestinationModel =
  mongoose.models.Destination ||
  mongoose.model<IDestinationDocument>('Destination', destinationSchema);

export const InquiryModel =
  mongoose.models.Inquiry || mongoose.model<IInquiryDocument>('Inquiry', inquirySchema);

export const SubscriberModel =
  mongoose.models.Subscriber ||
  mongoose.model<ISubscriberDocument>('Subscriber', subscriberSchema);
