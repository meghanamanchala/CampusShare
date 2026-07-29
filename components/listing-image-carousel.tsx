'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Package, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type ListingImageCarouselProps = {
  images?: (string | null | undefined)[];
  title: string;
  className?: string;
};

export function ListingImageCarousel({
  images = [],
  title,
  className,
}: ListingImageCarouselProps) {
  const validImages = images.filter((url): url is string => Boolean(url));
  const [activeIndex, setActiveIndex] = useState(0);
  const [fullscreenUrl, setFullscreenUrl] = useState<string | null>(null);

  if (validImages.length === 0) {
    return (
      <div
        className={cn(
          'flex h-[450px] w-full items-center justify-center bg-gradient-to-br from-stone-light via-cream-dark to-stone-light rounded-3xl border border-stone-light',
          className
        )}
      >
        <Package className="h-16 w-16 text-ink-3/60 stroke-[1.5]" />
      </div>
    );
  }

  const activeSrc = validImages[activeIndex] || validImages[0];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev === validImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* Main Image Viewport */}
      <div className="group relative h-[450px] sm:h-[550px] w-full overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] border border-stone-light bg-stone-light shadow-soft">
        <Image
          src={activeSrc}
          alt={`${title} - photo ${activeIndex + 1}`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="object-contain transition-all duration-300"
        />

        {/* Fullscreen view trigger */}
        <button
          type="button"
          onClick={() => setFullscreenUrl(activeSrc)}
          className="absolute right-3 top-3 rounded-full bg-ink/70 p-2 text-cream opacity-0 transition group-hover:opacity-100 hover:bg-ink"
          aria-label="View full size photo"
        >
          <Maximize2 className="h-4 w-4" />
        </button>

        {/* Photo Counter Badge */}
        {validImages.length > 1 && (
          <div className="absolute bottom-3 right-3 rounded-full bg-ink/80 px-3 py-1 text-xs font-semibold text-cream backdrop-blur-sm">
            {activeIndex + 1} / {validImages.length}
          </div>
        )}

        {/* Carousel Navigation Arrows */}
        {validImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-ink/70 p-2 text-cream backdrop-blur-sm transition hover:bg-ink"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-ink/70 p-2 text-cream backdrop-blur-sm transition hover:bg-ink"
              aria-label="Next photo"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Bar */}
      {validImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {validImages.map((src, index) => (
            <button
              key={`${src}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                'relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-xl border-2 transition',
                index === activeIndex
                  ? 'border-ink shadow-md scale-105'
                  : 'border-stone-light opacity-70 hover:opacity-100'
              )}
            >
              <Image
                src={src}
                alt={`Thumbnail ${index + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {fullscreenUrl && (
        <div
          onClick={() => setFullscreenUrl(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
        >
          <div className="relative h-full w-full max-w-5xl">
            <Image
              src={fullscreenUrl}
              alt={title}
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
