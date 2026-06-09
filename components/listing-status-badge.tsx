import {
  getListingStatusClassName,
  getListingStatusLabel,
  type ListingStatus,
} from '@/lib/campus-data';
import { cn } from '@/lib/utils';

type ListingStatusBadgeProps = {
  status: ListingStatus;
  className?: string;
};

export function ListingStatusBadge({
  status,
  className,
}: ListingStatusBadgeProps) {
  if (status === 'available') {
    return null;
  }

  return (
    <span
      className={cn(
        'inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]',
        getListingStatusClassName(status),
        className
      )}
    >
      {getListingStatusLabel(status)}
    </span>
  );
}
