'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { claimListingAction } from '@/app/actions';

type ClaimListingButtonProps = {
  listingId: string;
  disabled?: boolean;
};

export function ClaimListingButton({
  listingId,
  disabled = false,
}: ClaimListingButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(
    null
  );

  function handleClaim() {
    startTransition(async () => {
      const result = await claimListingAction(listingId);
      setMessage(result.message);
      setMessageType(result.status === 'success' ? 'success' : 'error');

      if (result.status === 'success') {
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleClaim}
        disabled={disabled || isPending}
        className="w-full sm:w-auto rounded-xl bg-ink px-6 py-3 text-sm font-medium text-cream transition hover:bg-ink-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? 'Claiming...' : 'Claim item'}
      </button>

      {message ? (
        <p
          className={`text-sm ${
            messageType === 'success' ? 'text-green' : 'text-red-600'
          }`}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
