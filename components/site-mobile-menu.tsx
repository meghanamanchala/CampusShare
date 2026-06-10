'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';

type Props = {
  backHref?: string;
  backLabel?: string;
  actionHref?: string;
  actionLabel?: string;
  showMyListings?: boolean;
};

export default function SiteMobileMenu({
  backHref,
  backLabel,
  actionHref,
  actionLabel,
  showMyListings,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="rounded-lg border border-stone-light p-2"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open && (
        <div className="absolute left-0 top-16 z-50 w-full">
          <div className="mx-4 rounded-3xl border border-stone-light bg-white p-4 shadow-soft">
            <nav className="flex flex-col gap-2">
              {showMyListings && (
                <a
                  href="/my-listings"
                  className="rounded-xl px-4 py-3 hover:bg-stone-light"
                >
                  My Listings
                </a>
              )}

              <a
                href="/feed"
                className="rounded-xl px-4 py-3 hover:bg-stone-light"
              >
                Browse
              </a>

              {actionHref && actionLabel && (
                <a
                  href={actionHref}
                  className="rounded-xl bg-ink px-4 py-3 text-center text-cream"
                >
                  {actionLabel}
                </a>
              )}

              {backHref && (
                <a
                  href={backHref}
                  className="rounded-xl border border-stone px-4 py-3 text-center"
                >
                  {backLabel}
                </a>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}