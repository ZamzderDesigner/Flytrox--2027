import { useCallback, useEffect, useState, type FormEvent } from 'react';
import {
  ArrowLeft,
  Edit3,
  Inbox,
  Lock,
  LogOut,
  Package,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { FlytroxLogo } from '../components/FlytroxLogo';
import { SafeImage } from '../components/SafeImage';
import {
  adminLogin,
  ApiError,
  createAdminPackage,
  deleteAdminInquiry,
  deleteAdminPackage,
  fetchAdminInquiries,
  fetchAdminStats,
  fetchPackages,
  updateAdminInquiryStatus,
  updateAdminPackage,
} from '../services/api';
import type {
  AdminStats,
  InquiryItem,
  InquiryStatus,
  PackageCategory,
  PackageFormPayload,
  TourPackage,
} from '../types/travel';
import { formatINR, validatePackagePayload } from '../utils/travelLogic';

interface AdminDashboardProps {
  onBackToSite: () => void;
}

const IMAGE_PRESETS = [
  { label: 'Kashmir Dal Lake', url: '/src/assets/images/pkg_kashmir_dallake_1795102357870.jpg' },
  { label: 'Munnar Kerala Hills', url: '/src/assets/images/pkg_munnar_kerala_1795102309915.jpg' },
  { label: 'Goa Beach Coast', url: '/src/assets/images/pkg_goa_coast_1795102319806.jpg' },
  { label: 'Kuala Lumpur Skyline', url: '/src/assets/images/dest_kuala_lumpur_1795102410344.jpg' },
  { label: 'Dubai Marina', url: '/src/assets/images/dest_dubai_skyline_1795102608934.jpg' },
  { label: 'Maldives / Lakshadweep', url: '/src/assets/images/dest_maldives_lakshadweep_1795102316928.jpg' },
  { label: 'Bali Ubud Terraces', url: '/src/assets/images/dest_bali_ubud_1795102362802.jpg' },
];

const TOKEN_KEY = 'flytrox_admin_jwt';

const EMPTY_FORM: {
  title: string;
  destination: string;
  category: PackageCategory;
  duration: string;
  paxLabel: string;
  priceINR: string;
  imageUrl: string;
  highlightsText: string;
} = {
  title: '',
  destination: '',
  category: 'Domestic',
  duration: '5 Days / 4 Nights',
  paxLabel: '2–6 Travelers',
  priceINR: '24999',
  imageUrl: IMAGE_PRESETS[0].url,
  highlightsText: 'Handpicked 4-star stay with breakfast\nPrivate airport & sightseeing transfers\n24/7 WhatsApp trip coordinator',
};

export function AdminDashboard({ onBackToSite }: AdminDashboardProps) {
  const [token, setToken] = useState<string>(() => sessionStorage.getItem(TOKEN_KEY) || '');
  const [loginEmail, setLoginEmail] = useState('admin@flytroxtravels.in');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [activeTab, setActiveTab] = useState<'inquiries' | 'packages'>('inquiries');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [feedback, setFeedback] = useState('');

  // Package create/edit modal state
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formState, setFormState] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [savingPackage, setSavingPackage] = useState(false);

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken('');
  }, []);

  const loadDashboardData = useCallback(
    async (authToken: string) => {
      setLoadingData(true);
      try {
        const [statsRes, inqRes, pkgRes] = await Promise.all([
          fetchAdminStats(authToken),
          fetchAdminInquiries(authToken),
          fetchPackages(),
        ]);
        setStats(statsRes);
        setInquiries(inqRes);
        setPackages(pkgRes);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          handleLogout();
        }
      } finally {
        setLoadingData(false);
      }
    },
    [handleLogout]
  );

  useEffect(() => {
    if (token) {
      loadDashboardData(token);
    }
  }, [token, loadDashboardData]);

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);
    try {
      const res = await adminLogin(loginEmail, loginPassword);
      sessionStorage.setItem(TOKEN_KEY, res.token);
      setToken(res.token);
      setLoginPassword('');
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Sign-in failed.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleStatusChange = async (id: string, status: InquiryStatus) => {
    if (!token) return;
    try {
      const updated = await updateAdminInquiryStatus(token, id, status);
      setInquiries((prev) => prev.map((item) => (item._id === id ? updated : item)));
      const updatedStats = await fetchAdminStats(token);
      setStats(updatedStats);
      setFeedback(`Inquiry status updated to ${status}.`);
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Failed to update status.');
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    if (!token) return;
    try {
      await deleteAdminInquiry(token, id);
      setInquiries((prev) => prev.filter((item) => item._id !== id));
      const updatedStats = await fetchAdminStats(token);
      setStats(updatedStats);
      setFeedback('Inquiry removed.');
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Failed to remove inquiry.');
    }
  };

  const openCreatePackage = () => {
    setEditingId(null);
    setFormState(EMPTY_FORM);
    setFormErrors({});
    setEditorOpen(true);
  };

  const openEditPackage = (pkg: TourPackage) => {
    setEditingId(pkg._id);
    setFormState({
      title: pkg.title,
      destination: pkg.destination,
      category: pkg.category,
      duration: pkg.duration,
      paxLabel: pkg.paxLabel,
      priceINR: String(pkg.priceINR),
      imageUrl: pkg.imageUrl,
      highlightsText: pkg.highlights.join('\n'),
    });
    setFormErrors({});
    setEditorOpen(true);
  };

  const handleSavePackage = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const payload: PackageFormPayload = {
      title: formState.title.trim(),
      destination: formState.destination.trim(),
      category: formState.category,
      duration: formState.duration.trim(),
      paxLabel: formState.paxLabel.trim() || '2–6 Travelers',
      priceINR: Number(formState.priceINR),
      imageUrl: formState.imageUrl,
      highlights: formState.highlightsText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
    };

    const check = validatePackagePayload(payload);
    if (!check.valid) {
      setFormErrors(check.errors);
      return;
    }

    setSavingPackage(true);
    try {
      if (editingId) {
        const updated = await updateAdminPackage(token, editingId, payload);
        setPackages((prev) => prev.map((p) => (p._id === editingId ? updated : p)));
        setFeedback(`Updated package "${updated.title}".`);
      } else {
        const created = await createAdminPackage(token, payload);
        setPackages((prev) => [created, ...prev]);
        setFeedback(`Published new package "${created.title}".`);
      }
      const updatedStats = await fetchAdminStats(token);
      setStats(updatedStats);
      setEditorOpen(false);
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors) {
        setFormErrors(err.fieldErrors);
      } else {
        setFeedback(err instanceof Error ? err.message : 'Unable to save package.');
      }
    } finally {
      setSavingPackage(false);
    }
  };

  const handleDeletePackage = async (pkg: TourPackage) => {
    if (!token) return;
    try {
      await deleteAdminPackage(token, pkg._id);
      setPackages((prev) => prev.filter((p) => p._id !== pkg._id));
      const updatedStats = await fetchAdminStats(token);
      setStats(updatedStats);
      setFeedback(`Deleted package "${pkg.title}".`);
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Unable to delete package.');
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F4F7F5] px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between">
            <FlytroxLogo variant="dark" />
            <button
              type="button"
              onClick={onBackToSite}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#0E5A28] hover:underline cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Storefront
            </button>
          </div>

          <div className="mt-6">
            <h1 className="text-2xl font-extrabold text-[#111827]">Staff Portal Sign In</h1>
            <p className="mt-1.5 text-sm text-[#4B5563]">
              Manage tour packages, INR pricing, and incoming traveler inquiries.
            </p>
          </div>

          {loginError && (
            <div
              role="alert"
              className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700"
            >
              {loginError}
            </div>
          )}

          <form onSubmit={handleSignIn} className="mt-6 space-y-4">
            <div>
              <label htmlFor="admin-email" className="block text-xs font-semibold text-slate-700">
                Staff Email
              </label>
              <input
                id="admin-email"
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-[#F4F7F5] px-3.5 py-2.5 text-sm text-[#111827] focus:border-[#0E5A28] focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="admin-password" className="block text-xs font-semibold text-slate-700">
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter staff password"
                required
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-[#F4F7F5] px-3.5 py-2.5 text-sm text-[#111827] focus:border-[#0E5A28] focus:bg-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loggingIn}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#0E5A28] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#136F33] disabled:opacity-60 cursor-pointer"
            >
              <Lock className="h-4 w-4" aria-hidden="true" />
              <span>{loggingIn ? 'Signing In...' : 'Sign In to Dashboard'}</span>
            </button>
          </form>

          <div className="mt-6 rounded-xl bg-[#E6F2EA] p-3.5 text-xs text-[#0E5A28]">
            <p className="font-bold">Demo Staff Credentials</p>
            <p className="mt-1 font-mono">
              admin@flytroxtravels.in · Flytrox@2026
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7F5] text-[#111827]">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <FlytroxLogo variant="dark" />
            <span className="hidden border-l border-slate-200 pl-4 text-xs font-semibold text-slate-500 sm:inline">
              Staff Dashboard
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToSite}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Storefront
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#0E5A28] px-4 py-2 text-xs font-semibold text-white hover:bg-[#136F33] transition-colors cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {feedback && (
          <div
            role="status"
            className="mb-6 flex items-center justify-between rounded-xl border border-[#0E5A28]/20 bg-[#E6F2EA] px-4 py-3 text-sm font-medium text-[#0E5A28]"
          >
            <span>{feedback}</span>
            <button
              type="button"
              onClick={() => setFeedback('')}
              aria-label="Dismiss notification"
              className="p-1 hover:opacity-70 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Overview KPI Row */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold text-[#4B5563]">Active Packages</p>
            <p className="mt-2 text-3xl font-extrabold text-[#111827] tabular-nums">
              {stats?.totalPackages ?? packages.length}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold text-[#4B5563]">Total Inquiries</p>
            <p className="mt-2 text-3xl font-extrabold text-[#111827] tabular-nums">
              {stats?.totalInquiries ?? inquiries.length}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold text-[#4B5563]">New Unread Leads</p>
            <p className="mt-2 text-3xl font-extrabold text-[#0E5A28] tabular-nums">
              {stats?.newInquiries ?? 0}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold text-[#4B5563]">Newsletter Subscribers</p>
            <p className="mt-2 text-3xl font-extrabold text-[#111827] tabular-nums">
              {stats?.totalSubscribers ?? 0}
            </p>
          </div>
        </div>

        {/* Section Tabs + Action */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <div
            role="tablist"
            aria-label="Admin sections"
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'inquiries'}
              onClick={() => setActiveTab('inquiries')}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'inquiries'
                  ? 'bg-[#0E5A28] text-white'
                  : 'text-slate-600 hover:text-[#0E5A28]'
              }`}
            >
              <Inbox className="h-4 w-4" aria-hidden="true" />
              Customer Inquiries ({inquiries.length})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'packages'}
              onClick={() => setActiveTab('packages')}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'packages'
                  ? 'bg-[#0E5A28] text-white'
                  : 'text-slate-600 hover:text-[#0E5A28]'
              }`}
            >
              <Package className="h-4 w-4" aria-hidden="true" />
              Tour Packages ({packages.length})
            </button>
          </div>

          {activeTab === 'packages' && (
            <button
              type="button"
              onClick={openCreatePackage}
              className="inline-flex items-center gap-2 rounded-full bg-[#0E5A28] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#136F33] transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Add New Package
            </button>
          )}
        </div>

        {/* Tab Panels */}
        {loadingData ? (
          <div className="mt-6 h-64 animate-pulse rounded-2xl bg-white border border-slate-200" />
        ) : activeTab === 'inquiries' ? (
          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {inquiries.length === 0 ? (
              <div className="p-12 text-center text-sm text-[#4B5563]">
                No traveler inquiries received yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-200 bg-[#F4F7F5] text-xs font-bold uppercase text-slate-600">
                    <tr>
                      <th className="px-5 py-3.5">Traveler</th>
                      <th className="px-5 py-3.5">Destination / Package</th>
                      <th className="px-5 py-3.5">Date &amp; Pax</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {inquiries.map((inq) => (
                      <tr key={inq._id} className="hover:bg-slate-50/70">
                        <td className="px-5 py-4 align-top">
                          <p className="font-bold text-[#111827]">{inq.fullName}</p>
                          <p className="text-xs text-[#4B5563] tabular-nums">{inq.phone}</p>
                          {inq.email && <p className="text-xs text-slate-500">{inq.email}</p>}
                        </td>
                        <td className="px-5 py-4 align-top">
                          <p className="font-semibold text-[#0E5A28]">{inq.destination}</p>
                          {inq.packageTitle && (
                            <p className="text-xs font-medium text-slate-700">{inq.packageTitle}</p>
                          )}
                          {inq.message && (
                            <p className="mt-1 max-w-xs text-xs text-[#4B5563]">{inq.message}</p>
                          )}
                        </td>
                        <td className="px-5 py-4 align-top tabular-nums">
                          <p className="font-medium text-[#111827]">{inq.travelDate}</p>
                          <p className="text-xs text-[#4B5563]">{inq.travelersCount} travelers</p>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <label htmlFor={`status-${inq._id}`} className="sr-only">
                            Status for {inq.fullName}
                          </label>
                          <select
                            id={`status-${inq._id}`}
                            value={inq.status}
                            onChange={(e) =>
                              handleStatusChange(inq._id, e.target.value as InquiryStatus)
                            }
                            className="rounded-lg border border-slate-200 bg-[#F4F7F5] px-3 py-1.5 text-xs font-semibold text-[#111827] focus:border-[#0E5A28] focus:outline-none"
                          >
                            <option value="New">New</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Booked">Booked</option>
                          </select>
                        </td>
                        <td className="px-5 py-4 text-right align-top">
                          <button
                            type="button"
                            onClick={() => handleDeleteInquiry(inq._id)}
                            aria-label={`Delete inquiry from ${inq.fullName}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
            {packages.map((pkg) => (
              <article
                key={pkg._id}
                className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white sm:flex-row"
              >
                <div className="aspect-[4/3] w-full shrink-0 sm:w-40 sm:aspect-auto">
                  <SafeImage
                    src={pkg.imageUrl}
                    alt={pkg.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between p-5">
                  <div>
                    <div className="flex items-center justify-between gap-2 text-xs font-semibold text-[#0E5A28]">
                      <span>
                        {pkg.category} · {pkg.duration}
                      </span>
                      <span className="text-base font-extrabold tabular-nums">
                        {formatINR(pkg.priceINR)}
                      </span>
                    </div>
                    <h3 className="mt-1.5 text-base font-bold text-[#111827]">{pkg.title}</h3>
                    <p className="mt-0.5 text-xs text-[#4B5563]">{pkg.destination}</p>
                  </div>

                  <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                    <button
                      type="button"
                      onClick={() => openEditPackage(pkg)}
                      aria-label={`Edit ${pkg.title}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-[#0E5A28] hover:text-[#0E5A28] cursor-pointer"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePackage(pkg)}
                      aria-label={`Delete ${pkg.title}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-red-200 px-3.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Create / Edit Package Modal */}
      {editorOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pkg-editor-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        >
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between bg-[#0E5A28] px-6 py-4 text-white">
              <h2 id="pkg-editor-title" className="text-lg font-extrabold">
                {editingId ? 'Edit Tour Package' : 'Add New Tour Package'}
              </h2>
              <button
                type="button"
                onClick={() => setEditorOpen(false)}
                aria-label="Close package editor"
                className="rounded-full p-1.5 hover:bg-white/15 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSavePackage} className="space-y-4 p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="pkg-title" className="block text-xs font-semibold text-slate-700">
                    Package Title *
                  </label>
                  <input
                    id="pkg-title"
                    type="text"
                    value={formState.title}
                    onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                    placeholder="e.g. Sikkim & Darjeeling Mist"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-[#F4F7F5] px-3 py-2 text-sm focus:border-[#0E5A28] focus:bg-white focus:outline-none"
                  />
                  {formErrors.title && (
                    <p className="mt-1 text-xs text-red-600">{formErrors.title}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="pkg-dest" className="block text-xs font-semibold text-slate-700">
                    Destination *
                  </label>
                  <input
                    id="pkg-dest"
                    type="text"
                    value={formState.destination}
                    onChange={(e) => setFormState({ ...formState, destination: e.target.value })}
                    placeholder="e.g. Gangtok & Darjeeling, India"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-[#F4F7F5] px-3 py-2 text-sm focus:border-[#0E5A28] focus:bg-white focus:outline-none"
                  />
                  {formErrors.destination && (
                    <p className="mt-1 text-xs text-red-600">{formErrors.destination}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="pkg-cat" className="block text-xs font-semibold text-slate-700">
                    Category *
                  </label>
                  <select
                    id="pkg-cat"
                    value={formState.category}
                    onChange={(e) =>
                      setFormState({ ...formState, category: e.target.value as PackageCategory })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-[#F4F7F5] px-3 py-2 text-sm focus:border-[#0E5A28] focus:bg-white focus:outline-none"
                  >
                    <option value="Domestic">Domestic</option>
                    <option value="International">International</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="pkg-duration" className="block text-xs font-semibold text-slate-700">
                    Duration *
                  </label>
                  <input
                    id="pkg-duration"
                    type="text"
                    value={formState.duration}
                    onChange={(e) => setFormState({ ...formState, duration: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-[#F4F7F5] px-3 py-2 text-sm focus:border-[#0E5A28] focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="pkg-price" className="block text-xs font-semibold text-slate-700">
                    Price (INR) *
                  </label>
                  <input
                    id="pkg-price"
                    type="number"
                    min={1000}
                    value={formState.priceINR}
                    onChange={(e) => setFormState({ ...formState, priceINR: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-[#F4F7F5] px-3 py-2 text-sm tabular-nums focus:border-[#0E5A28] focus:bg-white focus:outline-none"
                  />
                  {formErrors.priceINR && (
                    <p className="mt-1 text-xs text-red-600">{formErrors.priceINR}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="pkg-image" className="block text-xs font-semibold text-slate-700">
                  Cover Photography
                </label>
                <select
                  id="pkg-image"
                  value={formState.imageUrl}
                  onChange={(e) => setFormState({ ...formState, imageUrl: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-[#F4F7F5] px-3 py-2 text-sm focus:border-[#0E5A28] focus:bg-white focus:outline-none"
                >
                  {IMAGE_PRESETS.map((preset) => (
                    <option key={preset.url} value={preset.url}>
                      {preset.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="pkg-highlights" className="block text-xs font-semibold text-slate-700">
                  Itinerary Highlights (one per line) *
                </label>
                <textarea
                  id="pkg-highlights"
                  rows={4}
                  value={formState.highlightsText}
                  onChange={(e) => setFormState({ ...formState, highlightsText: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-[#F4F7F5] px-3 py-2 text-sm focus:border-[#0E5A28] focus:bg-white focus:outline-none"
                />
                {formErrors.highlights && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.highlights}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditorOpen(false)}
                  className="rounded-full border border-slate-200 px-5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPackage}
                  className="rounded-full bg-[#0E5A28] px-6 py-2 text-xs font-bold text-white hover:bg-[#136F33] disabled:opacity-60 cursor-pointer"
                >
                  {savingPackage ? 'Saving...' : editingId ? 'Save Changes' : 'Publish Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
