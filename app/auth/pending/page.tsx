'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'checking';

export default function PendingPage() {
  const router = useRouter();
  const [status, setStatus] = useState<VerificationStatus>('checking');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    checkVerificationStatus();
    
    // Check every 5 seconds if status has changed
    const interval = setInterval(checkVerificationStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  async function checkVerificationStatus() {
    try {
      const supabase = createSupabaseBrowserClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      // ✅ FIX: User without session should see pending, not rejected
      if (!user) {
        setStatus('pending');
        setMessage('Your signup is pending admin review. Check back soon!');
        return;
      }

      setEmail(user.email || '');

      const { data: verificationData } = await supabase
        .from('user_verifications')
        .select('status')
        .eq('user_id', user.id)
        .single();

      if (!verificationData) {
        setStatus('pending');
        setMessage('Your signup is pending admin review. Check back soon!');
        return;
      }

      if (verificationData.status === 'approved') {
        setStatus('approved');
        setMessage('Your campus email has been verified! You can now sign in.');
        
        // Sign out first, then redirect to login
        setTimeout(async () => {
          await supabase.auth.signOut();
          router.push('/auth/login');
        }, 3000);
      } else if (verificationData.status === 'rejected') {
        setStatus('rejected');
        setMessage(
          'Your signup was rejected by the admin team. Please contact support@campusshare.local for more information.'
        );
      } else {
        setStatus('pending');
      }
    } catch (error) {
      console.error('Error checking verification:', error);
      setStatus('pending');
    }
  }

  // Sign out before redirecting to login
  async function handleSignInNow() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push('/auth/login');
  }

  if (status === 'checking') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4 inline-block">
            <Clock className="h-12 w-12 text-gray-400" />
          </div>
          <p className="text-gray-600">Checking your status...</p>
        </div>
      </div>
    );
  }

  if (status === 'approved') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-md mx-auto px-6 py-16 sm:py-24">
          <div className="bg-white rounded-lg shadow-sm border border-green-200 p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Verified!</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <p className="text-sm text-gray-500 mb-6">Redirecting to login page...</p>
            
            <button
              onClick={handleSignInNow}
              className="inline-block px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition"
            >
              Sign In Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'rejected') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-md mx-auto px-6 py-16 sm:py-24">
          <div className="bg-white rounded-lg shadow-sm border border-red-200 p-8 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Signup Rejected</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            
            <div className="space-y-3">
              <Link
                href="/auth/signup"
                className="block px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition"
              >
                Try Again with Different Email
              </Link>
              <Link
                href="/"
                className="block px-6 py-2 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition"
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Status: pending (default)
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-md mx-auto px-6 py-16 sm:py-24">
        <div className="bg-white rounded-lg shadow-sm border border-yellow-200 p-8">
          <div className="text-center mb-6">
            <Clock className="h-16 w-16 text-yellow-500 mx-auto mb-4 animate-bounce" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Pending Verification</h1>
            <p className="text-gray-600">
              Your campus email {email && <strong>{email}</strong>} is awaiting admin verification.
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>What happens next?</strong>
            </p>
            <ul className="text-sm text-yellow-800 mt-2 space-y-2">
              <li>✓ Our admin team will verify your campus email</li>
              <li>✓ Your account will be assigned to your campus</li>
              <li>✓ You'll receive a notification once approved</li>
              <li>✓ Then you can sign in and start using CampusShare</li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Typical approval time:</strong> 1-24 hours
            </p>
          </div>

          <button
            onClick={checkVerificationStatus}
            className="w-full px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition mb-3"
          >
            Check Status Now
          </button>

          <Link
            href="/"
            className="block text-center px-6 py-2 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition"
          >
            Back to Home
          </Link>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Questions? Contact us at{' '}
              <a href="mailto:support@campusshare.local" className="text-black hover:underline">
                support@campusshare.local
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}