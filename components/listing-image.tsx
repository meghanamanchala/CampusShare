import Image from 'next/image';
import { getListingInitials } from '@/lib/listing-utils';
import { cn } from '@/lib/utils';

type ListingImageProps = {
  src?: string | null;
  alt: string;
  title: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  sizes?: string;
};

export function ListingImage({
  src,
  alt,
  title,
  className,
  imageClassName,
  priority = false,
  sizes = '(max-width: 768px) 100vw, 33vw',
}: ListingImageProps) {
  const initials = getListingInitials(title);

  if (!src) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-gradient-to-br from-stone-light via-cream-dark to-stone-light',
          className
        )}
      >
        <span className="font-serif text-4xl font-semibold tracking-tight text-ink-2/70 md:text-5xl">
          {initials}
        </span>
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden bg-stone-light', className)}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className={cn('object-cover transition duration-500 group-hover:scale-105', imageClassName)}
      />
    </div>
  );
}
