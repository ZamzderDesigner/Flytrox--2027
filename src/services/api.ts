import type {
  AdminStats,
  DestinationItem,
  InquiryFormPayload,
  InquiryItem,
  InquiryStatus,
  PackageFormPayload,
  TourPackage,
} from '../types/travel';

const API_BASE = '/api/v1';

export class ApiError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;

  constructor(message: string, status: number, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(
      body.error || 'Request failed. Please try again.',
      res.status,
      body.fieldErrors
    );
  }
  return body as T;
}

export async function fetchDestinations(search?: string): Promise<DestinationItem[]> {
  const qs = search ? `?search=${encodeURIComponent(search)}` : '';
  const res = await request<{ data: DestinationItem[] }>(`/destinations${qs}`);
  return res.data;
}

export async function fetchPackages(params?: {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
}): Promise<TourPackage[]> {
  const sp = new URLSearchParams();
  if (params?.category && params.category !== 'All') sp.set('category', params.category);
  if (params?.search) sp.set('search', params.search);
  if (typeof params?.minPrice === 'number') sp.set('minPrice', String(params.minPrice));
  if (typeof params?.maxPrice === 'number') sp.set('maxPrice', String(params.maxPrice));
  const qs = sp.toString() ? `?${sp.toString()}` : '';
  const res = await request<{ data: TourPackage[] }>(`/packages${qs}`);
  return res.data;
}

export async function submitInquiry(
  payload: InquiryFormPayload
): Promise<{ data: InquiryItem; message: string }> {
  return request<{ data: InquiryItem; message: string }>('/inquiries', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function subscribeToNewsletter(
  email: string
): Promise<{ alreadySubscribed: boolean; message: string }> {
  return request<{ alreadySubscribed: boolean; message: string }>('/newsletter', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

// Admin Endpoints
export async function adminLogin(
  email: string,
  password: string
): Promise<{ token: string; admin: { email: string } }> {
  return request<{ token: string; admin: { email: string } }>('/admin/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function fetchAdminStats(token: string): Promise<AdminStats> {
  const res = await request<{ data: AdminStats }>('/admin/stats', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function fetchAdminInquiries(token: string): Promise<InquiryItem[]> {
  const res = await request<{ data: InquiryItem[] }>('/admin/inquiries', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function updateAdminInquiryStatus(
  token: string,
  id: string,
  status: InquiryStatus
): Promise<InquiryItem> {
  const res = await request<{ data: InquiryItem }>(`/admin/inquiries/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status }),
  });
  return res.data;
}

export async function deleteAdminInquiry(token: string, id: string): Promise<void> {
  await request(`/admin/inquiries/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function createAdminPackage(
  token: string,
  payload: PackageFormPayload
): Promise<TourPackage> {
  const res = await request<{ data: TourPackage }>('/admin/packages', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function updateAdminPackage(
  token: string,
  id: string,
  payload: PackageFormPayload
): Promise<TourPackage> {
  const res = await request<{ data: TourPackage }>(`/admin/packages/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function deleteAdminPackage(token: string, id: string): Promise<void> {
  await request(`/admin/packages/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}
