export type ListingStatus = 'available' | 'claimed' | 'removed';

export type CampusListing = {
  id: string;
  icon?: string;
  imageUrl?: string | null;
  description?: string | null;
  title: string;
  owner: string;
  time: string;
  tag: string;
  price: string;
  tagClassName: string;
  status: ListingStatus;
  claimedBy?: string | null;
  userId?: string | null;
};

export function getListingStatusLabel(status: ListingStatus): string {
  switch (status) {
    case 'claimed':
      return 'Claimed';

    case 'removed':
      return 'Removed';

    default:
      return 'Available';
  }
}

export function getListingStatusClassName(status: ListingStatus): string {
  switch (status) {
    case 'claimed':
      return 'bg-stone-light text-ink-2';

    case 'removed':
      return 'bg-red-50 text-red-700';

    default:
      return 'bg-green-light text-green';
  }
}

export function getListingTagClassName(
  itemType: string | null | undefined
) {
  switch ((itemType ?? '').toLowerCase()) {
    case 'for sale':
      return 'bg-[#f5f0e8] text-[#6b6859]';

    case 'borrow':
      return 'bg-[#eef2f7] text-[#3d6080]';

    default:
      return 'bg-[#eaf3de] text-[#2a5c3f]';
  }
}

export function getListingDisplayPrice(
  itemType: string | null | undefined,
  price: string | null | undefined
) {
  switch ((itemType ?? '').toLowerCase()) {
    case 'for sale':
      return price ? `₹${price}` : 'Open';

    case 'borrow':
      return 'Borrow';

    default:
      return 'Free';
  }
}
