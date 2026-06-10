import {
  getListingDisplayPrice,
  getListingTagClassName,
  type CampusListing,
  type ListingStatus,
} from '@/lib/campus-data';
import { formatListingDate } from '@/lib/listing-utils';

export type ListingRow = {
  id: string;
  title: string | null;
  description?: string | null;
  owner_name: string | null;
  created_at: string | null;
  item_type: string | null;
  price: string | null;
  icon?: string | null;
  tag_class_name: string | null;
  image_url: string | null;
  status?: ListingStatus | null;
  claimed_by?: string | null;
  user_id?: string | null;
};
export const LISTING_SELECT_FIELDS =
'id,title,description,owner_name,created_at,item_type,price,icon,tag_class_name,image_url,status,claimed_by,user_id,condition,pickup_location,negotiable,borrow_duration,borrow_type,contact_method';
export const LISTING_TYPE_FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Free', value: 'free' },
  { label: 'For Sale', value: 'for-sale' },
  { label: 'Borrow', value: 'borrow' },
] as const;

export type ListingTypeFilter = (typeof LISTING_TYPE_FILTERS)[number]['value'];

export function itemTypeFromFilter(
  filter: string | undefined
): string | null {
  switch (filter) {
    case 'free':
      return 'Free';

    case 'for-sale':
      return 'For sale';

    case 'borrow':
      return 'Borrow';

    default:
      return null;
  }
}

export function mapListingRow(item: ListingRow): CampusListing {
  const status = (item.status ?? 'available') as ListingStatus;

  return {
    id: item.id,
    icon: item.icon ?? 'CS',
    imageUrl: item.image_url,
    description: item.description,
    title: item.title ?? 'Untitled listing',
    owner: item.owner_name ?? 'CampusShare user',
    time: formatListingDate(item.created_at),
    tag: item.item_type ?? 'New',
    price: getListingDisplayPrice(item.item_type, item.price),
    tagClassName:
      item.tag_class_name ?? getListingTagClassName(item.item_type),
    status,
    claimedBy: item.claimed_by,
    userId: item.user_id,
  };
}

export function isListingAvailable(listing: CampusListing): boolean {
  return listing.status === 'available';
}
