'use client';

import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

type SignupFormProps = {
  redirectTo: string;
};

export function SignupForm({ redirectTo }: SignupFormProps) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('No spam. Supabase can send the verification link to your campus email.');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  useEffect(() => {
    if (cooldownSeconds <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setCooldownSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldownSeconds]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (cooldownSeconds > 0) {
      setStatus('error');
      setMessage(`Please wait ${cooldownSeconds}s before requesting another email.`);
      return;
    }

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
      setCooldownSeconds(30);
    } catch (error) {
      const rawMessage = error instanceof Error ? error.message : 'Could not send verification link.';
      const fallbackMessage = /rate limit|too many/i.test(rawMessage)
        ? 'Email rate limit exceeded. Wait a minute, then try again.'
        : rawMessage;
      setStatus('error');
      setMessage(fallbackMessage);
      if (/rate limit|too many/i.test(rawMessage)) {
        setCooldownSeconds(60);
      }
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
        disabled={status === 'loading' || cooldownSeconds > 0}
        className="rounded-xl bg-ink px-6 py-3 text-sm font-medium text-cream transition hover:bg-ink-2 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === 'loading'
          ? 'Sending...'
          : cooldownSeconds > 0
            ? `Wait ${cooldownSeconds}s`
            : 'Join free'}
      </button>
      <p className="mt-1 text-xs text-ink-3 sm:col-span-2">{message}</p>
    </form>
  );
}