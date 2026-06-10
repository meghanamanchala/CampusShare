'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  deleteListingAction,
  markListingClaimedAction,
} from '@/app/actions';
import type { ListingStatus } from '@/lib/campus-data';

type MyListingActionsProps = {
  listingId: string;
  status: ListingStatus;
};

export function MyListingActions({
  listingId,
  status,
}: MyListingActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(
    null
  );

  function runAction(action: () => Promise<{ status: string; message: string }>) {
    startTransition(async () => {
      const result = await action();
      setMessage(result.message);
      setMessageType(result.status === 'success' ? 'success' : 'error');

      if (result.status === 'success') {
        router.refresh();
      }
    });
  }

  function handleDelete() {
    const confirmed = window.confirm(
      'Remove this listing? It will disappear from the campus feed.'
    );

    if (!confirmed) {
      return;
    }

    runAction(() => deleteListingAction(listingId));
  }

  function handleMarkClaimed() {
    runAction(() => markListingClaimedAction(listingId));
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <a
          href={`/my-listings/${listingId}/edit`}
className="w-full rounded-xl border border-stone px-4 py-3 text-center text-sm text-ink-2 transition hover:bg-stone-light sm:w-auto"        >
          Edit
        </a>

        {status === 'available' ? (
          <button
            type="button"
            onClick={handleMarkClaimed}
            disabled={isPending}
className="w-full rounded-xl bg-ink px-4 py-3 text-sm font-medium text-cream transition hover:bg-ink-2 disabled:opacity-60 sm:w-auto"          >
            Mark claimed
          </button>
        ) : null}

        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
className="w-full rounded-xl border border-red-200 px-4 py-3 text-sm text-red-700 transition hover:bg-red-50 disabled:opacity-60 sm:w-auto"        >
          Delete
        </button>
      </div>

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
