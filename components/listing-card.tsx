import { CheckCircle } from 'lucide-react';
import { ListingImage } from '@/components/listing-image';
import { ListingStatusBadge } from '@/components/listing-status-badge';
import type { CampusListing } from '@/lib/campus-data';
import { cn } from '@/lib/utils';

type ListingCardProps = {
  item: CampusListing;
  priority?: boolean;
};

export function ListingCard({
  item,
  priority = false,
}: ListingCardProps) {
  const isClaimed = item.status === 'claimed';

  return (
    <a
      href={`/listings/${item.id}`}
      className={cn(
        'group relative block overflow-hidden rounded-[1.25rem] sm:rounded-[1.75rem] border border-stone-light/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-ink/20 hover:shadow-xl',
        isClaimed && 'opacity-85'
      )}
    >
      <div className="relative">
        <ListingImage
          src={item.imageUrl}
          alt={item.title}
          title={item.title}
          priority={priority}
          className="h-72 sm:h-80 w-full"
          imageClassName="object-contain bg-white transition duration-500 group-hover:scale-105"
          sizes="(max-width: 1024px) 100vw, 33vw"
        />

        {isClaimed && (
          <div className="absolute inset-0 bg-ink/20 backdrop-blur-[1px]" />
        )}

        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <ListingStatusBadge status={item.status} />
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <div
          className={`mb-3 inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${item.tagClassName}`}
        >
          {item.tag}
        </div>

        <h3 className="line-clamp-2 text-base sm:text-[1.05rem] font-medium leading-snug text-ink transition group-hover:text-accent">
          {item.title}
        </h3>

        {item.description && (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-ink-3">
            {item.description}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between gap-2 text-xs sm:text-sm text-ink-3">
          <span className="inline-flex items-center gap-1 font-medium text-ink-2" title="Verified Campus Student">
            {item.owner}
            <CheckCircle className="h-3.5 w-3.5 text-green-600 fill-green-100 shrink-0" />
          </span>
          <span>{item.time}</span>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-stone-light pt-4">
          <p className="text-xl sm:text-2xl font-bold text-ink">
            {item.price}
          </p>

          <span
            className={cn(
              'shrink-0 rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-wider transition duration-200',
              isClaimed
                ? 'bg-stone-light text-ink-2'
                : 'bg-ink text-cream group-hover:bg-ink-2 shadow-sm'
            )}
          >
            {isClaimed ? 'Claimed' : 'View Item'}
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

export function ListingFeedRow({
  item,
  faded = false,
}: ListingFeedRowProps) {
  const isClaimed = item.status === 'claimed';

  return (
    <a
      href={`/listings/${item.id}`}
      className={cn(
        'group flex gap-3 rounded-xl p-3 transition hover:bg-cream',
        faded && 'opacity-80'
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

        {isClaimed && (
          <span className="absolute -right-1 -top-1 rounded-full bg-stone-light px-1.5 py-0.5 text-[9px] font-semibold uppercase text-ink-2">
            Claimed
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink group-hover:text-accent">
          {item.title}
        </p>

        <div className="mt-1 flex flex-wrap gap-2 text-xs text-ink-3">
          <span>{item.owner}</span>
          <span>{item.time}</span>
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          <div
            className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${item.tagClassName}`}
          >
            {item.tag}
          </div>

          <ListingStatusBadge
            status={item.status}
            className="px-2.5 py-1 text-[10px]"
          />
        </div>
      </div>

      <div className="shrink-0 text-xs sm:text-sm font-semibold text-ink">
        {item.price}
      </div>
    </a>
  );
}