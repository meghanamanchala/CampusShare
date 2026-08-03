'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  ShieldCheck,
  Search,
  Users,
  Building2,
  Sparkles,
  UserCheck,
  UserX,
  RefreshCw,
} from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { SiteHeader } from '@/components/site-header';

type PendingUser = {
  id: string;
  user_id: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  full_name?: string;
};

type Campus = {
  id: string;
  name: string;
  domain: string;
};

export default function AdminVerificationsPage() {
  const router = useRouter();

  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [approvedUsers, setApprovedUsers] = useState<PendingUser[]>([]);
  const [rejectedUsers, setRejectedUsers] = useState<PendingUser[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [selectedTab, setSelectedTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [selectedCampus, setSelectedCampus] = useState<Record<string, string>>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    checkAdminAndFetchData();
  }, []);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  async function checkAdminAndFetchData() {
    setLoading(true);
    const supabase = createSupabaseBrowserClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push('/auth/login');
      return;
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profileData?.is_admin) {
      setLoading(false);
      setIsAdmin(false);
      return;
    }

    setIsAdmin(true);

    const { data: campusesData } = await supabase.from('campuses').select('*');
    if (campusesData) {
      setCampuses(campusesData);
    }

    const { data: verificationsData } = await supabase
      .from('user_verifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (verificationsData) {
      const userIds = verificationsData.map((v) => v.user_id);

      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', userIds);

        const profilesMap = (profilesData || []).reduce(
          (acc, p) => {
            acc[p.id] = p.full_name;
            return acc;
          },
          {} as Record<string, string>
        );

        const enrichedData = verificationsData.map((v) => ({
          ...v,
          full_name: profilesMap[v.user_id] || 'Campus Student',
        }));

        setPendingUsers(enrichedData.filter((u) => u.status === 'pending'));
        setApprovedUsers(enrichedData.filter((u) => u.status === 'approved'));
        setRejectedUsers(enrichedData.filter((u) => u.status === 'rejected'));
      } else {
        setPendingUsers([]);
        setApprovedUsers([]);
        setRejectedUsers([]);
      }
    }

    setLoading(false);
  }

  async function handleApprove(userId: string, email: string) {
    const campusId = selectedCampus[userId];

    if (!campusId) {
      alert('Please select a campus to assign to this student');
      return;
    }

    setActionLoading(userId);

    try {
      const supabase = createSupabaseBrowserClient();
      const campus = campuses.find((c) => c.id === campusId);

      const { error: verificationError } = await supabase
        .from('user_verifications')
        .update({
          status: 'approved',
          campus_id: campusId,
          campus_name: campus?.name,
          verified_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (verificationError) throw verificationError;

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          campus_id: campusId,
          is_verified: true,
        })
        .eq('id', userId);

      if (profileError) throw profileError;

      setSuccessMessage(`${email} verified and assigned to ${campus?.name || 'campus'}!`);
      await checkAdminAndFetchData();
    } catch (error) {
      console.error('Approval error:', error);
      alert('Failed to approve user verification.');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(userId: string, email: string) {
    if (!confirm(`Are you sure you want to reject verification for ${email}?`)) {
      return;
    }

    setActionLoading(userId);

    try {
      const supabase = createSupabaseBrowserClient();

      const { error } = await supabase
        .from('user_verifications')
        .update({ status: 'rejected' })
        .eq('user_id', userId);

      if (error) throw error;

      setSuccessMessage(`Application for ${email} has been rejected.`);
      await checkAdminAndFetchData();
    } catch (error) {
      console.error('Rejection error:', error);
      alert('Failed to reject user verification.');
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-cream text-ink">
        <SiteHeader showMyListings={true} />
        <div className="flex flex-col items-center justify-center py-32">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-soft border border-stone-light">
            <RefreshCw className="h-6 w-6 text-ink-3 animate-spin" />
          </div>
          <p className="mt-4 text-sm font-medium text-ink-2">Loading Admin Console...</p>
        </div>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-cream text-ink">
        <SiteHeader showMyListings={true} />
        <div className="mx-auto max-w-md px-4 py-20 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600 border border-red-200">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-ink">Access Restricted</h1>
          <p className="mt-2 text-sm text-ink-3">
            This portal is reserved strictly for verified campus network administrators.
          </p>
          <button
            onClick={() => router.push('/feed')}
            className="mt-6 inline-flex rounded-xl bg-ink px-6 py-3 text-sm font-medium text-cream hover:bg-ink-2 transition shadow-sm"
          >
            Return to Feed
          </button>
        </div>
      </main>
    );
  }

  const rawUsers =
    selectedTab === 'pending'
      ? pendingUsers
      : selectedTab === 'approved'
      ? approvedUsers
      : rejectedUsers;

  const currentUsers = rawUsers.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.email.toLowerCase().includes(q) ||
      (u.full_name && u.full_name.toLowerCase().includes(q))
    );
  });

  const stats = {
    pending: pendingUsers.length,
    approved: approvedUsers.length,
    rejected: rejectedUsers.length,
    total: pendingUsers.length + approvedUsers.length + rejectedUsers.length,
  };

  return (
    <main className="min-h-screen bg-cream text-ink">
      <SiteHeader showMyListings={true} />

      {/* Floating Success Toast */}
      {successMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-ink px-5 py-3.5 text-sm font-medium text-cream shadow-xl border border-stone-light/20 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12">
        {/* Banner Card */}
        <div className="relative overflow-hidden rounded-[1.75rem] border border-stone-light bg-white p-6 sm:p-10 shadow-soft">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent/5 blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 h-56 w-56 rounded-full bg-green/5 blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent mb-3">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Admin Control Center</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink">
                Campus Identity Verifications
              </h1>
              <p className="mt-2 text-sm sm:text-base text-ink-2 max-w-xl">
                Review student account requests, assign university domain networks, and maintain a verified peer marketplace.
              </p>
            </div>

            <button
              onClick={checkAdminAndFetchData}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone bg-cream px-4 py-2.5 text-xs font-semibold text-ink-2 hover:bg-stone-light hover:text-ink transition shrink-0 self-start md:self-auto"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh Console
            </button>
          </div>
        </div>

        {/* Analytics Stats Grid */}
        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Users */}
          <div
            onClick={() => setSelectedTab('approved')}
            className="cursor-pointer group rounded-2xl border border-stone-light bg-white p-5 transition hover:border-stone hover:shadow-soft"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-3">
                Total Requests
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-light text-ink-2 group-hover:scale-105 transition">
                <Users className="h-4.5 w-4.5" />
              </span>
            </div>
            <p className="mt-3 text-3xl font-bold text-ink">{stats.total}</p>
            <p className="mt-1 text-xs text-ink-3">All registrations</p>
          </div>

          {/* Pending */}
          <div
            onClick={() => setSelectedTab('pending')}
            className={`cursor-pointer group rounded-2xl border p-5 transition hover:shadow-soft ${
              selectedTab === 'pending'
                ? 'border-amber-400 bg-amber-50/40'
                : 'border-stone-light bg-white hover:border-amber-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">
                Pending Review
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700 group-hover:scale-105 transition">
                <Clock className="h-4.5 w-4.5" />
              </span>
            </div>
            <p className="mt-3 text-3xl font-bold text-amber-800">{stats.pending}</p>
            <p className="mt-1 text-xs text-amber-700 font-medium">Awaiting action</p>
          </div>

          {/* Approved */}
          <div
            onClick={() => setSelectedTab('approved')}
            className={`cursor-pointer group rounded-2xl border p-5 transition hover:shadow-soft ${
              selectedTab === 'approved'
                ? 'border-green/40 bg-green-light/50'
                : 'border-stone-light bg-white hover:border-green/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-green-700">
                Approved
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-light text-green-700 group-hover:scale-105 transition">
                <UserCheck className="h-4.5 w-4.5" />
              </span>
            </div>
            <p className="mt-3 text-3xl font-bold text-green-800">{stats.approved}</p>
            <p className="mt-1 text-xs text-green-700 font-medium">Verified peers</p>
          </div>

          {/* Rejected */}
          <div
            onClick={() => setSelectedTab('rejected')}
            className={`cursor-pointer group rounded-2xl border p-5 transition hover:shadow-soft ${
              selectedTab === 'rejected'
                ? 'border-red-300 bg-red-50/50'
                : 'border-stone-light bg-white hover:border-red-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-red-700">
                Rejected
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-100 text-red-700 group-hover:scale-105 transition">
                <UserX className="h-4.5 w-4.5" />
              </span>
            </div>
            <p className="mt-3 text-3xl font-bold text-red-800">{stats.rejected}</p>
            <p className="mt-1 text-xs text-red-700 font-medium">Declined users</p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex rounded-2xl border border-stone-light bg-white p-1.5 shadow-2xs overflow-x-auto">
            <button
              onClick={() => setSelectedTab('pending')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition whitespace-nowrap ${
                selectedTab === 'pending'
                  ? 'bg-ink text-cream shadow-2xs'
                  : 'text-ink-2 hover:bg-stone-light hover:text-ink'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              Pending Review ({stats.pending})
            </button>
            <button
              onClick={() => setSelectedTab('approved')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition whitespace-nowrap ${
                selectedTab === 'approved'
                  ? 'bg-ink text-cream shadow-2xs'
                  : 'text-ink-2 hover:bg-stone-light hover:text-ink'
              }`}
            >
              <UserCheck className="h-3.5 w-3.5" />
              Approved ({stats.approved})
            </button>
            <button
              onClick={() => setSelectedTab('rejected')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition whitespace-nowrap ${
                selectedTab === 'rejected'
                  ? 'bg-ink text-cream shadow-2xs'
                  : 'text-ink-2 hover:bg-stone-light hover:text-ink'
              }`}
            >
              <UserX className="h-3.5 w-3.5" />
              Rejected ({stats.rejected})
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search user name or email..."
              className="w-full rounded-2xl border border-stone-light bg-white pl-10 pr-4 py-2.5 text-xs text-ink placeholder:text-ink-3/70 focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink transition"
            />
          </div>
        </div>

        {/* Verification Cards Feed */}
        <div className="mt-6 space-y-4">
          {currentUsers.length === 0 ? (
            <div className="rounded-[1.75rem] border border-dashed border-stone-light bg-white p-12 text-center shadow-soft">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-light/60 text-ink-3 mb-3">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-ink">
                No {selectedTab} applications found
              </h3>
              <p className="mt-1 text-xs text-ink-3 max-w-sm mx-auto">
                {searchQuery
                  ? `No applications match your search for "${searchQuery}".`
                  : selectedTab === 'pending'
                  ? 'All pending student signup requests have been reviewed.'
                  : `There are currently no ${selectedTab} verification records.`}
              </p>
            </div>
          ) : (
            currentUsers.map((user) => {
              const initials = (user.full_name || user.email)
                .split('@')[0]
                .slice(0, 2)
                .toUpperCase();

              const formattedDate = new Date(user.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <div
                  key={user.id}
                  className="group rounded-[1.5rem] border border-stone-light bg-white p-5 sm:p-6 transition hover:border-stone hover:shadow-soft"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                    {/* User Profile Summary */}
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-accent to-accent/80 text-sm font-bold text-cream shadow-2xs">
                        {initials}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-base text-ink truncate">
                            {user.full_name || 'Campus Student'}
                          </h3>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                              user.status === 'pending'
                                ? 'bg-amber-100 text-amber-800'
                                : user.status === 'approved'
                                ? 'bg-green-light text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {user.status}
                          </span>
                        </div>

                        <p className="text-xs text-ink-3 truncate mt-0.5">{user.email}</p>
                        <p className="text-[11px] text-ink-3/80 mt-1">
                          Applied: {formattedDate}
                        </p>
                      </div>
                    </div>

                    {/* Actions & Campus Selector for Pending */}
                    {selectedTab === 'pending' && (
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 border-t md:border-t-0 border-stone-light pt-4 md:pt-0">
                        <div className="relative min-w-[200px]">
                          <select
                            value={selectedCampus[user.user_id] || ''}
                            onChange={(e) =>
                              setSelectedCampus((prev) => ({
                                ...prev,
                                [user.user_id]: e.target.value,
                              }))
                            }
                            disabled={actionLoading === user.user_id}
                            className="w-full rounded-xl border border-stone bg-cream px-3 py-2.5 text-xs font-medium text-ink focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink transition disabled:opacity-50"
                          >
                            <option value="">Assign Campus...</option>
                            {campuses.map((campus) => (
                              <option key={campus.id} value={campus.id}>
                                {campus.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApprove(user.user_id, user.email)}
                            disabled={
                              actionLoading === user.user_id ||
                              !selectedCampus[user.user_id]
                            }
                            className="inline-flex flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-xl bg-green-700 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50 shadow-2xs"
                          >
                            {actionLoading === user.user_id ? (
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            )}
                            Approve
                          </button>

                          <button
                            onClick={() => handleReject(user.user_id, user.email)}
                            disabled={actionLoading === user.user_id}
                            className="inline-flex flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {actionLoading === user.user_id ? (
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <XCircle className="h-3.5 w-3.5" />
                            )}
                            Reject
                          </button>
                        </div>
                      </div>
                    )}

                    {selectedTab === 'approved' && (
                      <div className="flex items-center gap-2 text-xs text-green-700 font-medium bg-green-light/40 px-3.5 py-2 rounded-xl border border-green/20">
                        <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                        <span>Verified Campus Peer</span>
                      </div>
                    )}

                    {selectedTab === 'rejected' && (
                      <div className="flex items-center gap-2 text-xs text-red-700 font-medium bg-red-50 px-3.5 py-2 rounded-xl border border-red-200">
                        <XCircle className="h-4 w-4 text-red-600 shrink-0" />
                        <span>Verification Declined</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}