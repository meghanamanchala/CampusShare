import Image from 'next/image';
import { Package } from 'lucide-react';
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
  if (!src) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-gradient-to-br from-stone-light via-cream-dark to-stone-light',
          className
        )}
      >
        <Package className="h-12 w-12 text-ink-3/70 stroke-[1.5]" />
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
        className={cn(
  'transition duration-500 group-hover:scale-105',
  'motion-reduce:transform-none',
  imageClassName
)}
      />
    </div>
  );
}
