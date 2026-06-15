'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

type LoginFormProps = {
  redirectTo?: string;
};

export function LoginForm({ redirectTo = '/feed' }: LoginFormProps) {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'pending' | 'rejected' | 'success'>('idle');
  const [message, setMessage] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Validation
    if (!formData.email.trim()) {
      setStatus('error');
      setMessage('Please enter your email');
      return;
    }

    if (!formData.password) {
      setStatus('error');
      setMessage('Please enter your password');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const supabase = createSupabaseBrowserClient();

      // Step 1: Sign in
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) {
        setStatus('error');
        setMessage('Invalid email or password. Please try again.');
        console.error('Sign in error:', signInError);
        return;
      }

      if (!authData.user) {
        throw new Error('No user returned from sign in');
      }


      // Step 2: Check if user is verified
      const { data: verificationData, error: verificationError } = await supabase
        .from('user_verifications')
        .select('status')
        .eq('user_id', authData.user.id)
        .single();

      if (verificationError) {
        console.error('Verification check error:', verificationError);
        // If no verification record, sign them out
        await supabase.auth.signOut();
        setStatus('pending');
        setMessage(
          '⏳ Your campus email is still pending admin verification. Please wait for approval from the admin team.'
        );
        return;
      }


      // Step 3: Check verification status
      if (verificationData.status === 'pending') {
        await supabase.auth.signOut();
        setStatus('pending');
        setMessage(
          '⏳ Your campus email is still pending admin verification. You will be able to sign in once approved.'
        );
        return;
      }

      if (verificationData.status === 'rejected') {
        await supabase.auth.signOut();
        setStatus('rejected');
        setMessage(
          '❌ Your signup was rejected by the admin team. Please contact support@campusshare.local for more information.'
        );
        return;
      }

      if (verificationData.status !== 'approved') {
        await supabase.auth.signOut();
        setStatus('error');
        setMessage('Unknown verification status. Please contact support.');
        return;
      }

      // Step 4: User is verified and approved - let middleware handle the redirect
      // Middleware will check if user is admin and redirect to /admin/dashboard if true
      setStatus('success');
      setMessage('✅ Sign in successful! Redirecting...');

      setTimeout(() => {
        // Just redirect to /feed - middleware will intercept and redirect to /admin/dashboard if needed
        router.push('/feed');
      }, 1000);

    } catch (error) {
      setStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed. Please try again.';
      setMessage(errorMessage);
      console.error('Login error:', error);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleLogin} className="space-y-5">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="student@iitd.ac.in"
              required
              disabled={status === 'loading'}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Your password"
              required
              disabled={status === 'loading'}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100"
            />
          </div>
        </div>

        {/* Status Message */}
        {message && (
          <div
            className={`p-3 rounded-lg text-sm ${
              status === 'error'
                ? 'bg-red-50 text-red-800 border border-red-200'
                : status === 'pending'
                ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                : status === 'rejected'
                ? 'bg-red-50 text-red-800 border border-red-200'
                : 'bg-green-50 text-green-800 border border-green-200'
            }`}
          >
            {message}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full py-2 px-4 bg-black text-white font-medium rounded-lg hover:bg-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        >
          {status === 'loading' ? 'Signing in...' : 'Sign in'}
        </button>

        {/* Help Text */}
        {status === 'pending' && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
            <p className="font-medium mb-1">First time?</p>
            <p>If you haven't signed up yet, please visit our signup page to create your account.</p>
          </div>
        )}
      </form>
    </div>
  );
}