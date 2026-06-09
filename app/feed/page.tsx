import { ListingCard } from '@/components/listing-card';
import { FeedFilters } from '@/components/feed-filters';
import { SiteHeader } from '@/components/site-header';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import {
  itemTypeFromFilter,
  LISTING_SELECT_FIELDS,
  mapListingRow,
} from '@/lib/listings';

type FeedPageProps = {
  searchParams: Promise<{ type?: string }>;
};

export default async function FeedPage({ searchParams }: FeedPageProps) {
  const { type } = await searchParams;
  const activeFilter = type ?? 'all';
  const itemType = itemTypeFromFilter(type);

  const supabase = await createSupabaseServerClient();
  const { data: sessionData } = await supabase.auth.getSession();

  let query = supabase
    .from('listings')
    .select(LISTING_SELECT_FIELDS)
    .neq('status', 'removed')
    .order('created_at', { ascending: false });

  if (itemType) {
    query = query.eq('item_type', itemType);
  }

  const { data: listingsData, error: listingsError } = await query;
  const feedItems = listingsData?.map(mapListingRow) ?? [];
  const isSignedIn = Boolean(sessionData.session?.user);

  return (
    <main className="min-h-screen bg-cream text-ink">
      <SiteHeader
        actionHref={isSignedIn ? '/post' : '/'}
        actionLabel={isSignedIn ? 'Post an item' : 'Join free'}
        showMyListings={isSignedIn}
      />

      <section className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink-3">
            Campus Feed
          </p>
          <h1 className="mt-4 font-serif text-5xl tracking-[-0.03em] md:text-6xl">
            Browse <span className="italic text-ink-3">live listings</span>
          </h1>
          <p className="mt-4 text-lg leading-8 text-ink-2">
            Filter by type and claim items while they are still available.
          </p>
        </div>

        <div className="mt-8">
          <FeedFilters activeFilter={activeFilter} />
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {feedItems.length > 0 ? (
            feedItems.map((item, index) => (
              <ListingCard key={item.id} item={item} priority={index < 3} />
            ))
          ) : (
            <div className="rounded-[1.75rem] border border-dashed border-stone-light bg-white p-10 text-center md:col-span-2 lg:col-span-3">
              <p className="text-lg font-medium text-ink">No listings found</p>
              <p className="mt-2 text-sm text-ink-3">
                {listingsError
                  ? 'Unable to load listings right now.'
                  : itemType
                    ? `No ${itemType.toLowerCase()} listings are live yet.`
                    : 'Be the first student to post an item.'}
              </p>
              {isSignedIn ? (
                <a
                  href="/post"
                  className="mt-6 inline-flex rounded-xl bg-ink px-6 py-3 text-sm font-medium text-cream transition hover:bg-ink-2"
                >
                  Post an item
                </a>
              ) : null}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
