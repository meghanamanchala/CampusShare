export type CampusListing = {
  id: string;
  icon: string;
  title: string;
  owner: string;
  time: string;
  tag: string;
  price: string;
  tagClassName: string;
};

export const demoListings: CampusListing[] = [
  {
    id: 'demo-1',
    icon: 'BK',
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
    title: 'Lab coat, size M, borrowed for a week',
    owner: 'Dev T.',
    time: '2 hrs ago',
    tag: 'Borrow',
    price: 'Borrow',
    tagClassName: 'bg-[#eef2f7] text-[#3d6080]',
  },
];