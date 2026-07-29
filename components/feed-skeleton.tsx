export function FeedSkeleton() {
  return (
    <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-[1.25rem] sm:rounded-[1.75rem] border border-stone-light bg-white p-4 shadow-sm animate-pulse"
        >
          {/* Image Skeleton */}
          <div className="h-48 sm:h-56 w-full rounded-xl bg-stone-light/80" />

          {/* Details Skeleton */}
          <div className="mt-4 space-y-3">
            <div className="h-4 w-20 rounded-full bg-stone-light" />
            <div className="h-6 w-3/4 rounded-lg bg-stone-light" />
            <div className="h-4 w-1/2 rounded-lg bg-stone-light/60" />

            <div className="pt-3 border-t border-stone-light flex items-center justify-between">
              <div className="h-6 w-16 rounded-md bg-stone-light" />
              <div className="h-8 w-20 rounded-xl bg-stone-light" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
