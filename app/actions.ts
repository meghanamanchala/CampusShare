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

export async function createListingAction(
  _: ListingActionState,
  formData: FormData
): Promise<ListingActionState> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

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
    })
    .select('id')
    .single();

  if (error) {
    return {
      status: 'error',
      message: `Database error: ${error.message}`,
    };
  }

  revalidatePath('/');
  revalidatePath('/post');
  revalidatePath(`/listings/${listing.id}`);

  return {
    status: 'success',
    message: 'Your item has been posted successfully.',
    listingId: listing.id,
  };
}
