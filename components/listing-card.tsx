import { ListingImage } from '@/components/listing-image';
import type { CampusListing } from '@/lib/campus-data';

type ListingCardProps = {
  item: CampusListing;
  priority?: boolean;
};

export function ListingCard({ item, priority = false }: ListingCardProps) {
  return (
    <a
      href={`/listings/${item.id}`}
      className="group block overflow-hidden rounded-[1.75rem] border border-stone-light bg-white shadow-sm transition hover:-translate-y-1 hover:border-stone hover:shadow-soft"
    >
      <ListingImage
        src={item.imageUrl}
        alt={item.title}
        title={item.title}
        priority={priority}
        className="aspect-[4/3] w-full"
        sizes="(max-width: 1024px) 100vw, 33vw"
      />

      <div className="p-5">
        <div
          className={`mb-3 inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${item.tagClassName}`}
        >
          {item.tag}
        </div>

        <h3 className="line-clamp-2 text-[1.05rem] font-medium leading-snug text-ink transition group-hover:text-accent">
          {item.title}
        </h3>

        {item.description ? (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-ink-3">
            {item.description}
          </p>
        ) : null}

        <div className="mt-4 flex items-center justify-between text-sm text-ink-3">
          <span>{item.owner}</span>
          <span>{item.time}</span>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-stone-light pt-4">
          <p className="font-serif text-2xl text-ink">{item.price}</p>
          <span className="rounded-xl bg-ink px-4 py-2 text-sm font-medium text-cream transition group-hover:bg-ink-2">
            View
          </span>
        </div>
      </div>
    </a>
  );
}

type ListingFeedRowProps = {
  item: CampusListing;
  faded?: boolean;
};

export function ListingFeedRow({ item, faded = false }: ListingFeedRowProps) {
  return (
    <a
      href={`/listings/${item.id}`}
      className={`group flex gap-3 rounded-xl p-3 transition hover:bg-cream ${faded ? 'opacity-70' : ''}`}
    >
      <ListingImage
        src={item.imageUrl}
        alt={item.title}
        title={item.title}
        className="h-14 w-14 shrink-0 rounded-2xl"
        sizes="56px"
      />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink group-hover:text-accent">
          {item.title}
        </p>
        <div className="mt-1 flex gap-3 text-xs text-ink-3">
          <span>{item.owner}</span>
          <span>{item.time}</span>
        </div>
        <div
          className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${item.tagClassName}`}
        >
          {item.tag}
        </div>
      </div>

      <div className="text-sm font-semibold text-ink">{item.price}</div>
    </a>
  );
}
