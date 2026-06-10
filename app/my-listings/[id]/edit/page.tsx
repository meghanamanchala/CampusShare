import { notFound, redirect } from 'next/navigation';
import { EditListingForm } from '@/components/edit-listing-form';
import { SiteHeader } from '@/components/site-header';
import { LISTING_SELECT_FIELDS } from '@/lib/listings';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type EditListingPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditListingPage({ params }: EditListingPageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: sessionData } = await supabase.auth.getSession();

  if (!sessionData.session?.user) {
    redirect(`/my-listings`);
  }

  const { data: listing, error } = await supabase
    .from('listings')
    .select(LISTING_SELECT_FIELDS)
    .eq('id', id)
    .maybeSingle();

  if (error || !listing) {
    notFound();
  }

  if (listing.user_id !== sessionData.session.user.id) {
    notFound();
  }

  if (listing.status === 'removed') {
    redirect('/my-listings');
  }

  return (
    <main className="min-h-screen bg-cream text-ink">
      <SiteHeader
        backHref="/my-listings"
        backLabel="My listings"
        showMyListings
      />

      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-10 md:py-16">
        <EditListingForm
          listing={{
            id: listing.id,
            title: listing.title ?? '',
            ownerName: listing.owner_name ?? '',
            description: listing.description ?? '',
            itemType: listing.item_type ?? 'Free',
            price: listing.price ?? '',
            imageUrl: listing.image_url,
          }}
        />
      </section>
    </main>
  );
}
