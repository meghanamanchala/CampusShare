'use client';

import { useEffect, useState } from 'react';
import { Globe, Mail } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

type SignupFormProps = {
  redirectTo: string;
};

export function SignupForm({ redirectTo }: SignupFormProps) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('No spam. Supabase can send the verification link to your campus email.');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [provider, setProvider] = useState<'email' | 'google' | null>(null);
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

    if (provider === 'google') {
      return;
    }

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

  async function handleGoogleSignIn() {
    setStatus('loading');
    setProvider('google');

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      const rawMessage = error instanceof Error ? error.message : 'Could not start Google sign-in.';
      const fallbackMessage = /provider|oauth|google/i.test(rawMessage)
        ? 'Google sign-in is not enabled yet. Turn on the Google provider in Supabase Auth.'
        : rawMessage;
      setStatus('error');
      setProvider(null);
      setMessage(fallbackMessage);
    }
  }

  return (
    <div className="mt-10 w-full max-w-xl mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={status === 'loading'}
          className="w-full sm:w-auto rounded-xl border border-stone bg-white px-6 py-3 text-sm font-medium text-ink transition hover:bg-stone-light disabled:cursor-not-allowed disabled:opacity-70"
        >
          <span className="inline-flex items-center gap-2">
            <Globe className="h-4 w-4" />
            {status === 'loading' && provider === 'google' ? 'Connecting...' : 'Continue with Google'}
          </span>
        </button>
        <span className="flex items-center justify-center text-xs uppercase tracking-[0.2em] text-ink-3">or</span>
        <form
  onSubmit={handleSubmit}
  className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center"
>
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="yourname@university.edu"
            className="w-full min-w-0 rounded-xl border border-stone bg-white px-4 py-3 text-sm outline-none transition focus:border-ink sm:min-w-[280px]"
          />
          <button
            type="submit"
            disabled={status === 'loading' || cooldownSeconds > 0}
            className="w-full sm:w-auto rounded-xl bg-ink px-6 py-3 text-sm font-medium text-cream transition hover:bg-ink-2 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <span className="inline-flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {status === 'loading' && provider === 'email'
                ? 'Sending...'
                : cooldownSeconds > 0
                  ? `Wait ${cooldownSeconds}s`
                  : 'Join free'}
            </span>
          </button>
        </form>
      </div>
      <p className="mt-4 max-w-md mx-auto px-2 text-center text-xs leading-6 text-ink-3 break-words">{message}</p>
    </div>
  );
}