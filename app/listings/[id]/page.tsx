import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, Tag, User } from 'lucide-react';
import { ListingImage } from '@/components/listing-image';
import { SiteHeader } from '@/components/site-header';
import {
  getListingDisplayPrice,
  getListingTagClassName,
} from '@/lib/campus-data';
import { formatListingDate } from '@/lib/listing-utils';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type ListingDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ListingDetailPage({
  params,
}: ListingDetailPageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: listing, error } = await supabase
    .from('listings')
    .select(
      'id, title, description, owner_name, created_at, item_type, price, image_url, tag_class_name'
    )
    .eq('id', id)
    .maybeSingle();

  if (error || !listing) {
    notFound();
  }

  const tagClassName =
    listing.tag_class_name ?? getListingTagClassName(listing.item_type);
  const price = getListingDisplayPrice(listing.item_type, listing.price);
  const postedAt = formatListingDate(listing.created_at);

  return (
    <main className="min-h-screen bg-cream text-ink">
      <SiteHeader actionHref="/post" actionLabel="Post an item" />

      <section className="mx-auto max-w-6xl px-6 py-10 md:py-14">
        <a
          href="/#listings"
          className="mb-8 inline-flex items-center gap-2 text-sm text-ink-3 transition hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to listings
        </a>

        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="overflow-hidden rounded-[2rem] border border-stone-light bg-white shadow-soft">
            <ListingImage
              src={listing.image_url}
              alt={listing.title}
              title={listing.title}
              priority
              className="aspect-[4/3] w-full md:aspect-[5/4]"
              sizes="(max-width: 1024px) 100vw, 60vw"
            />
          </div>

          <div className="rounded-[2rem] border border-stone-light bg-white p-8 shadow-soft md:p-10">
            <div
              className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${tagClassName}`}
            >
              {listing.item_type ?? 'Free'}
            </div>

            <h1 className="mt-5 font-serif text-4xl leading-tight tracking-[-0.03em] text-ink md:text-5xl">
              {listing.title}
            </h1>

            <p className="mt-4 font-serif text-3xl text-ink">{price}</p>

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

            <div className="mt-10 flex flex-wrap gap-3">
              <button
                type="button"
                className="rounded-xl bg-ink px-6 py-3 text-sm font-medium text-cream transition hover:bg-ink-2"
              >
                Claim item
              </button>
              <a
                href="/#listings"
                className="rounded-xl border border-stone px-6 py-3 text-sm text-ink-2 transition hover:bg-stone-light"
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
