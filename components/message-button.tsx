'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Loader2 } from 'lucide-react';
import { startConversationAction } from '@/app/actions';
import { cn } from '@/lib/utils';

type MessageButtonProps = {
  listingId: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
};

export function MessageButton({
  listingId,
  className,
  variant = 'secondary',
}: MessageButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleStartChat() {
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await startConversationAction(listingId);

      if (res.status === 'success' && res.conversationId) {
        router.push(`/messages/${res.conversationId}`);
      } else {
        setErrorMessage(res.message);
      }
    } catch {
      setErrorMessage('Failed to start chat. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const baseStyles =
    'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-ink disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'bg-ink text-cream hover:bg-ink-2',
    secondary: 'bg-cream-dark border border-stone text-ink hover:bg-stone-light',
    outline: 'border border-stone bg-white text-ink hover:bg-stone-light',
  };

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleStartChat}
        disabled={loading}
        className={cn(baseStyles, variantStyles[variant], className)}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <MessageSquare className="h-4 w-4" />
        )}
        {loading ? 'Opening chat...' : 'Message Poster'}
      </button>

      {errorMessage && (
        <p className="mt-2 text-xs text-red-600">{errorMessage}</p>
      )}
    </div>
  );
}
