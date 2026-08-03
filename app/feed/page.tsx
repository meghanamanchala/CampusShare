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
  searchParams: Promise<{
    type?: string;
    q?: string;
    status?: string;
    sort?: string;
  }>;
};

const SEARCH_SYNONYMS: Record<string, string[]> = {
  textbook: ['textbook', 'textbooks', 'book', 'books', 'notes', 'notebook', 'study', 'course', 'guide', 'material', 'syllabus'],
  textbooks: ['textbook', 'textbooks', 'book', 'books', 'notes', 'notebook', 'study', 'course', 'guide'],
  notes: ['notes', 'notebook', 'textbook', 'textbooks', 'book', 'books', 'study', 'lecture', 'material', 'pdf'],
  book: ['book', 'books', 'textbook', 'textbooks', 'notes', 'notebook', 'study', 'guide'],
  books: ['book', 'books', 'textbook', 'textbooks', 'notes', 'notebook', 'study', 'guide'],
  calculator: ['calculator', 'casio', 'calc', 'scientific', 'fx'],
  casio: ['casio', 'calculator', 'calc'],
  charger: ['charger', 'charging', 'adapter', 'power', 'cable'],
  mouse: ['mouse', 'mousepad', 'mouse pad'],
  chair: ['chair', 'seat', 'seating', 'stool', 'armchair'],
  table: ['table', 'desk', 'bench'],
  dorm: ['dorm', 'bed', 'lamp', 'pillow', 'shelf', 'furniture', 'mattress'],
  desk: ['desk', 'table', 'chair', 'furniture', 'dorm'],
  bike: ['bike', 'bicycle', 'cycle', 'scooter'],
  cycle: ['cycle', 'bike', 'bicycle', 'scooter'],
  scooter: ['scooter', 'bike', 'cycle'],
  sports: ['sports', 'fitness', 'gym', 'racket', 'ball', 'dumbbell', 'weights'],
  fitness: ['fitness', 'gym', 'sports', 'dumbbell', 'weights'],
  gym: ['gym', 'fitness', 'sports', 'dumbbell', 'weights'],
};

export default async function FeedPage({ searchParams }: FeedPageProps) {
  const { type, q, status, sort } = await searchParams;
  const activeFilter = type ?? 'all';
  const searchQuery = (q ?? '').trim();
  const statusFilter = status ?? 'all';
  const sortOption = sort ?? 'newest';
  const itemType = itemTypeFromFilter(type);

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase
    .from('listings')
    .select('*')
    .or('status.neq.removed,status.is.null');

  if (statusFilter === 'available') {
    query = query.or('status.eq.available,status.is.null');
  }

  if (itemType) {
    query = query.eq('item_type', itemType);
  }

  let rawTerms: string[] = [];
  if (searchQuery) {
    rawTerms = searchQuery
      .toLowerCase()
      .split(/[\s,|]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const expandedTermsSet = new Set<string>();
    rawTerms.forEach((term) => {
      expandedTermsSet.add(term);
      const synonyms = SEARCH_SYNONYMS[term];
      if (synonyms) {
        synonyms.forEach((syn) => expandedTermsSet.add(syn));
      }
    });

    const searchTerms = Array.from(expandedTermsSet);

    if (searchTerms.length > 0) {
      const orConditions = searchTerms.flatMap((term) => [
        `title.ilike.%${term}%`,
        `description.ilike.%${term}%`,
        `pickup_location.ilike.%${term}%`,
      ]);

      query = query.or(orConditions.join(','));
    }
  }

  if (sortOption === 'price-asc') {
    query = query.order('price', { ascending: true, nullsFirst: false });
  } else if (sortOption === 'price-desc') {
    query = query.order('price', { ascending: false, nullsFirst: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data: listingsData, error: listingsError } = await query;
  let feedItems = listingsData?.map(mapListingRow) ?? [];

  // Filter out tech/hardware items (e.g., chargers matching "Mac Book") when searching specifically for books/textbooks/notes
  if (rawTerms.length > 0) {
    const isBookSearch = rawTerms.some((t) =>
      ['textbook', 'textbooks', 'notes', 'book', 'books', 'study'].includes(t)
    );
    const isExplicitTechSearch = rawTerms.some((t) =>
      ['charger', 'laptop', 'macbook', 'phone', 'mouse', 'adapter', 'hardware'].includes(t)
    );

    if (isBookSearch && !isExplicitTechSearch) {
      feedItems = feedItems.filter((item) => {
        const titleLower = item.title.toLowerCase();
        const isTechItem =
          titleLower.includes('charger') ||
          titleLower.includes('mouse') ||
          titleLower.includes('laptop') ||
          titleLower.includes('adapter');
        return !isTechItem;
      });
    }
  }
  const isSignedIn = Boolean(user);

  return (
    <main className="min-h-screen bg-cream text-ink">
      <SiteHeader
        actionHref={isSignedIn ? '/post' : '/'}
        actionLabel={isSignedIn ? 'Post an item' : 'Join free'}
        showMyListings={isSignedIn}
      />

      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-10 md:py-16">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink-3">
            Campus Feed
          </p>
          <h1 className="mt-4 font-bold text-3xl sm:text-4xl md:text-6xl tracking-[-0.03em]">
            Browse <span className="text-ink-3">live listings</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg leading-7 sm:leading-8 text-ink-2">
            Search items, filter by category, and claim what you need on campus.
          </p>
        </div>

        <div className="mt-8">
          <FeedFilters
            activeFilter={activeFilter}
            searchQuery={searchQuery}
            statusFilter={statusFilter}
            sortOption={sortOption}
          />
        </div>

        <div className="mt-8 grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
          {feedItems.length > 0 ? (
            feedItems.map((item, index) => (
              <ListingCard key={item.id} item={item} priority={index < 3} />
            ))
          ) : (
            <div className="rounded-[1.5rem] sm:rounded-[1.75rem] border border-dashed border-stone-light bg-white p-6 sm:p-10 text-center md:col-span-2 lg:col-span-3">
              <p className="text-lg font-medium text-ink">No listings found</p>
              <p className="mt-2 text-sm text-ink-3">
                {listingsError
                  ? 'Unable to load listings right now.'
                  : searchQuery
                    ? `No items match "${searchQuery}". Try a different keyword.`
                    : itemType
                      ? `No ${itemType.toLowerCase()} listings are live yet.`
                      : 'Be the first student to post an item.'}
              </p>
              {isSignedIn ? (
                <a
                  href="/post"
                  className="mt-6 inline-flex w-full sm:w-auto justify-center rounded-xl bg-ink px-6 py-3 text-sm font-medium text-cream transition hover:bg-ink-2"
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
