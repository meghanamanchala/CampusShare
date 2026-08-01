'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Shield, User, Phone, BookOpen, Mail, Award } from 'lucide-react';
import { updateProfileAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const initialState = {
  status: 'idle' as const,
  message: 'Update your profile information.',
};

type ProfileFormProps = {
  profile: {
    id: string;
    email: string;
    full_name: string;
    campus_name?: string | null;
    is_verified?: boolean | null;
    is_admin?: boolean | null;
    phone_number?: string | null;
    bio?: string | null;
  };
};

export function ProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    updateProfileAction,
    initialState
  );

  const [fullName, setFullName] = useState(profile.full_name || '');
  const [phoneNumber, setPhoneNumber] = useState(profile.phone_number || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (state.status === 'success') {
      setShowNotification(true);
      router.refresh();
    }
  }, [state.status, router]);

  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showNotification]);

  // Get initials for avatar
  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'CS';

  return (
    <div className="space-y-6">
      {/* Visual Header / Avatar Banner Card */}
      <div className="relative overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] border border-stone-light bg-white p-6 shadow-soft sm:p-8">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/5 blur-2xl" />
        <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-green/5 blur-2xl" />

        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          {/* Gradients Avatar */}
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-accent to-accent/80 text-2xl font-bold tracking-wider text-cream shadow-md">
            {initials}
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl sm:text-3xl text-ink font-bold tracking-tight">
                {fullName || 'CampusShare User'}
              </h2>
              {profile.is_admin && (
                <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                  <Shield className="h-3.5 w-3.5" />
                  Admin
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-sm text-ink-3">
              <span className="flex items-center gap-1.5">
                <Mail className="h-4 w-4" />
                {profile.email}
              </span>

              {profile.campus_name && (
                <span className="flex items-center gap-1.5 font-medium text-green">
                  <CheckCircle className="h-4 w-4 text-green" />
                  Verified on {profile.campus_name}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Edit Card Form */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b border-stone-light/80 bg-cream/40 px-4 py-5 sm:px-6 sm:py-6">
          <CardTitle className="text-xl sm:text-2xl text-ink">
            Profile Settings
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-ink-3">
            Manage your campus profile details. Some verification details are managed by your university admin.
          </CardDescription>
        </CardHeader>

        <form action={formAction}>
          <CardContent className="space-y-6 px-4 py-5 sm:px-6 sm:py-8">
            {/* Notification banner */}
            {showNotification && state.status === 'success' && (
              <div className="rounded-xl bg-green-light border border-green/30 p-4 text-sm text-green flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                {state.message}
              </div>
            )}

            {state.status === 'error' && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">
                {state.message}
              </div>
            )}

            {/* Edit fields */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="flex items-center gap-2">
                <User className="h-4 w-4 text-ink-3" />
                Full Name
              </Label>
              <Input
                id="fullName"
                name="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your name"
                required
                className="h-12 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-ink-3" />
                Phone / WhatsApp Number
              </Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91 XXXXX XXXXX"
                className="h-12 rounded-xl"
              />
              <p className="text-xs text-ink-3">
                Optional. Required if you list items and choose "WhatsApp / Phone" as preferred contact.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-ink-3" />
                Bio / About You
              </Label>
              <Textarea
                id="bio"
                name="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Mention your department, interests, or dorm details..."
                className="min-h-[100px] rounded-xl"
              />
              <p className="text-xs text-ink-3">
                Optional. Tell other students a little bit about yourself.
              </p>
            </div>

            {/* Read only verified details */}
            <div className="rounded-2xl bg-cream p-4 border border-stone-light/60 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-3 flex items-center gap-1.5">
                <Award className="h-4 w-4 text-accent" />
                Verification Status
              </h3>
              
              <div className="grid gap-3 sm:grid-cols-2 text-sm">
                <div>
                  <p className="text-ink-3 text-xs">Email</p>
                  <p className="font-medium text-ink break-all mt-0.5">{profile.email}</p>
                </div>
                <div>
                  <p className="text-ink-3 text-xs">Campus Network</p>
                  <p className="font-medium text-ink mt-0.5">
                    {profile.campus_name || 'Verification Pending approval'}
                  </p>
                </div>
              </div>
            </div>

          </CardContent>

          <CardFooter className="border-t border-stone-light/80 bg-cream/20 px-4 py-4 sm:px-6 sm:py-5 flex justify-end">
            <Button
              type="submit"
              disabled={pending}
              className="rounded-xl bg-ink text-cream hover:bg-ink-2 h-11 px-6 shadow-sm disabled:opacity-60 transition"
            >
              {pending ? 'Saving Changes...' : 'Save Changes'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
