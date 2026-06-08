'use client';

import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

type SignupFormProps = {
  redirectTo: string;
};

export function SignupForm({ redirectTo }: SignupFormProps) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('No spam. Supabase can send the verification link to your campus email.');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('loading');

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
        },
      });

      if (error) {
        throw error;
      }

      setStatus('success');
      setMessage(`Verification link sent to ${email}. Check your inbox to continue.`);
      setEmail('');
    } catch (error) {
      const fallbackMessage = error instanceof Error ? error.message : 'Could not send verification link.';
      setStatus('error');
      setMessage(fallbackMessage);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
      <input
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="yourname@university.edu"
        className="min-w-0 flex-1 rounded-xl border border-stone bg-white px-4 py-3 text-sm outline-none transition focus:border-ink"
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="rounded-xl bg-ink px-6 py-3 text-sm font-medium text-cream transition hover:bg-ink-2 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === 'loading' ? 'Sending...' : 'Join free'}
      </button>
      <p className="mt-1 text-xs text-ink-3 sm:col-span-2">{message}</p>
    </form>
  );
}