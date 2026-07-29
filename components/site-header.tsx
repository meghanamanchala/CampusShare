'use client';

import { usePathname } from 'next/navigation';
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
  backHref = '/',
  backLabel = 'Back',
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
      'rounded-xl px-4 py-2 text-sm font-medium transition duration-200',
      isActive(href)
        ? 'bg-ink text-cream shadow-sm'
        : 'text-ink-2 hover:bg-stone-light hover:text-ink'
    );

  return (
    <header className="sticky top-0 z-50 border-b border-stone-light/70 bg-cream/85 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <a
          href="/"
          className="flex items-center gap-2 sm:gap-3 font-bold text-lg sm:text-[1.35rem] tracking-tight text-ink transition hover:opacity-90"
        >
          <span className="relative flex h-3 w-3 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
          </span>
          <span>Campus<span className="font-serif italic text-ink-3">Share</span></span>
        </a>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <SiteMobileMenu
            showMyListings={showMyListings}
            backHref={backHref}
            backLabel={backLabel}
            actionHref={actionHref}
            actionLabel={actionLabel}
          />
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-2">
          <a href="/feed" className={navLinkClass('/feed')}>
            Browse Feed
          </a>

          {showMyListings && (
            <>
              <a href="/messages" className={navLinkClass('/messages')}>
                Messages
              </a>
              <a href="/my-listings" className={navLinkClass('/my-listings')}>
                My Listings
              </a>
              <a href="/profile" className={navLinkClass('/profile')}>
                Profile
              </a>
            </>
          )}

          {actionHref && actionLabel && (
            <a
              href={actionHref}
              className="ml-2 rounded-xl bg-ink px-5 py-2 text-sm font-medium text-cream transition hover:bg-ink-2 shadow-sm"
            >
              {actionLabel}
            </a>
          )}

          {backHref && backHref !== '/' && (
            <a
              href={backHref}
              className="rounded-xl border border-stone px-4 py-2 text-sm text-ink-2 transition hover:bg-stone-light"
            >
              {backLabel}
            </a>
          )}
        </div>
      </div>
    </header>
  );
}