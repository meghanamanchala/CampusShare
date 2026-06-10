import SiteMobileMenu from '@/components/site-mobile-menu';
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
  return (
    <header className="sticky top-0 z-50 border-b border-stone-light/80 bg-cream/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <a
          href="/"
          className="flex items-center gap-2 sm:gap-3 font-bold text-lg sm:text-[1.35rem]"
        >
          <span className="h-2 w-2 rounded-full bg-accent" />
          CampusShare
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
        <div className="hidden md:flex items-center gap-3">
          {showMyListings && (
            <a
              href="/my-listings"
              className="rounded-xl px-4 py-2 text-sm text-ink-2 transition hover:bg-stone-light"
            >
              My Listings
            </a>
          )}

          <a
            href="/feed"
            className="rounded-xl px-4 py-2 text-sm text-ink-2 transition hover:bg-stone-light"
          >
            Browse
          </a>

          {actionHref && actionLabel && (
            <a
              href={actionHref}
              className="rounded-xl bg-ink px-5 py-2 text-sm font-medium text-cream transition hover:bg-ink-2"
            >
              {actionLabel}
            </a>
          )}

          <a
            href={backHref}
            className="rounded-xl border border-stone px-5 py-2 text-sm text-ink-2 transition hover:bg-stone-light"
          >
            {backLabel}
          </a>
        </div>
      </div>
    </header>
  );
}