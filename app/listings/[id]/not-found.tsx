import { SiteHeader } from '@/components/site-header';

export default function ListingNotFound() {
  return (
    <main className="min-h-screen bg-cream text-ink">
      <SiteHeader />

      <section className="mx-auto flex max-w-2xl flex-col items-center px-6 py-24 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-3">
          Not found
        </p>
        <h1 className="mt-4 font-serif text-4xl tracking-[-0.03em] text-ink">
          This listing is no longer available
        </h1>
        <p className="mt-4 text-base leading-8 text-ink-2">
          It may have been removed or the link is incorrect.
        </p>
        <a
          href="/#listings"
          className="mt-8 rounded-xl bg-ink px-6 py-3 text-sm font-medium text-cream transition hover:bg-ink-2"
        >
          Browse live listings
        </a>
      </section>
    </main>
  );
}
