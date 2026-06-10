import { ListingForm } from '@/components/listing-form';
import { SignupForm } from '@/components/signup-form';
import { SiteHeader } from '@/components/site-header';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function PostPage() {
  const supabase = await createSupabaseServerClient();
  const { data: sessionData } = await supabase.auth.getSession();

  const isSignedIn = Boolean(sessionData.session?.user);

  const defaultOwnerName =
    sessionData.session?.user.email
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

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16 md:py-20">
        <div className="mb-8 max-w-3xl sm:mb-12">
          <span className="inline-flex items-center rounded-full bg-green-light px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-green">
            Campus Marketplace
          </span>

          <h1 className="mt-5 font-serif text-4xl tracking-[-0.03em] sm:text-5xl md:text-7xl">
            Post an <span className="italic text-ink-3">Item</span>
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-ink-2 sm:text-lg sm:leading-8">
            Share, sell, lend, or give away useful items to students in your
            campus community.
          </p>
        </div>

        {isSignedIn ? (
          <div className="max-w-3xl">
            <ListingForm defaultOwnerName={defaultOwnerName} />
          </div>
        ) : (
          <div className="max-w-2xl rounded-[1.5rem] sm:rounded-[2rem] border border-stone-light bg-white p-5 sm:p-8 shadow-soft">
            <h2 className="font-serif text-2xl sm:text-3xl text-ink">
              Sign in to continue
            </h2>

            <p className="mt-3 text-sm sm:text-base text-ink-3">
              Use your campus email to create and manage listings.
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