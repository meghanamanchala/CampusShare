'use client';

import Link from 'next/link';
import { SignupForm } from '@/components/signup-form';

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-md mx-auto px-6 py-16 sm:py-24">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">CampusShare</h1>
          <p className="text-gray-600">Join your campus community</p>
        </div>

        {/* Sign Up Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Account</h2>
          <SignupForm redirectTo="/auth/pending" />

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Already have an account?{' '}
              <Link href="/auth/login" className="font-medium text-black hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Your campus email will need admin verification before you can access the platform. You'll receive a notification once approved.
          </p>
        </div>
      </div>
    </div>
  );
}
