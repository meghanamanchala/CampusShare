import { ListingForm } from '@/components/listing-form';
import { SignupForm } from '@/components/signup-form';
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
      <header className="sticky top-0 z-50 border-b border-stone-light bg-cream/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <a
            href="/"
            className="flex items-center gap-3 font-serif text-[1.35rem]"
          >
            <span className="h-2 w-2 rounded-full bg-accent" />
            CampusShare
          </a>

          <a
            href="/"
            className="rounded-xl border border-stone px-5 py-2 text-sm text-ink-2 transition hover:bg-stone-light"
          >
            Back to Feed
          </a>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-12">
          <span className="inline-flex items-center rounded-full bg-green-light px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-green">
            Campus Marketplace
          </span>

          <h1 className="mt-6 font-serif text-5xl tracking-[-0.03em] md:text-7xl">
            Post an <span className="italic text-ink-3">Item</span>
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-ink-2">
            Share, sell, lend, or give away useful items to students in your
            campus community.
          </p>
        </div>

        {isSignedIn ? (
          <div className="max-w-3xl">
            <ListingForm defaultOwnerName={defaultOwnerName} />
          </div>
        ) : (
          <div className="max-w-2xl rounded-[2rem] border border-stone-light bg-white p-8 shadow-soft">
            <h2 className="font-serif text-3xl text-ink">
              Sign in to continue
            </h2>

            <p className="mt-3 text-ink-3">
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