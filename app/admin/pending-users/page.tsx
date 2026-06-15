'use client';

import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

type PendingUser = {
  id: string;
  email: string;
  full_name: string;
  campus_id: string | null;
  status: 'pending' | 'approved' | 'rejected';
};

export default function AdminPendingUsers() {
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [campuses, setCampuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const supabase = createSupabaseBrowserClient();

    // Fetch pending users
    const { data: verifications } = await supabase
      .from('user_verifications')
      .select('user_id, email, status')
      .eq('status', 'pending');

    // Fetch user details
    if (verifications) {
      const { data: authUsers } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in(
          'id',
          verifications.map((v) => v.user_id)
        );

      const merged = verifications.map((v) => ({
        id: v.user_id,
        email: v.email,
        full_name: authUsers?.find((u) => u.id === v.user_id)?.full_name || 'N/A',
        campus_id: null,
        status: v.status,
      }));

      setUsers(merged);
    }

    // Fetch campuses for dropdown
    const { data: campusesData } = await supabase
      .from('campuses')
      .select('id, name');
    setCampuses(campusesData || []);

    setLoading(false);
  }

  async function handleApprove(userId: string, campusId: string) {
    const supabase = createSupabaseBrowserClient();

    // Update verification
    await supabase
      .from('user_verifications')
      .update({
        status: 'approved',
        campus_id: campusId,
        verified_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    // Update profile
    await supabase
      .from('profiles')
      .update({ campus_id: campusId, is_verified: true })
      .eq('id', userId);

    // Refresh
    fetchData();
  }

  async function handleReject(userId: string) {
    const supabase = createSupabaseBrowserClient();

    await supabase
      .from('user_verifications')
      .update({ status: 'rejected' })
      .eq('user_id', userId);

    fetchData();
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Pending User Verifications</h1>

      {users.length === 0 ? (
        <p className="text-gray-500">No pending users</p>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="border p-4 rounded-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold">{user.full_name}</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
                <span className="text-xs bg-yellow-100 px-3 py-1 rounded-full">
                  Pending
                </span>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Assign Campus:
                </label>
                <select
                  id={`campus-${user.id}`}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="">Select a campus...</option>
                  {campuses.map((campus) => (
                    <option key={campus.id} value={campus.id}>
                      {campus.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const campusId = (
                      document.getElementById(`campus-${user.id}`) as HTMLSelectElement
                    ).value;
                    if (campusId) handleApprove(user.id, campusId);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(user.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}