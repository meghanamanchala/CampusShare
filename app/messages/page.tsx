import { redirect } from 'next/navigation';
import { SiteHeader } from '@/components/site-header';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { MessageSquare, Clock, ArrowRight } from 'lucide-react';
import { ListingImage } from '@/components/listing-image';
import { formatListingDate } from '@/lib/listing-utils';

export default async function MessagesInboxPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch conversations where user is buyer or seller
  const { data: rawConvs } = await supabase
    .from('conversations')
    .select(`
      id,
      listing_id,
      buyer_id,
      seller_id,
      updated_at,
      created_at,
      listings (
        id,
        title,
        image_url,
        status,
        owner_name
      )
    `)
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order('updated_at', { ascending: false });

  // Fetch participant profiles & last messages
  const conversations = await Promise.all(
    (rawConvs || []).map(async (conv: any) => {
      const otherUserId = conv.buyer_id === user.id ? conv.seller_id : conv.buyer_id;
      const listingObj: any = Array.isArray(conv.listings) ? conv.listings[0] : conv.listings;

      // Fetch recipient profile name
      let otherPartyName = 'Campus Student';
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

      // Fetch latest message
      const { data: latestMsg } = await supabase
        .from('messages')
        .select('content, created_at, sender_id')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      return {
        id: conv.id,
        listingTitle: listingObj?.title ?? 'Listing',
        listingImage: listingObj?.image_url ?? null,
        listingStatus: listingObj?.status ?? 'available',
        otherPartyName,
        lastMessage: latestMsg?.content ?? 'Conversation started',
        lastMessageTime: latestMsg?.created_at
          ? formatListingDate(latestMsg.created_at)
          : formatListingDate(conv.updated_at || conv.created_at),
        isSeller: conv.seller_id === user.id,
      };
    })
  );

  return (
    <main className="min-h-screen bg-cream text-ink">
      <SiteHeader actionHref="/post" actionLabel="Post an item" showMyListings />

      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-10 md:py-14">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink-3">
            Messages & Pickups
          </p>
          <h1 className="mt-2 font-bold text-3xl sm:text-4xl md:text-5xl tracking-[-0.03em]">
            Your <span className="italic text-ink-3">conversations</span>
          </h1>
          <p className="mt-3 text-base text-ink-2">
            Coordinate pickups, ask questions, and arrange trades safely with campus peers.
          </p>
        </div>

        <div className="mt-8">
          {conversations.length > 0 ? (
            <div className="grid gap-4">
              {conversations.map((conv) => (
                <a
                  key={conv.id}
                  href={`/messages/${conv.id}`}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-stone-light bg-white p-5 shadow-soft hover:border-ink/40 transition"
                >
                  <div className="flex items-start gap-4">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-stone-light border border-stone">
                      <ListingImage
                        src={conv.listingImage}
                        alt={conv.listingTitle}
                        title={conv.listingTitle}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-ink-3">
                          {conv.isSeller ? 'Buyer:' : 'Seller:'} {conv.otherPartyName}
                        </span>
                        {conv.listingStatus === 'claimed' && (
                          <span className="rounded-full bg-stone-light px-2 py-0.5 text-[10px] font-semibold uppercase text-ink-2">
                            Claimed
                          </span>
                        )}
                      </div>

                      <h2 className="font-semibold text-lg text-ink group-hover:text-ink-2 transition">
                        {conv.listingTitle}
                      </h2>

                      <p className="mt-1 text-sm text-ink-2 line-clamp-1">
                        {conv.lastMessage}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-light">
                    <span className="flex items-center gap-1 text-xs text-ink-3 shrink-0">
                      <Clock className="h-3.5 w-3.5" />
                      {conv.lastMessageTime}
                    </span>

                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cream-dark group-hover:bg-ink group-hover:text-cream transition">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-dashed border-stone bg-white p-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cream-dark">
                <MessageSquare className="h-6 w-6 text-ink-3" />
              </div>
              <h2 className="mt-4 font-bold text-xl text-ink">No messages yet</h2>
              <p className="mt-2 text-sm text-ink-3 max-w-sm mx-auto">
                Message a seller on any listing or post an item to start receiving messages from buyers.
              </p>
              <a
                href="/feed"
                className="mt-6 inline-flex rounded-xl bg-ink px-6 py-3 text-sm font-medium text-cream transition hover:bg-ink-2"
              >
                Browse Listings
              </a>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
