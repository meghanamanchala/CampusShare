export type CampusListing = {
  id: string;
  icon?: string;
  imageUrl?: string | null;
  title: string;
  owner: string;
  time: string;
  tag: string;
  price: string;
  tagClassName: string;
};

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
      return price ? `Rs ${price}` : 'Open';

    case 'borrow':
      return 'Borrow';

    default:
      return 'Free';
  }
}

export const demoListings: CampusListing[] = [
  {
    id: 'demo-1',
    icon: 'BK',
    imageUrl: null,
    title: 'GATE ECE study notes, set of 8',
    owner: 'Ananya K.',
    time: '10 mins ago',
    tag: 'Free',
    price: 'Free',
    tagClassName: 'bg-[#eaf3de] text-[#2a5c3f]',
  },
  {
    id: 'demo-2',
    icon: 'CH',
    imageUrl: null,
    title: 'Study chair, good condition',
    owner: 'Rahul M.',
    time: '35 mins ago',
    tag: 'For sale',
    price: 'Rs 600',
    tagClassName: 'bg-[#f5f0e8] text-[#6b6859]',
  },
  {
    id: 'demo-3',
    icon: 'CL',
    imageUrl: null,
    title: 'Lab coat, size M, borrowed for a week',
    owner: 'Dev T.',
    time: '2 hrs ago',
    tag: 'Borrow',
    price: 'Borrow',
    tagClassName: 'bg-[#eef2f7] text-[#3d6080]',
  },
];