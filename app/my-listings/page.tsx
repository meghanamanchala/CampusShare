import { MyListingActions } from '@/components/my-listing-actions';
import { ListingImage } from '@/components/listing-image';
import { ListingStatusBadge } from '@/components/listing-status-badge';
import { SignupForm } from '@/components/signup-form';
import { SiteHeader } from '@/components/site-header';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { LISTING_SELECT_FIELDS, mapListingRow } from '@/lib/listings';

export default async function MyListingsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: sessionData } = await supabase.auth.getSession();
  const isSignedIn = Boolean(sessionData.session?.user);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const authCallbackUrl = `${siteUrl.replace(/\/$/, '')}/auth/callback?next=/my-listings`;

  let listings: ReturnType<typeof mapListingRow>[] = [];

  if (isSignedIn && sessionData.session?.user) {
    const { data } = await supabase
      .from('listings')
      .select(LISTING_SELECT_FIELDS)
      .eq('user_id', sessionData.session.user.id)
      .neq('status', 'removed')
      .order('created_at', { ascending: false });

    listings = data?.map(mapListingRow) ?? [];
  }

  return (
    <main className="min-h-screen bg-cream text-ink">
      <SiteHeader
        actionHref="/post"
        actionLabel="Post an item"
        showMyListings
      />

      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-10 md:py-16">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink-3">
            Your listings
          </p>
          <h1 className="mt-4 font-serif text-4xl tracking-[-0.03em] sm:text-5xl md:text-6xl">
            Manage <span className="italic text-ink-3">your posts</span>
          </h1>
          <p className="mt-4 text-lg leading-8 text-ink-2">
            Edit details, mark items as claimed, or remove listings from the
            campus feed.
          </p>
        </div>

        {isSignedIn ? (
          <div className="mt-10 space-y-5">
            {listings.length > 0 ? (
              listings.map((item) => (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-[1.25rem] sm:rounded-[1.75rem] border border-stone-light bg-white shadow-sm"
                >
                  <div className="grid gap-0 lg:grid-cols-[220px_1fr]">
                    <ListingImage
                      src={item.imageUrl}
                      alt={item.title}
                      title={item.title}
                      className="aspect-square w-full sm:aspect-[4/3] md:aspect-auto md:h-full md:min-h-[180px]"
                      sizes="220px"
                    />

                    <div className="p-5 md:p-6">
                      <div className="flex flex-wrap items-center gap-2">
                        <div
                          className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${item.tagClassName}`}
                        >
                          {item.tag}
                        </div>
                        <ListingStatusBadge status={item.status} />
                      </div>

                      <h2 className="mt-3 text-xl font-medium text-ink">
                        <a
                          href={`/listings/${item.id}`}
                          className="transition hover:text-accent"
                        >
                          {item.title}
                        </a>
                      </h2>

                      {item.description ? (
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-ink-3">
                          {item.description}
                        </p>
                      ) : null}

                      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-ink-3">
                        <span>{item.price}</span>
                        <span>{item.time}</span>
                      </div>

                      <div className="mt-5 border-t border-stone-light pt-5">
                        <MyListingActions
                          listingId={item.id}
                          status={item.status}
                        />
                      </div>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[1.5rem] sm:rounded-[1.75rem] border border-dashed border-stone-light bg-white p-6 sm:p-10 text-center">
                <p className="text-lg font-medium text-ink">
                  You have not posted anything yet
                </p>
                <p className="mt-2 text-sm text-ink-3">
                  Share your first item with the campus community.
                </p>
                <a
                  href="/post"
                  className="mt-6 flex w-full justify-center rounded-xl bg-ink px-6 py-3 text-sm font-medium text-cream transition hover:bg-ink-2 sm:inline-flex sm:w-auto"
                >
                  Post an item
                </a>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-10 max-w-2xl rounded-[2rem] border border-stone-light bg-white p-8 shadow-soft">
            <h2 className="font-serif text-3xl text-ink">Sign in to continue</h2>
            <p className="mt-3 text-ink-3">
              Use your campus email to view and manage your listings.
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
