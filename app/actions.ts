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

  if (imageFile && imageFile.size > 0) {
    const imageError = validateListingImage(imageFile);

    if (imageError) {
      return {
        status: 'error',
        message: imageError,
      };
    }
  }

  let imageUrl: string | null = null;

  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;

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

  const { data: listing, error } = await supabase
    .from('listings')
    .insert({
      title,
      owner_name: ownerName,
      description: description || null,
      created_at: new Date().toISOString(),
      item_type: itemType,
      price: itemType === 'For sale' ? priceValue : null,
      image_url: imageUrl,
      tag_class_name: getTagClassName(itemType),
      user_id: user.id,
      status: 'available',
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
