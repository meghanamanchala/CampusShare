import { ListingImage } from '@/components/listing-image';
import { ListingStatusBadge } from '@/components/listing-status-badge';
import type { CampusListing } from '@/lib/campus-data';
import { cn } from '@/lib/utils';

type ListingCardProps = {
  item: CampusListing;
  priority?: boolean;
};

export function ListingCard({ item, priority = false }: ListingCardProps) {
  const isClaimed = item.status === 'claimed';

  return (
    <a
      href={`/listings/${item.id}`}
      className={cn(
        'group block overflow-hidden rounded-[1.75rem] border border-stone-light bg-white shadow-sm transition hover:-translate-y-1 hover:border-stone hover:shadow-soft',
        isClaimed && 'opacity-85'
      )}
    >
      <div className="relative">
        <ListingImage
          src={item.imageUrl}
          alt={item.title}
          title={item.title}
          priority={priority}
          className="aspect-[4/3] w-full"
          sizes="(max-width: 1024px) 100vw, 33vw"
        />
        {isClaimed ? (
          <div className="absolute inset-0 bg-ink/20" />
        ) : null}
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <ListingStatusBadge status={item.status} />
        </div>
      </div>

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
          <span
            className={cn(
              'rounded-xl px-4 py-2 text-sm font-medium transition',
              isClaimed
                ? 'bg-stone-light text-ink-2'
                : 'bg-ink text-cream group-hover:bg-ink-2'
            )}
          >
            {isClaimed ? 'Claimed' : 'View'}
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
  const isClaimed = item.status === 'claimed';

  return (
    <a
      href={`/listings/${item.id}`}
      className={cn(
        'group flex gap-3 rounded-xl p-3 transition hover:bg-cream',
        (faded || isClaimed) && 'opacity-70'
      )}
    >
      <div className="relative shrink-0">
        <ListingImage
          src={item.imageUrl}
          alt={item.title}
          title={item.title}
          className="h-14 w-14 rounded-2xl"
          sizes="56px"
        />
        {isClaimed ? (
          <span className="absolute -right-1 -top-1 rounded-full bg-stone-light px-1.5 py-0.5 text-[9px] font-semibold uppercase text-ink-2">
            Claimed
          </span>
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink group-hover:text-accent">
          {item.title}
        </p>
        <div className="mt-1 flex gap-3 text-xs text-ink-3">
          <span>{item.owner}</span>
          <span>{item.time}</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <div
            className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${item.tagClassName}`}
          >
            {item.tag}
          </div>
          <ListingStatusBadge status={item.status} className="px-2.5 py-1 text-[10px]" />
        </div>
      </div>

      <div className="text-sm font-semibold text-ink">{item.price}</div>
    </a>
  );
}
