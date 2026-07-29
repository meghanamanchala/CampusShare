'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState, useTransition } from 'react';
import { Search, X, SlidersHorizontal, ArrowUpDown, RotateCcw } from 'lucide-react';
import { LISTING_TYPE_FILTERS, SORT_OPTIONS } from '@/lib/listings';
import { cn } from '@/lib/utils';

type FeedFiltersProps = {
  activeFilter?: string;
  searchQuery?: string;
  statusFilter?: string;
  sortOption?: string;
};

export function FeedFilters({
  activeFilter = 'all',
  searchQuery = '',
  statusFilter = 'all',
  sortOption = 'newest',
}: FeedFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchTerm, setSearchTerm] = useState(searchQuery);

  const createQueryString = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '' || value === 'all' || (key === 'sort' && value === 'newest')) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      return params.toString();
    },
    [searchParams]
  );

  const handleUpdateFilter = (updates: Record<string, string | null>) => {
    const queryString = createQueryString(updates);
    const url = queryString ? `${pathname}?${queryString}` : pathname;
    startTransition(() => {
      router.push(url as any);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleUpdateFilter({ q: searchTerm.trim() || null });
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    handleUpdateFilter({ q: null });
  };

  const handleClearAll = () => {
    setSearchTerm('');
    startTransition(() => {
      router.push(pathname as any);
    });
  };

  const hasActiveFilters =
    Boolean(searchQuery) ||
    activeFilter !== 'all' ||
    statusFilter !== 'all' ||
    sortOption !== 'newest';

  return (
    <div className="space-y-4">
      {/* Top Bar: Search Input & Dropdowns */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search listings, notes, chairs, pickup location..."
            className="w-full rounded-2xl border border-stone bg-white pl-10 pr-10 py-3 text-sm placeholder:text-ink-3/60 focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink transition"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-ink-3 hover:text-ink transition rounded-full hover:bg-stone-light"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </form>

        {/* Filters Controls */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {/* Status Filter Toggle */}
          <button
            type="button"
            onClick={() =>
              handleUpdateFilter({
                status: statusFilter === 'available' ? 'all' : 'available',
              })
            }
            className={cn(
              'inline-flex items-center gap-1.5 whitespace-nowrap rounded-2xl px-4 py-3 text-xs font-semibold uppercase tracking-wider transition border',
              statusFilter === 'available'
                ? 'bg-green-light border-green/30 text-green-700'
                : 'bg-white border-stone text-ink-2 hover:bg-stone-light'
            )}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {statusFilter === 'available' ? 'Available Only' : 'All Statuses'}
          </button>

          {/* Sort Selector */}
          <div className="relative inline-flex items-center">
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-3 pointer-events-none" />
            <select
              value={sortOption}
              onChange={(e) => handleUpdateFilter({ sort: e.target.value })}
              className="rounded-2xl border border-stone bg-white pl-8 pr-8 py-3 text-xs font-semibold uppercase tracking-wider text-ink-2 focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink transition cursor-pointer appearance-none"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearAll}
              className="inline-flex items-center gap-1 whitespace-nowrap rounded-2xl border border-stone bg-white px-3 py-3 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
              title="Reset all filters"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Second Bar: Category Pills & Indicator */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex gap-2 shrink-0">
          {LISTING_TYPE_FILTERS.map((filter) => {
            const isActive = activeFilter === filter.value;

            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => handleUpdateFilter({ type: filter.value })}
                className={cn(
                  'whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide transition border',
                  isActive
                    ? 'bg-ink border-ink text-cream'
                    : 'border-stone bg-white text-ink-2 hover:bg-stone-light'
                )}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        {isPending && (
          <span className="text-xs text-ink-3 italic animate-pulse shrink-0">
            Updating results...
          </span>
        )}
      </div>
    </div>
  );
}