'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Handshake,
  CheckCircle2,
  XCircle,
  Clock,
  KeyRound,
  MessageSquare,
  RefreshCw,
  UserCheck,
} from 'lucide-react';
import {
  approveClaimRequestAction,
  getClaimRequestsAction,
  rejectClaimRequestAction,
  type ClaimRequestItem,
} from '@/app/actions';

type OwnerClaimRequestsProps = {
  listingId: string;
  listingStatus: string;
};

export function OwnerClaimRequests({
  listingId,
  listingStatus,
}: OwnerClaimRequestsProps) {
  const router = useRouter();
  const [requests, setRequests] = useState<ClaimRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, [listingId]);

  async function fetchRequests() {
    setLoading(true);
    const res = await getClaimRequestsAction(listingId);
    if (res.status === 'success') {
      setRequests(res.requests || []);
    }
    setLoading(false);
  }

  function handleApprove(requestId: string) {
    setActionLoading(requestId);
    const [, startTransition] = [null, (fn: () => void) => fn()];
    startTransition(async () => {
      const res = await approveClaimRequestAction(requestId, listingId);
      if (res.status === 'success') {
        await fetchRequests();
        router.refresh();
      } else {
        alert(res.message);
      }
      setActionLoading(null);
    });
  }

  function handleReject(requestId: string) {
    if (!confirm('Decline this claim request?')) return;
    setActionLoading(requestId);
    const [, startTransition] = [null, (fn: () => void) => fn()];
    startTransition(async () => {
      const res = await rejectClaimRequestAction(requestId, listingId);
      if (res.status === 'success') {
        await fetchRequests();
        router.refresh();
      } else {
        alert(res.message);
      }
      setActionLoading(null);
    });
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-stone-light bg-cream-dark/40 p-4 text-center">
        <RefreshCw className="mx-auto h-4 w-4 animate-spin text-ink-3 mb-1" />
        <p className="text-xs text-ink-3">Checking claim requests...</p>
      </div>
    );
  }

  if (requests.length === 0) {
    return null;
  }

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const approvedRequests = requests.filter((r) => r.status === 'approved');

  return (
    <div className="rounded-2xl border border-stone-light bg-white p-5 shadow-soft space-y-4">
      <div className="flex items-center justify-between border-b border-stone-light pb-3">
        <div className="flex items-center gap-2">
          <Handshake className="h-4 w-4 text-accent" />
          <h3 className="text-sm font-semibold text-ink">
            Claim Requests ({requests.length})
          </h3>
        </div>
        <button
          onClick={fetchRequests}
          className="text-xs text-ink-3 hover:text-ink transition flex items-center gap-1"
        >
          <RefreshCw className="h-3 w-3" />
          Refresh
        </button>
      </div>

      <div className="space-y-3">
        {requests.map((req) => {
          const initials = req.requesterName.slice(0, 2).toUpperCase();
          const isPendingAction = actionLoading === req.id;

          return (
            <div
              key={req.id}
              className="rounded-xl border border-stone-light bg-cream/40 p-4 space-y-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink text-xs font-bold text-cream">
                    {initials}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-ink">
                      {req.requesterName}
                    </p>
                    <p className="text-[10px] text-ink-3">
                      Requested: {new Date(req.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                    req.status === 'pending'
                      ? 'bg-amber-100 text-amber-800'
                      : req.status === 'approved'
                      ? 'bg-green-light text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {req.status}
                </span>
              </div>

              {req.note && (
                <div className="rounded-lg bg-white p-2.5 border border-stone-light/60 text-xs text-ink-2">
                  <p className="font-medium text-ink-3 text-[10px] uppercase tracking-wider mb-0.5">
                    Pickup Proposal Note:
                  </p>
                  <p className="italic">"{req.note}"</p>
                </div>
              )}

              {/* Handoff Code PIN for approved claims */}
              {req.status === 'approved' && (
                <div className="flex items-center justify-between rounded-lg bg-green-light/50 p-2.5 border border-green/20 text-xs text-green-800">
                  <span className="flex items-center gap-1.5 font-medium">
                    <UserCheck className="h-4 w-4 text-green-600" />
                    Approved for Pickup
                  </span>
                  <span className="font-mono font-bold tracking-widest text-ink bg-white px-2 py-0.5 rounded border border-stone-light">
                    PIN: {req.pickupCode}
                  </span>
                </div>
              )}

              {/* Pending Action Buttons */}
              {req.status === 'pending' && listingStatus === 'available' && (
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleApprove(req.id)}
                    disabled={Boolean(actionLoading)}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-green-700 px-3 py-2 text-xs font-medium text-white transition hover:bg-green-800 disabled:opacity-50"
                  >
                    {isPendingAction ? (
                      <RefreshCw className="h-3 w-3 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    )}
                    Approve Request
                  </button>

                  <button
                    onClick={() => handleReject(req.id)}
                    disabled={Boolean(actionLoading)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Decline
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
