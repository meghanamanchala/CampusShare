import { LISTING_TYPE_FILTERS } from '@/lib/listings';
import { cn } from '@/lib/utils';

type FeedFiltersProps = {
  activeFilter: string;
};

export function FeedFilters({ activeFilter }: FeedFiltersProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {LISTING_TYPE_FILTERS.map((filter) => {
        const isActive = activeFilter === filter.value;

        return (
          <a
            key={filter.value}
            href={
              filter.value === 'all'
                ? '/feed'
                : `/feed?type=${filter.value}`
            }
            className={cn(
              'whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition shrink-0',
              isActive
                ? 'bg-ink text-cream'
                : 'border border-stone bg-white text-ink-2 hover:bg-stone-light'
            )}
          >
            {filter.label}
          </a>
        );
      })}
    </div>
  );
}