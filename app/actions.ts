'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export type ListingActionState = {
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

export async function createListingAction(_: ListingActionState, formData: FormData): Promise<ListingActionState> {
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;

  if (!user) {
    return {
      status: 'error',
      message: 'Sign in with your campus email before posting a listing.',
    };
  }

  const title = String(formData.get('title') ?? '').trim();
  const ownerName = String(formData.get('ownerName') ?? '').trim();
  const itemType = String(formData.get('itemType') ?? 'Free').trim();
  const priceValue = String(formData.get('price') ?? '').trim();
  const icon = String(formData.get('icon') ?? 'CS').trim().slice(0, 3).toUpperCase() || 'CS';

  if (!title || !ownerName) {
    return {
      status: 'error',
      message: 'Title and your name are required.',
    };
  }

  if (itemType === 'For sale' && !priceValue) {
    return {
      status: 'error',
      message: 'For sale listings need a price.',
    };
  }

  const { error } = await supabase.from('listings').insert({
    title,
    owner_name: ownerName,
    created_at: new Date().toISOString(),
    item_type: itemType,
    price: itemType === 'For sale' ? priceValue : null,
    icon,
    tag_class_name: getTagClassName(itemType),
    user_id: user.id,
  });

  if (error) {
    return {
      status: 'error',
      message: `Supabase insert failed: ${error.message}`,
    };
  }

  revalidatePath('/');

  return {
    status: 'success',
    message: 'Listing posted to Supabase and will appear in the feed.',
  };
}