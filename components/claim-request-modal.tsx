'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Handshake, CheckCircle2, ShieldCheck, X, KeyRound, Clock } from 'lucide-react';
import { requestClaimListingAction } from '@/app/actions';

type ClaimRequestModalProps = {
  listingId: string;
  listingTitle: string;
  ownerName: string;
};

export function ClaimRequestModal({
  listingId,
  listingTitle,
  ownerName,
}: ClaimRequestModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [note, setNote] = useState('');
  const [isPending, startTransition] = useTransition();

  const [submittedCode, setSubmittedCode] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleSubmitRequest(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    startTransition(async () => {
      const res = await requestClaimListingAction(listingId, note);
      if (res.status === 'success') {
        setSubmittedCode(res.code || '1234');
        router.refresh();
      } else {
        setErrorMessage(res.message);
      }
    });
  }

  function handleClose() {
    setIsOpen(false);
    setSubmittedCode(null);
    setErrorMessage(null);
    setNote('');
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-6 py-3.5 text-sm font-semibold text-cream transition hover:bg-ink-2 shadow-sm"
      >
        <Handshake className="h-4 w-4" />
        Request to Claim
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg overflow-hidden rounded-[2rem] border border-stone-light bg-white p-6 sm:p-8 shadow-xl">
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-cream text-ink-3 hover:bg-stone-light hover:text-ink transition"
            >
              <X className="h-4 w-4" />
            </button>

            {!submittedCode ? (
              <form onSubmit={handleSubmitRequest} className="space-y-5">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 border border-amber-200 mb-2">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Owner Confirmation Required</span>
                  </div>
                  <h3 className="text-2xl font-bold text-ink">
                    Request Claim for "{listingTitle}"
                  </h3>
                  <p className="text-xs sm:text-sm text-ink-3">
                    Propose a pickup time or note to <strong>{ownerName}</strong>. The owner will review your request before marking it claimed.
                  </p>
                </div>

                {errorMessage && (
                  <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-600">
                    {errorMessage}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-2">
                    Pickup Proposal & Note (Optional)
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g. Hi! I can pick this up today at 4:30 PM near the central library quad."
                    className="w-full min-h-[100px] rounded-xl border border-stone bg-cream p-3 text-sm text-ink placeholder:text-ink-3/60 focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink transition"
                  />
                </div>

                <div className="rounded-xl bg-cream p-4 border border-stone-light/60 text-xs text-ink-3 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-semibold text-ink">
                    <ShieldCheck className="h-4 w-4 text-green-600" />
                    <span>Peer Verification Safety</span>
                  </div>
                  <p>
                    A unique 4-digit pickup code will be generated for your request. You can share this PIN with {ownerName} during physical handoff.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-6 py-3 text-sm font-semibold text-cream hover:bg-ink-2 disabled:opacity-60 transition shadow-sm"
                  >
                    {isPending ? 'Submitting Request...' : 'Submit Claim Request'}
                  </button>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="w-full sm:w-auto rounded-xl border border-stone bg-white px-5 py-3 text-sm font-medium text-ink-2 hover:bg-stone-light transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              /* Success Handoff Code View */
              <div className="py-4 text-center space-y-5">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-light border border-green/30 text-green-700">
                  <CheckCircle2 className="h-8 w-8" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-2xl font-bold text-ink">
                    Claim Request Sent!
                  </h3>
                  <p className="text-xs sm:text-sm text-ink-3 max-w-sm mx-auto">
                    Your request has been delivered to <strong>{ownerName}</strong>. Show this verification code during physical pickup:
                  </p>
                </div>

                {/* PIN Code Box */}
                <div className="mx-auto max-w-xs rounded-2xl bg-stone-light/40 border border-stone-light p-4 space-y-1">
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-ink-3 flex items-center justify-center gap-1">
                    <KeyRound className="h-3.5 w-3.5 text-accent" />
                    Handoff Pickup Code
                  </span>
                  <p className="font-mono text-3xl font-bold tracking-widest text-ink">
                    {submittedCode}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full rounded-xl bg-ink px-6 py-3 text-sm font-medium text-cream hover:bg-ink-2 transition"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
