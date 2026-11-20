export type PackageCategory = 'Domestic' | 'International';

export type InquiryStatus = 'New' | 'Contacted' | 'Booked';

export interface TourPackage {
  _id: string;
  title: string;
  destination: string;
  category: PackageCategory;
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

export interface DestinationItem {
  _id: string;
  name: string;
  country: string;
  tagline: string;
  imageUrl: string;
  startingPrice: number;
  badgeText: string;
  rating: number;
  isPopular: boolean;
}

export interface InquiryItem {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  packageId?: string;
  packageTitle?: string;
  destination: string;
  travelDate: string;
  travelersCount: number;
  message: string;
  status: InquiryStatus;
  createdAt: string;
}

export interface InquiryFormPayload {
  fullName: string;
  email: string;
  phone: string;
  packageId?: string;
  packageTitle?: string;
  destination: string;
  travelDate: string;
  travelersCount: number;
  message?: string;
}

export interface PackageFormPayload {
  title: string;
  destination: string;
  category: PackageCategory;
  duration: string;
  paxLabel?: string;
  priceINR: number;
  imageUrl: string;
  highlights: string[];
  rating?: number;
  reviewsCount?: number;
  isPopular?: boolean;
  isFeatured?: boolean;
}

export interface AdminStats {
  totalPackages: number;
  totalDestinations: number;
  totalInquiries: number;
  newInquiries: number;
  bookedInquiries: number;
  totalSubscribers: number;
}
