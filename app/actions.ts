'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import {
  MAX_DESCRIPTION_LENGTH,
  validateListingImage,
} from '@/lib/listing-utils';

export type ListingActionState = {
  status: 'idle' | 'success' | 'error';
  message: string;
  listingId?: string;
};

export type SimpleActionState = {
  status: 'idle' | 'success' | 'error';
  message: string;
};

function getTagClassName(itemType: string) {
  switch (itemType) {
    case 'For sale':
      return 'bg-[#f5f0e8] text-[#6b6859]';

    case 'Borrow':
      return 'bg-[#eef2f7] text-[#3d6080]';

    default:
      return 'bg-[#eaf3de] text-[#2a5c3f]';
  }
}

function revalidateListingPaths(listingId?: string) {
  revalidatePath('/');
  revalidatePath('/feed');
  revalidatePath('/post');
  revalidatePath('/my-listings');

  if (listingId) {
    revalidatePath(`/listings/${listingId}`);
    revalidatePath(`/my-listings/${listingId}/edit`);
  }
}

async function getAuthenticatedUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, user };
}

async function getOwnedListing(listingId: string) {
  const { supabase, user } = await getAuthenticatedUser();

  if (!user) {
    return {
      supabase,
      user: null,
      listing: null,
      error: 'Sign in to manage this listing.',
    };
  }

  const { data: listing, error } = await supabase
    .from('listings')
    .select('id, user_id, status')
    .eq('id', listingId)
    .maybeSingle();

  if (error || !listing) {
    return {
      supabase,
      user,
      listing: null,
      error: 'Listing not found.',
    };
  }

  if (listing.user_id !== user.id) {
    return {
      supabase,
      user,
      listing: null,
      error: 'You can only manage your own listings.',
    };
  }

  return { supabase, user, listing, error: null };
}

export async function createListingAction(
  _: ListingActionState,
  formData: FormData
): Promise<ListingActionState> {
  const { supabase, user } = await getAuthenticatedUser();

  if (!user) {
    return {
      status: 'error',
      message: 'Sign in with your campus email before posting a listing.',
    };
  }

  const title = String(formData.get('title') ?? '').trim();
  const ownerName = String(formData.get('ownerName') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const itemType = String(formData.get('itemType') ?? 'Free').trim();
  const priceValue = String(formData.get('price') ?? '').trim();
  const rawImageFiles = formData.getAll('images') as File[];
  const singleImageFile = formData.get('image') as File | null;
  const imageFiles = rawImageFiles.filter((f) => f && f.size > 0);
  if (imageFiles.length === 0 && singleImageFile && singleImageFile.size > 0) {
    imageFiles.push(singleImageFile);
  }

  const condition = String(formData.get('condition') ?? '');
  const pickupLocation = String(formData.get('pickupLocation') ?? '');
  const negotiable = formData.get('negotiable') === 'on';
  const borrowDuration = String(formData.get('borrowDuration') ?? '');
  const borrowType = String(formData.get('borrowType') ?? '');
  const contactMethod = String(formData.get('contactMethod') ?? 'email');

  if (!title || !ownerName) {
    return {
      status: 'error',
      message: 'Title and your name are required.',
    };
  }

  if (description.length > MAX_DESCRIPTION_LENGTH) {
    return {
      status: 'error',
      message: `Description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer.`,
    };
  }

  if (itemType === 'For sale' && !priceValue) {
    return {
      status: 'error',
      message: 'For Sale listings require a price.',
    };
  }

  const imageUrls: string[] = [];

  for (let i = 0; i < imageFiles.length; i++) {
    const file = imageFiles[i];
    const imageError = validateListingImage(file);

    if (imageError) {
      return {
        status: 'error',
        message: `Image ${i + 1}: ${imageError}`,
      };
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}-${i}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('listing-images')
      .upload(fileName, file);

    if (uploadError) {
      return {
        status: 'error',
        message: `Image upload failed: ${uploadError.message}`,
      };
    }

    const { data } = supabase.storage
      .from('listing-images')
      .getPublicUrl(fileName);

    if (data?.publicUrl) {
      imageUrls.push(data.publicUrl);
    }
  }

  const primaryImageUrl = imageUrls[0] ?? null;

  const { data: listing, error } = await supabase
    .from('listings')
    .insert({
      title,
      owner_name: ownerName,
      description: description || null,
      created_at: new Date().toISOString(),
      item_type: itemType,
      price: itemType === 'For sale' ? priceValue : null,
      image_url: primaryImageUrl,
      image_urls: imageUrls,
      tag_class_name: getTagClassName(itemType),
      user_id: user.id,
      status: 'available',
      condition,
      pickup_location: pickupLocation,
      negotiable,
      borrow_duration: borrowDuration,
      borrow_type: borrowType,
      contact_method: contactMethod,
    })
    .select('id')
    .single();

  if (error) {
    return {
      status: 'error',
      message: `Database error: ${error.message}`,
    };
  }

  revalidateListingPaths(listing.id);

  return {
    status: 'success',
    message: 'Your item has been posted successfully.',
    listingId: listing.id,
  };
}

export async function claimListingAction(
  listingId: string
): Promise<SimpleActionState> {
  const { supabase, user } = await getAuthenticatedUser();

  if (!user) {
    return {
      status: 'error',
      message: 'Sign in to claim this item.',
    };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.is_admin) {
    return {
      status: 'error',
      message: 'Administrator accounts cannot claim student items.',
    };
  }

  const { data: listing, error: fetchError } = await supabase
    .from('listings')
    .select('id, user_id, status')
    .eq('id', listingId)
    .maybeSingle();

  if (fetchError || !listing) {
    return {
      status: 'error',
      message: 'Listing not found.',
    };
  }

  if (listing.user_id === user.id) {
    return {
      status: 'error',
      message: 'You cannot claim your own listing.',
    };
  }

  if (listing.status !== 'available') {
    return {
      status: 'error',
      message: 'This item is no longer available.',
    };
  }

  const { error } = await supabase
    .from('listings')
    .update({
      status: 'claimed',
      claimed_by: user.id,
    })
    .eq('id', listingId)
    .eq('status', 'available');

  if (error) {
    return {
      status: 'error',
      message: `Could not claim item: ${error.message}`,
    };
  }

  revalidateListingPaths(listingId);

  return {
    status: 'success',
    message: 'Item claimed. Coordinate pickup with the poster.',
  };
}

export async function markListingClaimedAction(
  listingId: string
): Promise<SimpleActionState> {
  const { supabase, user, listing, error: ownershipError } =
    await getOwnedListing(listingId);

  if (ownershipError || !listing) {
    return {
      status: 'error',
      message: ownershipError ?? 'Listing not found.',
    };
  }

  if (listing.status === 'removed') {
    return {
      status: 'error',
      message: 'Removed listings cannot be updated.',
    };
  }

  if (listing.status === 'claimed') {
    return {
      status: 'success',
      message: 'This listing is already marked as claimed.',
    };
  }

  const { error } = await supabase
    .from('listings')
    .update({
      status: 'claimed',
    })
    .eq('id', listingId);

  if (error) {
    return {
      status: 'error',
      message: `Could not update listing: ${error.message}`,
    };
  }

  revalidateListingPaths(listingId);

  return {
    status: 'success',
    message: 'Listing marked as claimed.',
  };
}

export async function deleteListingAction(
  listingId: string
): Promise<SimpleActionState> {
  const { supabase, listing, error: ownershipError } =
    await getOwnedListing(listingId);

  if (ownershipError || !listing) {
    return {
      status: 'error',
      message: ownershipError ?? 'Listing not found.',
    };
  }

  const { error } = await supabase
    .from('listings')
    .update({ status: 'removed' })
    .eq('id', listingId);

  if (error) {
    return {
      status: 'error',
      message: `Could not remove listing: ${error.message}`,
    };
  }

  revalidateListingPaths(listingId);

  return {
    status: 'success',
    message: 'Listing removed.',
  };
}

export async function updateListingAction(
  _: ListingActionState,
  formData: FormData
): Promise<ListingActionState> {
  const condition = String(formData.get('condition') ?? '');
  const pickupLocation = String(formData.get('pickupLocation') ?? '');
  const negotiable = formData.get('negotiable') === 'on';
  const borrowDuration = String(formData.get('borrowDuration') ?? '');
  const borrowType = String(formData.get('borrowType') ?? '');
  const contactMethod = String(formData.get('contactMethod') ?? 'email');
  const listingId = String(formData.get('listingId') ?? '').trim();
  const { supabase, user, listing, error: ownershipError } =
    await getOwnedListing(listingId);

  if (ownershipError || !listing) {
    return {
      status: 'error',
      message: ownershipError ?? 'Listing not found.',
    };
  }

  if (listing.status === 'removed') {
    return {
      status: 'error',
      message: 'Removed listings cannot be edited.',
    };
  }

  const title = String(formData.get('title') ?? '').trim();
  const ownerName = String(formData.get('ownerName') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const itemType = String(formData.get('itemType') ?? 'Free').trim();
  const priceValue = String(formData.get('price') ?? '').trim();
  const imageFile = formData.get('image') as File | null;

  if (!title || !ownerName) {
    return {
      status: 'error',
      message: 'Title and your name are required.',
    };
  }

  if (description.length > MAX_DESCRIPTION_LENGTH) {
    return {
      status: 'error',
      message: `Description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer.`,
    };
  }

  if (itemType === 'For sale' && !priceValue) {
    return {
      status: 'error',
      message: 'For Sale listings require a price.',
    };
  }

  const { data: existingListing, error: existingError } = await supabase
    .from('listings')
    .select('image_url')
    .eq('id', listingId)
    .single();

  if (existingError || !existingListing) {
    return {
      status: 'error',
      message: 'Listing not found.',
    };
  }

  let imageUrl = existingListing.image_url;

  if (imageFile && imageFile.size > 0) {
    const imageError = validateListingImage(imageFile);

    if (imageError) {
      return {
        status: 'error',
        message: imageError,
      };
    }

    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${user!.id}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('listing-images')
      .upload(fileName, imageFile);

    if (uploadError) {
      return {
        status: 'error',
        message: `Image upload failed: ${uploadError.message}`,
      };
    }

    const { data } = supabase.storage
      .from('listing-images')
      .getPublicUrl(fileName);

    imageUrl = data.publicUrl;
  }

  const { error } = await supabase
    .from('listings')
    .update({
      title,
      owner_name: ownerName,
      description: description || null,
      item_type: itemType,
      price: itemType === 'For sale' ? priceValue : null,
      image_url: imageUrl,
      tag_class_name: getTagClassName(itemType),
      condition,
      pickup_location: pickupLocation,
      negotiable,
      borrow_duration: borrowDuration,
      borrow_type: borrowType,
      contact_method: contactMethod,
    })
    .eq('id', listingId);

  if (error) {
    return {
      status: 'error',
      message: `Database error: ${error.message}`,
    };
  }

  revalidateListingPaths(listingId);

  return {
    status: 'success',
    message: 'Listing updated successfully.',
    listingId,
  };
}

export async function updateProfileAction(
  _: SimpleActionState,
  formData: FormData
): Promise<SimpleActionState> {
  const { supabase, user } = await getAuthenticatedUser();

  if (!user) {
    return {
      status: 'error',
      message: 'Sign in to update your profile.',
    };
  }

  const fullName = String(formData.get('fullName') ?? '').trim();
  const phoneNumber = String(formData.get('phoneNumber') ?? '').trim();
  const bio = String(formData.get('bio') ?? '').trim();

  if (!fullName) {
    return {
      status: 'error',
      message: 'Full name is required.',
    };
  }

  let error;
  try {
    const { error: dbError } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        phone_number: phoneNumber || null,
        bio: bio || null,
      })
      .eq('id', user.id);
    
    error = dbError;

    if (dbError && (
      dbError.message?.includes('column') || 
      dbError.code === '42703'
    )) {
      console.warn('Optional columns phone_number/bio not found. Retrying with full_name only.');
      const { error: fallbackError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
        })
        .eq('id', user.id);
      
      error = fallbackError;
    }
  } catch (err: any) {
    error = err;
  }

  if (error) {
    return {
      status: 'error',
      message: `Failed to update profile: ${error.message}`,
    };
  }

  revalidatePath('/profile');
  revalidatePath('/feed');
  revalidatePath('/my-listings');

  return {
    status: 'success',
    message: 'Profile updated successfully.',
  };
}

export type ConversationItem = {
  id: string;
  listingId: string;
  listingTitle: string;
  listingImage: string | null;
  otherPartyName: string;
  lastMessage: string | null;
  lastMessageTime: string | null;
  updatedAt: string;
};

export type MessageItem = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  isMine: boolean;
};

export async function startConversationAction(
  listingId: string
): Promise<{ status: 'success' | 'error'; message: string; conversationId?: string }> {
  const { supabase, user } = await getAuthenticatedUser();

  if (!user) {
    return {
      status: 'error',
      message: 'Sign in to send messages.',
    };
  }

  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .select('id, user_id, title')
    .eq('id', listingId)
    .maybeSingle();

  if (listingError || !listing) {
    return {
      status: 'error',
      message: 'Listing not found.',
    };
  }

  if (listing.user_id === user.id) {
    return {
      status: 'error',
      message: 'You cannot start a conversation on your own listing.',
    };
  }

  const { data: existingConv } = await supabase
    .from('conversations')
    .select('id')
    .eq('listing_id', listingId)
    .eq('buyer_id', user.id)
    .maybeSingle();

  if (existingConv) {
    return {
      status: 'success',
      message: 'Conversation opened.',
      conversationId: existingConv.id,
    };
  }

  const { data: newConv, error: createError } = await supabase
    .from('conversations')
    .insert({
      listing_id: listingId,
      buyer_id: user.id,
      seller_id: listing.user_id,
      updated_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (createError) {
    return {
      status: 'error',
      message: `Could not start conversation: ${createError.message}`,
    };
  }

  return {
    status: 'success',
    message: 'Conversation started.',
    conversationId: newConv.id,
  };
}

export async function sendMessageAction(
  conversationId: string,
  content: string
): Promise<SimpleActionState> {
  const { supabase, user } = await getAuthenticatedUser();

  if (!user) {
    return {
      status: 'error',
      message: 'Sign in to send messages.',
    };
  }

  const trimmed = content.trim();
  if (!trimmed) {
    return {
      status: 'error',
      message: 'Message cannot be empty.',
    };
  }

  const { data: conv, error: convError } = await supabase
    .from('conversations')
    .select('id, buyer_id, seller_id')
    .eq('id', conversationId)
    .maybeSingle();

  if (convError || !conv || (conv.buyer_id !== user.id && conv.seller_id !== user.id)) {
    return {
      status: 'error',
      message: 'Conversation not found or access denied.',
    };
  }

  const now = new Date().toISOString();
  const { error: msgError } = await supabase.from('messages').insert({
    conversation_id: conversationId,
    sender_id: user.id,
    content: trimmed,
    created_at: now,
  });

  if (msgError) {
    return {
      status: 'error',
      message: `Failed to send message: ${msgError.message}`,
    };
  }

  await supabase
    .from('conversations')
    .update({ updated_at: now })
    .eq('id', conversationId);

  revalidatePath(`/messages/${conversationId}`);
  revalidatePath('/messages');

  return {
    status: 'success',
    message: 'Message sent.',
  };
}

export async function getAdminDashboardDataAction() {
  const { supabase, user } = await getAuthenticatedUser();

  if (!user) {
    return { error: 'Sign in to access admin dashboard.', users: [], campuses: [] };
  }

  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .maybeSingle();

  if (!adminProfile?.is_admin) {
    return { error: 'Access denied. Admin account required.', users: [], campuses: [] };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    '';

  const { createClient } = await import('@supabase/supabase-js');
  const adminClient = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: campusesData } = await adminClient.from('campuses').select('*');

  const [{ data: profilesData }, { data: verificationsData }] = await Promise.all([
    adminClient.from('profiles').select('*'),
    adminClient.from('user_verifications').select('*'),
  ]);

  let authUsers: any[] = [];
  try {
    const { data: listData } = await adminClient.auth.admin.listUsers();
    if (listData?.users) {
      authUsers = listData.users;
    }
  } catch (err) {
    console.warn('Could not list auth.users via admin API:', err);
  }

  const verificationsMap = (verificationsData || []).reduce((acc, v) => {
    acc[v.user_id] = v;
    return acc;
  }, {} as Record<string, any>);

  const profilesMap = (profilesData || []).reduce((acc, p) => {
    acc[p.id] = p;
    return acc;
  }, {} as Record<string, any>);

  const allUserIds = new Set<string>();
  authUsers.forEach((u) => allUserIds.add(u.id));
  (profilesData || []).forEach((p) => allUserIds.add(p.id));
  (verificationsData || []).forEach((v) => allUserIds.add(v.user_id));

  const allUsersList: any[] = [];
  const syncPromises: Promise<any>[] = [];

  for (const userId of Array.from(allUserIds)) {
    const authUser = authUsers.find((u) => u.id === userId);
    const profile = profilesMap[userId];
    const verification = verificationsMap[userId];

    const email =
      authUser?.email ||
      profile?.email ||
      verification?.email ||
      'student@campus.edu';
    const fullName =
      profile?.full_name ||
      authUser?.user_metadata?.full_name ||
      authUser?.user_metadata?.name ||
      email.split('@')[0];

    const isVerified = Boolean(
      profile?.is_verified ||
        verification?.status === 'approved' ||
        profile?.is_admin
    );

    const status = verification?.status ?? (isVerified ? 'approved' : 'pending');
    const createdAt =
      profile?.created_at ||
      authUser?.created_at ||
      verification?.created_at ||
      new Date().toISOString();

    allUsersList.push({
      id: verification?.id ?? userId,
      user_id: userId,
      email,
      status,
      created_at: createdAt,
      full_name: fullName,
      campus_name: verification?.campus_name || null,
    });

    if (!profile) {
      syncPromises.push(
        Promise.resolve(
          adminClient.from('profiles').upsert(
            {
              id: userId,
              email,
              full_name: fullName,
              is_verified: isVerified,
              is_admin: email.includes('admin'),
            },
            { onConflict: 'id' }
          )
        )
      );
    }

    if (!verification) {
      syncPromises.push(
        Promise.resolve(
          adminClient.from('user_verifications').upsert(
            {
              user_id: userId,
              email,
              status,
              verified_at: isVerified ? createdAt : null,
            },
            { onConflict: 'user_id' }
          )
        )
      );
    }
  }

  if (syncPromises.length > 0) {
    await Promise.allSettled(syncPromises);
  }

  return {
    error: null,
    users: allUsersList,
    campuses: campusesData || [],
  };
}

export type ClaimRequestItem = {
  id: string;
  listingId: string;
  requesterId: string;
  requesterName: string;
  ownerId: string;
  note?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  pickupCode: string;
  createdAt: string;
};

export async function requestClaimListingAction(
  listingId: string,
  note?: string
): Promise<{ status: 'success' | 'error'; message: string; code?: string }> {
  const { supabase, user } = await getAuthenticatedUser();

  if (!user) {
    return { status: 'error', message: 'Sign in to request this item.' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin, full_name')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.is_admin) {
    return { status: 'error', message: 'Admin accounts cannot claim student items.' };
  }

  const { data: listing } = await supabase
    .from('listings')
    .select('id, user_id, status, title')
    .eq('id', listingId)
    .maybeSingle();

  if (!listing || listing.status === 'removed') {
    return { status: 'error', message: 'Listing not found or no longer available.' };
  }

  if (listing.user_id === user.id) {
    return { status: 'error', message: 'You cannot request your own listing.' };
  }

  if (listing.status !== 'available') {
    return { status: 'error', message: 'This item is no longer available.' };
  }

  const pickupCode = Math.floor(1000 + Math.random() * 9000).toString();
  const requesterName = profile?.full_name || user.email?.split('@')[0] || 'Student';

  try {
    const { error: dbError } = await supabase.from('claim_requests').insert({
      listing_id: listingId,
      requester_id: user.id,
      requester_name: requesterName,
      owner_id: listing.user_id,
      note: note || null,
      status: 'pending',
      pickup_code: pickupCode,
      created_at: new Date().toISOString(),
    });

    if (dbError) {
      const { conversationId } = await startConversationAction(listingId);
      if (conversationId) {
        await sendMessageAction(
          conversationId,
          `[CLAIM_REQUEST] Submitted claim request for "${listing.title}".\nNote: ${
            note || 'Preferred pickup on campus'
          }\nHandoff Verification PIN: ${pickupCode}`
        );
      }
    }
  } catch {
    const { conversationId } = await startConversationAction(listingId);
    if (conversationId) {
      await sendMessageAction(
        conversationId,
        `[CLAIM_REQUEST] Submitted claim request for "${listing.title}".\nNote: ${
          note || 'Preferred pickup on campus'
        }\nHandoff Verification PIN: ${pickupCode}`
      );
    }
  }

  revalidateListingPaths(listingId);

  return {
    status: 'success',
    message: 'Claim request submitted! The owner will review your pickup proposal.',
    code: pickupCode,
  };
}

export async function getClaimRequestsAction(
  listingId: string
): Promise<{ status: 'success' | 'error'; requests: ClaimRequestItem[] }> {
  const { supabase, user } = await getAuthenticatedUser();
  if (!user) return { status: 'error', requests: [] };

  try {
    const { data: requests, error } = await supabase
      .from('claim_requests')
      .select('*')
      .eq('listing_id', listingId)
      .order('created_at', { ascending: false });

    if (!error && requests && requests.length > 0) {
      return {
        status: 'success',
        requests: requests.map((r) => ({
          id: r.id,
          listingId: r.listing_id,
          requesterId: r.requester_id,
          requesterName: r.requester_name || 'Student',
          ownerId: r.owner_id,
          note: r.note,
          status: r.status,
          pickupCode: r.pickup_code || '1234',
          createdAt: r.created_at,
        })),
      };
    }
  } catch {
    // Fallback
  }

  return { status: 'success', requests: [] };
}

export async function approveClaimRequestAction(
  requestId: string,
  listingId: string
): Promise<SimpleActionState> {
  const { supabase, listing, error: ownershipError } =
    await getOwnedListing(listingId);

  if (ownershipError || !listing) {
    return { status: 'error', message: ownershipError ?? 'Listing not found.' };
  }

  try {
    const { data: reqData } = await supabase
      .from('claim_requests')
      .select('requester_id')
      .eq('id', requestId)
      .maybeSingle();

    await supabase
      .from('claim_requests')
      .update({ status: 'approved' })
      .eq('id', requestId);

    await supabase
      .from('listings')
      .update({ status: 'claimed', claimed_by: reqData?.requester_id || null })
      .eq('id', listingId);
  } catch {
    await supabase
      .from('listings')
      .update({ status: 'claimed' })
      .eq('id', listingId);
  }

  revalidateListingPaths(listingId);

  return {
    status: 'success',
    message: 'Claim request approved! Listing marked as claimed.',
  };
}

export async function rejectClaimRequestAction(
  requestId: string,
  listingId: string
): Promise<SimpleActionState> {
  const { supabase, listing, error: ownershipError } =
    await getOwnedListing(listingId);

  if (ownershipError || !listing) {
    return { status: 'error', message: ownershipError ?? 'Listing not found.' };
  }

  try {
    await supabase
      .from('claim_requests')
      .update({ status: 'rejected' })
      .eq('id', requestId);
  } catch {
    // Fallback
  }

  revalidateListingPaths(listingId);

  return {
    status: 'success',
    message: 'Claim request declined.',
  };
}


