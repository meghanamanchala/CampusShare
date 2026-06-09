export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
export const MAX_DESCRIPTION_LENGTH = 500;

const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

export function validateListingImage(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return 'Please upload a JPEG, PNG, WebP, or GIF image.';
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return 'Image must be smaller than 5 MB.';
  }

  return null;
}

export function formatListingDate(
  createdAt: string | null | undefined
): string {
  if (!createdAt) {
    return 'Just now';
  }

  const date = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins === 1 ? '' : 's'} ago`;
  if (diffHours < 24) return `${diffHours} hr${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;

  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

export function getListingInitials(title: string): string {
  const words = title.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return 'CS';
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}
