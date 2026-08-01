import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ProfileForm } from '@/components/profile-form';
import { SiteHeader } from '@/components/site-header';

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return (
      <main className="min-h-screen bg-cream text-ink">
        <SiteHeader showMyListings={true} />
        <div className="mx-auto max-w-xl px-4 py-16 text-center">
          <h1 className="text-2xl font-bold">Profile not found</h1>
          <p className="mt-2 text-sm text-ink-3">We couldn't retrieve your profile data. Please try signing in again.</p>
        </div>
      </main>
    );
  }

  // Get verification info to check campus details
  const { data: verification } = await supabase
    .from('user_verifications')
    .select('status, campus_name')
    .eq('user_id', user.id)
    .maybeSingle();

  const enrichedProfile = {
    ...profile,
    campus_name: verification?.status === 'approved' ? (verification?.campus_name || profile.campus_name) : null,
    is_verified: verification?.status === 'approved' || profile.is_verified,
  };

  return (
    <main className="min-h-screen bg-cream text-ink">
      <SiteHeader showMyListings={true} />
      
      <section className="mx-auto max-w-3xl px-4 py-10 md:py-16">
        <h1 className="sr-only">Your Profile</h1>
        <ProfileForm profile={enrichedProfile} />
      </section>
    </main>
  );
}
