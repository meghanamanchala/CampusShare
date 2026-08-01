'use client';

import { usePathname } from 'next/navigation';
import { SiteLogo } from '@/components/site-logo';
import SiteMobileMenu from '@/components/site-mobile-menu';
import { cn } from '@/lib/utils';

type SiteHeaderProps = {
  backHref?: string;
  backLabel?: string;
  actionHref?: string;
  actionLabel?: string;
  showMyListings?: boolean;
};

export function SiteHeader({
  actionHref,
  actionLabel,
  showMyListings = false,
}: SiteHeaderProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const navLinkClass = (href: string) =>
    cn(
      'rounded-xl px-3.5 py-2 text-sm font-medium transition duration-200',
      isActive(href)
        ? 'bg-stone-light/80 text-ink font-semibold'
        : 'text-ink-2 hover:bg-stone-light/50 hover:text-ink'
    );

  const defaultActionHref = actionHref ?? (showMyListings ? '/post' : '/auth/login');
  const defaultActionLabel = actionLabel ?? (showMyListings ? 'Post an item' : 'Sign In');

  return (
    <header className="sticky top-0 z-50 border-b border-stone-light/60 bg-cream/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <a href="/" className="transition hover:opacity-80">
          <SiteLogo />
        </a>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <SiteMobileMenu
            showMyListings={showMyListings}
            actionHref={defaultActionHref}
            actionLabel={defaultActionLabel}
          />
        </div>

        {/* Desktop Menu - Consistent Across All Pages */}
        <div className="hidden md:flex items-center gap-1">
          <a href="/feed" className={navLinkClass('/feed')}>
            Browse Feed
          </a>

          {showMyListings && (
            <>
              <a href="/my-listings" className={navLinkClass('/my-listings')}>
                My Listings
              </a>
              <a href="/messages" className={navLinkClass('/messages')}>
                Messages
              </a>
              <a href="/profile" className={navLinkClass('/profile')}>
                Profile
              </a>
            </>
          )}

          <a
            href={defaultActionHref}
            className="ml-2 rounded-xl bg-ink px-4 py-2 text-sm font-medium text-cream shadow-2xs transition hover:bg-ink-2"
          >
            {defaultActionLabel}
          </a>
        </div>
      </div>
    </header>
  );
}