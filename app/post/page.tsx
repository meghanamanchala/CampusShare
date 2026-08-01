import { ListingForm } from '@/components/listing-form';
import { SignupForm } from '@/components/signup-form';
import { SiteHeader } from '@/components/site-header';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function PostPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isSignedIn = Boolean(user);

  const defaultOwnerName =
    user?.email
      ?.split('@')[0]
      .replace(/[._-]+/g, ' ') ?? '';

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  const authCallbackUrl = `${siteUrl.replace(
    /\/$/,
    ''
  )}/auth/callback?next=/post`;

  return (
    <main className="min-h-screen bg-cream text-ink">
      <SiteHeader
        backHref="/"
        backLabel="Back to Feed"
        showMyListings={isSignedIn}
      />

      <section className="mx-auto max-w-xl px-4 py-8 sm:py-12">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">
            Post an Item
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-ink-2 font-light">
            Share, sell, or lend useful items to students on your campus.
          </p>
        </div>

        {isSignedIn ? (
          <ListingForm defaultOwnerName={defaultOwnerName} />
        ) : (
          <div className="rounded-2xl border border-stone-light/80 bg-white p-6 shadow-2xs">
            <h2 className="text-xl font-bold text-ink">
              Sign in to post
            </h2>
            <p className="mt-1 text-xs text-ink-3">
              Use your campus email to create listings.
            </p>

            <div className="mt-6">
              <SignupForm redirectTo={authCallbackUrl} />
            </div>
          </div>
        )}
      </section>
    </main>
  );
}