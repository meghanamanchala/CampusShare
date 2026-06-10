'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';

type Props = {
  primaryCtaHref: string;
  primaryCtaLabel: string;
};

export default function MobileMenu({
  primaryCtaHref,
  primaryCtaLabel,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="rounded-lg border border-stone-light p-2 md:hidden"
      >
        {open ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </button>

      {open && (
  <div className="absolute left-0 top-16 z-50 w-full animate-in slide-in-from-top-2 duration-200">
    <div className="mx-4 rounded-3xl border border-stone-light bg-cream shadow-soft">
      <nav className="flex flex-col p-4">
        <a
          href="#how-it-works"
          className="rounded-xl px-4 py-3 text-ink-2 hover:bg-stone-light"
          onClick={() => setOpen(false)}
        >
          How it works
        </a>

        <a
          href="/feed"
          className="rounded-xl px-4 py-3 text-ink-2 hover:bg-stone-light"
          onClick={() => setOpen(false)}
        >
          Browse
        </a>

        <a
          href="#features"
          className="rounded-xl px-4 py-3 text-ink-2 hover:bg-stone-light"
          onClick={() => setOpen(false)}
        >
          Features
        </a>

        <a
          href={primaryCtaHref}
          className="mt-3 rounded-xl bg-ink px-4 py-3 text-center text-sm font-medium text-cream"
          onClick={() => setOpen(false)}
        >
          {primaryCtaLabel}
        </a>
      </nav>
    </div>
  </div>
)}
    </>
  );
}