'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

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

  useEffect(() => {
    checkAdminAndFetchData();
  }, []);

  async function checkAdminAndFetchData() {
    const supabase = createSupabaseBrowserClient();

    // Check if user is admin
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

    // Fetch campuses
    const { data: campusesData } = await supabase.from('campuses').select('*');
    if (campusesData) {
      setCampuses(campusesData);
    }

    // Fetch all verifications
    const { data: verificationsData } = await supabase
      .from('user_verifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (verificationsData) {
      // Fetch user details for each verification
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
          full_name: profilesMap[v.user_id] || 'Unknown',
        }));

        setPendingUsers(enrichedData.filter((u) => u.status === 'pending'));
        setApprovedUsers(enrichedData.filter((u) => u.status === 'approved'));
        setRejectedUsers(enrichedData.filter((u) => u.status === 'rejected'));
      }
    }

    setLoading(false);
  }

  async function handleApprove(userId: string, email: string) {
    const campusId = selectedCampus[userId];

    if (!campusId) {
      alert('Please select a campus');
      return;
    }

    setActionLoading(userId);

    try {
      const supabase = createSupabaseBrowserClient();

      // Get campus name
      const campus = campuses.find((c) => c.id === campusId);

      // Update verification
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

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          campus_id: campusId,
          is_verified: true,
        })
        .eq('id', userId);

      if (profileError) throw profileError;

      // Refresh data
      await checkAdminAndFetchData();
    } catch (error) {
      console.error('Approval error:', error);
      alert('Failed to approve user. Please try again.');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(userId: string) {
    if (!confirm('Are you sure you want to reject this user?')) {
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

      // Refresh data
      await checkAdminAndFetchData();
    } catch (error) {
      console.error('Rejection error:', error);
      alert('Failed to reject user. Please try again.');
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">Only admins can access this page.</p>
          <button
            onClick={() => router.push('/feed')}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const currentUsers =
    selectedTab === 'pending'
      ? pendingUsers
      : selectedTab === 'approved'
      ? approvedUsers
      : rejectedUsers;

  const stats = {
    pending: pendingUsers.length,
    approved: approvedUsers.length,
    rejected: rejectedUsers.length,
    total: pendingUsers.length + approvedUsers.length + rejectedUsers.length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage user verifications</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <p className="text-gray-600 text-sm font-medium mb-2">Total Users</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-2">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-2">Approved</p>
                <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-2">Rejected</p>
                <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <div className="flex">
            <button
              onClick={() => setSelectedTab('pending')}
              className={`flex-1 py-4 px-6 font-medium border-b-2 transition ${
                selectedTab === 'pending'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Clock className="h-4 w-4 inline mr-2" />
              Pending ({stats.pending})
            </button>
            <button
              onClick={() => setSelectedTab('approved')}
              className={`flex-1 py-4 px-6 font-medium border-b-2 transition ${
                selectedTab === 'approved'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <CheckCircle className="h-4 w-4 inline mr-2" />
              Approved ({stats.approved})
            </button>
            <button
              onClick={() => setSelectedTab('rejected')}
              className={`flex-1 py-4 px-6 font-medium border-b-2 transition ${
                selectedTab === 'rejected'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <XCircle className="h-4 w-4 inline mr-2" />
              Rejected ({stats.rejected})
            </button>
          </div>
        </div>

        {/* User List */}
        <div className="space-y-4">
          {currentUsers.length === 0 ? (
            <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No {selectedTab} users</p>
            </div>
          ) : (
            currentUsers.map((user) => (
              <div
                key={user.id}
                className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {user.full_name || 'Unknown'}
                    </h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Signed up: {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : user.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </span>
                </div>

                {/* Actions */}
                {selectedTab === 'pending' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Assign Campus:
                      </label>
                      <select
                        value={selectedCampus[user.user_id] || ''}
                        onChange={(e) =>
                          setSelectedCampus((prev) => ({
                            ...prev,
                            [user.user_id]: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      >
                        <option value="">Select a campus...</option>
                        {campuses.map((campus) => (
                          <option key={campus.id} value={campus.id}>
                            {campus.name} ({campus.domain})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApprove(user.user_id, user.email)}
                        disabled={
                          actionLoading === user.user_id ||
                          !selectedCampus[user.user_id]
                        }
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
                      >
                        {actionLoading === user.user_id ? 'Approving...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleReject(user.user_id)}
                        disabled={actionLoading === user.user_id}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
                      >
                        {actionLoading === user.user_id ? 'Rejecting...' : 'Reject'}
                      </button>
                    </div>
                  </div>
                )}

                {selectedTab === 'approved' && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-green-700">
                      ✅ User has been approved and can now sign in.
                    </p>
                  </div>
                )}

                {selectedTab === 'rejected' && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-red-700">
                      ❌ User signup has been rejected.
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}