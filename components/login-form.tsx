'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
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


      // Step 2: Check or auto-approve user verification
      const { data: verificationData } = await supabase
        .from('user_verifications')
        .select('status')
        .eq('user_id', authData.user.id)
        .maybeSingle();

      if (!verificationData || verificationData.status === 'pending') {
        const emailDomain = authData.user.email?.split('@')[1]?.toLowerCase();
        let campusId: string | null = null;
        let campusName: string | null = null;

        if (emailDomain) {
          const { data: campus } = await supabase
            .from('campuses')
            .select('id, name')
            .eq('domain', emailDomain)
            .maybeSingle();

          if (campus) {
            campusId = campus.id;
            campusName = campus.name;
          } else {
            campusName = emailDomain.split('.')[0].toUpperCase();
          }
        }

        await supabase.from('user_verifications').upsert({
          user_id: authData.user.id,
          email: authData.user.email,
          status: 'approved',
          campus_id: campusId,
          campus_name: campusName,
          verified_at: new Date().toISOString(),
        });

        await supabase
          .from('profiles')
          .update({
            is_verified: true,
            campus_id: campusId,
          })
          .eq('id', authData.user.id);
      } else if (verificationData.status === 'rejected') {
        await supabase.auth.signOut();
        setStatus('rejected');
        setMessage(
          'Your signup was rejected by the admin team. Please contact support@campusshare.local.'
        );
        return;
      }

      setStatus('success');
      setMessage('Sign in successful! Redirecting...');

      setTimeout(() => {
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
            className={`p-3 rounded-lg text-sm flex items-center gap-2 ${
              status === 'error'
                ? 'bg-red-50 text-red-800 border border-red-200'
                : status === 'pending'
                ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                : status === 'rejected'
                ? 'bg-red-50 text-red-800 border border-red-200'
                : 'bg-green-50 text-green-800 border border-green-200'
            }`}
          >
            {status === 'error' || status === 'rejected' ? (
              <AlertCircle className="h-4 w-4 shrink-0" />
            ) : (
              <CheckCircle className="h-4 w-4 shrink-0" />
            )}
            <span>{message}</span>
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