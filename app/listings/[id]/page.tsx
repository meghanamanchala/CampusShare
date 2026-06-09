import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, Tag, User } from 'lucide-react';
import { ClaimListingButton } from '@/components/claim-listing-button';
import { ListingImage } from '@/components/listing-image';
import { ListingStatusBadge } from '@/components/listing-status-badge';
import { MyListingActions } from '@/components/my-listing-actions';
import { SiteHeader } from '@/components/site-header';
import {
  getListingDisplayPrice,
  getListingTagClassName,
} from '@/lib/campus-data';
import { formatListingDate } from '@/lib/listing-utils';
import { LISTING_SELECT_FIELDS } from '@/lib/listings';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type ListingDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ListingDetailPage({
  params,
}: ListingDetailPageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: sessionData } = await supabase.auth.getSession();

  const { data: listing, error } = await supabase
    .from('listings')
    .select(LISTING_SELECT_FIELDS)
    .eq('id', id)
    .maybeSingle();

  if (error || !listing || listing.status === 'removed') {
    notFound();
  }

  const currentUserId = sessionData.session?.user.id ?? null;
  const isOwner = currentUserId === listing.user_id;
  const isSignedIn = Boolean(currentUserId);
  const status = listing.status ?? 'available';
  const tagClassName =
    listing.tag_class_name ?? getListingTagClassName(listing.item_type);
  const price = getListingDisplayPrice(listing.item_type, listing.price);
  const postedAt = formatListingDate(listing.created_at);

  return (
    <main className="min-h-screen bg-cream text-ink">
      <SiteHeader
        actionHref="/post"
        actionLabel="Post an item"
        showMyListings={isSignedIn}
      />

      <section className="mx-auto max-w-6xl px-6 py-10 md:py-14">
        <a
          href="/feed"
          className="mb-8 inline-flex items-center gap-2 text-sm text-ink-3 transition hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to listings
        </a>

        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="relative overflow-hidden rounded-[2rem] border border-stone-light bg-white shadow-soft">
            <ListingImage
              src={listing.image_url}
              alt={listing.title ?? 'Listing image'}
              title={listing.title ?? 'Listing'}
              priority
              className="aspect-[4/3] w-full md:aspect-[5/4]"
              sizes="(max-width: 1024px) 100vw, 60vw"
            />
            {status === 'claimed' ? (
              <div className="absolute inset-0 bg-ink/25" />
            ) : null}
          </div>

          <div className="rounded-[2rem] border border-stone-light bg-white p-8 shadow-soft md:p-10">
            <div className="flex flex-wrap items-center gap-2">
              <div
                className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${tagClassName}`}
              >
                {listing.item_type ?? 'Free'}
              </div>
              <ListingStatusBadge status={status} />
            </div>

            <h1 className="mt-5 font-serif text-4xl leading-tight tracking-[-0.03em] text-ink md:text-5xl">
              {listing.title}
            </h1>

            <p className="mt-4 font-serif text-3xl text-ink">{price}</p>

            {status === 'claimed' ? (
              <p className="mt-4 rounded-2xl bg-stone-light px-4 py-3 text-sm text-ink-2">
                This item has already been claimed and is no longer available.
              </p>
            ) : null}

            <div className="mt-8 space-y-4 border-y border-stone-light py-6">
              <div className="flex items-center gap-3 text-sm text-ink-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cream-dark">
                  <User className="h-4 w-4 text-ink-3" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-ink-3">
                    Posted by
                  </p>
                  <p className="font-medium text-ink">
                    {listing.owner_name ?? 'CampusShare user'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm text-ink-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cream-dark">
                  <Calendar className="h-4 w-4 text-ink-3" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-ink-3">
                    Posted
                  </p>
                  <p className="font-medium text-ink">{postedAt}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm text-ink-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cream-dark">
                  <Tag className="h-4 w-4 text-ink-3" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-ink-3">
                    Listing type
                  </p>
                  <p className="font-medium text-ink">
                    {listing.item_type ?? 'Free'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-ink-3">
                Description
              </h2>
              {listing.description ? (
                <p className="mt-3 whitespace-pre-wrap text-base leading-8 text-ink-2">
                  {listing.description}
                </p>
              ) : (
                <p className="mt-3 text-sm leading-7 text-ink-3">
                  No description provided. Message the poster for more details.
                </p>
              )}
            </div>

            <div className="mt-10 space-y-4">
              {isOwner ? (
                <div className="rounded-2xl border border-stone-light bg-cream-dark p-4">
                  <p className="text-sm font-medium text-ink">
                    You posted this item
                  </p>
                  <p className="mt-1 text-sm text-ink-3">
                    Edit details, mark it claimed, or remove it from the feed.
                  </p>
                  <div className="mt-4">
                    <MyListingActions listingId={listing.id} status={status} />
                  </div>
                </div>
              ) : status === 'available' ? (
                isSignedIn ? (
                  <ClaimListingButton listingId={listing.id} />
                ) : (
                  <div className="rounded-2xl border border-stone-light bg-cream-dark p-4">
                    <p className="text-sm text-ink-2">
                      Sign in with your campus email to claim this item.
                    </p>
                    <a
                      href="/post"
                      className="mt-4 inline-flex rounded-xl bg-ink px-6 py-3 text-sm font-medium text-cream transition hover:bg-ink-2"
                    >
                      Sign in to claim
                    </a>
                  </div>
                )
              ) : null}

              <a
                href="/feed"
                className="inline-flex rounded-xl border border-stone px-6 py-3 text-sm text-ink-2 transition hover:bg-stone-light"
              >
                Browse more
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
