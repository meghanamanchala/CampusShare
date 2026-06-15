'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

const ALLOWED_CAMPUS_DOMAINS = [
  'iitd.ac.in',
  'vitstudent.ac.in',
  'bits-pilani.ac.in',
  'apollouniversity.edu.in',
  'lpu.in',
];

type SignupFormProps = {
  redirectTo?: string;
};

export function SignupForm({ redirectTo = '/auth/pending' }: SignupFormProps) {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Validation
    if (!formData.fullName.trim()) {
      setStatus('error');
      setMessage('Please enter your full name');
      return;
    }

    if (!formData.email.trim()) {
      setStatus('error');
      setMessage('Please enter your email');
      return;
    }

    const domain = formData.email.split('@')[1]?.toLowerCase();

    if (!domain || !ALLOWED_CAMPUS_DOMAINS.includes(domain)) {
      setStatus('error');
      setMessage(
        'Please use a valid campus email address. Supported domains: iitd.ac.in, vitstudent.ac.in, bits-pilani.ac.in, apollouniversity.edu.in'
      );
      return;
    }

    if (formData.password.length < 8) {
      setStatus('error');
      setMessage('Password must be at least 8 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setStatus('error');
      setMessage('Passwords do not match');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const supabase = createSupabaseBrowserClient();

      // Step 1: Sign up user
      const { data: authData, error: signupError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          },
        },
      });

      if (signupError) throw signupError;

      if (!authData.user) {
        throw new Error('Failed to create user account');
      }

      // Step 2: Create profile
      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        email: formData.email,
        full_name: formData.fullName,
        is_verified: false,
        is_admin: false,
      });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Don't throw, profile might already exist
      }

      // Step 3: Create verification record
      const { error: verificationError } = await supabase
        .from('user_verifications')
        .insert({
          user_id: authData.user.id,
          email: formData.email,
          status: 'pending',
        });

      if (verificationError) {
        console.error('Verification record error:', verificationError);
        throw verificationError;
      }

      // Step 4: Sign out the newly created user (they can't access anything yet)
      await supabase.auth.signOut();

      setStatus('success');
      setMessage(
        '✅ Signup successful! Your campus email is now pending admin verification. You will be able to sign in once approved.'
      );

      // Redirect after 2 seconds
      setTimeout(() => {
    router.push(redirectTo as any);  // Cast to bypass strict typedRoutes
  }, 2000);

    } catch (error) {
      setStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'Signup failed. Please try again.';
      setMessage(errorMessage);
      console.error('Signup error:', error);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSignup} className="space-y-5">
        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-900 mb-2">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Your full name"
              required
              disabled={status === 'loading'}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
            Campus Email
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
          <p className="text-xs text-gray-500 mt-1">
            Use your official campus email address
          </p>
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
              placeholder="Minimum 8 characters"
              required
              disabled={status === 'loading'}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100"
            />
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-900 mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
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
                : 'bg-green-50 text-green-800 border border-green-200'
            }`}
          >
            {message}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={status === 'loading' || status === 'success'}
          className="w-full py-2 px-4 bg-black text-white font-medium rounded-lg hover:bg-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        >
          {status === 'loading' ? 'Creating account...' : 'Sign up'}
        </button>

        {/* Terms & Conditions */}
        <p className="text-xs text-gray-500 text-center">
          By signing up, you agree to our Terms of Service and Privacy Policy.
          Your account will need admin verification before you can access the platform.
        </p>
      </form>
    </div>
  );
}