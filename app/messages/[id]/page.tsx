import { notFound, redirect } from 'next/navigation';
import { SiteHeader } from '@/components/site-header';
import { ChatWorkspace } from '@/components/chat-workspace';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type ConversationPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ConversationDetailPage({ params }: ConversationPageProps) {
  const { id: conversationId } = await params;
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch conversation record with listing details
  const { data: conv, error } = await supabase
    .from('conversations')
    .select(`
      id,
      listing_id,
      buyer_id,
      seller_id,
      listings (
        id,
        title,
        image_url,
        price,
        status,
        pickup_location,
        owner_name
      )
    `)
    .eq('id', conversationId)
    .maybeSingle();

  if (error || !conv) {
    notFound();
  }

  // Check user membership
  if (conv.buyer_id !== user.id && conv.seller_id !== user.id) {
    notFound();
  }

  // Fetch initial messages
  const { data: rawMessages } = await supabase
    .from('messages')
    .select('id, sender_id, content, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  // Resolve recipient profile name
  const otherUserId = conv.buyer_id === user.id ? conv.seller_id : conv.buyer_id;
  let otherPartyName = 'Campus Student';

  const listingObj: any = Array.isArray(conv.listings) ? conv.listings[0] : conv.listings;

  if (otherUserId) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', otherUserId)
      .maybeSingle();

    if (profile?.full_name) {
      otherPartyName = profile.full_name;
    } else if (listingObj?.owner_name && conv.buyer_id === user.id) {
      otherPartyName = listingObj.owner_name;
    }
  }

  const listingInfo = {
    id: listingObj?.id ?? conv.listing_id,
    title: listingObj?.title ?? 'Listing',
    imageUrl: listingObj?.image_url ?? null,
    price: listingObj?.price ?? null,
    status: listingObj?.status ?? 'available',
    pickupLocation: listingObj?.pickup_location ?? null,
  };

  return (
    <main className="min-h-screen bg-cream text-ink">
      <SiteHeader actionHref="/post" actionLabel="Post an item" showMyListings />

      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-6 md:py-10">
        <ChatWorkspace
          conversationId={conversationId}
          currentUserId={user.id}
          initialMessages={rawMessages || []}
          listing={listingInfo}
          otherPartyName={otherPartyName}
        />
      </section>
    </main>
  );
}
