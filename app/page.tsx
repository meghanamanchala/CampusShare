import MobileMenu from '@/components/mobile-menu';
import { ListingCard, ListingFeedRow } from '@/components/listing-card';
import { SignupForm } from '@/components/signup-form';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { LISTING_SELECT_FIELDS, mapListingRow } from '@/lib/listings';

const stats = [
  { value: '2,400+', label: 'Active students' },
  { value: '12', label: 'Campuses' },
  { value: '8,100+', label: 'Items exchanged' },
  { value: '<4 min', label: 'Avg. claim time' },
];

const steps = [
  {
    title: 'Verify with your university email',
    description: 'Students sign up with a campus email so only verified peers can join the network.',
  },
  {
    title: 'Post in under a minute',
    description: 'Add a title, photo, category, and price or borrow tag. Your listing appears instantly.',
  },
  {
    title: 'Claim and coordinate quickly',
    description: 'Live updates keep listings current so items are claimed without confusion.',
  },
];

const features = [
  {
    title: 'Verified campus access',
    description: 'Only students with approved campus emails can join the network.',
  },
  {
    title: 'Instant updates',
    description: 'Listings and availability stay updated in real time.',
  },
  {
    title: 'Organized listings',
    description: 'Browse items by category, type, and availability.',
  },
  {
    title: 'Photo support',
    description: 'Upload images to help students quickly identify items.',
  },
];

const testimonials = [
  {
    name: 'Ananya Krishnan',
    role: '3rd year, CSE',
    quote: 'I cleared my room after finals without throwing anything away. The verified campus-only feed made it easy.',
  },
  {
    name: 'Rohan Mehta',
    role: '1st year, ME',
    quote: 'I bought used textbooks from seniors nearby and saved money immediately. The app feels focused and trusted.',
  },
  {
    name: 'Priya Sharma',
    role: '2nd year, Physics',
    quote: 'Borrowing a projector for one presentation was painless. No random chat groups, no friction.',
  },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-ink-3">{children}</p>;
}

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  const { data: sessionData } = await supabase.auth.getSession();
  const { data: listingsData, error: listingsError } = await supabase
    .from('listings')
    .select(LISTING_SELECT_FIELDS)
    .eq('status', 'available')
    .order('created_at', { ascending: false })
    .limit(6);

  const isSignedIn = Boolean(sessionData.session?.user);
  const primaryCtaLabel = isSignedIn ? 'Post an item' : 'Join free';
  const primaryCtaHref = isSignedIn ? '/post' : '#cta';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const authCallbackUrl = `${siteUrl.replace(/\/$/, '')}/auth/callback`;
  const feedItems = listingsData?.map(mapListingRow) ?? [];

  return (
    <main className="relative overflow-hidden bg-cream text-ink">
      <div className="absolute right-[-8rem] top-[-8rem] h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle,rgba(214,208,200,0.85)_0%,rgba(245,243,238,0)_70%)]" />

      <header className="sticky top-0 z-50 border-b border-stone-light/80 bg-cream/90 backdrop-blur-md">
  <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
    <a href="#top" className="flex items-center gap-3 font-bold text-xl">
      <span className="h-2 w-2 rounded-full bg-accent" />
      CampusShare
    </a>

    {/* Mobile Menu Button */}
    <MobileMenu
  primaryCtaHref={primaryCtaHref}
  primaryCtaLabel={primaryCtaLabel}
/>

    {/* Desktop Menu */}
    <nav className="hidden items-center gap-2 md:flex">
      <a
        href="#how-it-works"
        className="rounded-xl px-4 py-2 text-sm text-ink-2 transition hover:bg-stone-light"
      >
        How it works
      </a>

      <a
        href="/feed"
        className="rounded-xl px-4 py-2 text-sm text-ink-2 transition hover:bg-stone-light"
      >
        Browse
      </a>

      <a
        href="#features"
        className="rounded-xl px-4 py-2 text-sm text-ink-2 transition hover:bg-stone-light"
      >
        Features
      </a>

      <a
        href={primaryCtaHref}
        className="rounded-xl bg-ink px-5 py-2.5 text-sm font-medium text-cream"
      >
        {primaryCtaLabel}
      </a>
    </nav>
  </div>
</header>

      <section id="top" className="relative mx-auto max-w-6xl px-4 sm:px-6 pb-16 pt-16 md:pb-24 md:pt-28">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div>
            <div className="mb-6 flex items-center gap-3">
              <span className="rounded-full bg-green-light px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-green">
                Campus-only
              </span>
              <span className="h-px w-8 bg-stone" />
              <span className="text-sm text-ink-3">Verified students only</span>
            </div>
            <h1 className="max-w-xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-7xl">
              Your campus, <span className="italic text-ink-3">less stuff</span> going to waste.
            </h1>
            <p className="mt-6 max-w-xl text-lg font-light leading-8 text-ink-2">
              Give, borrow, buy, or claim items with verified students nearby. A simple way to share useful things within your campus community.            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <a href={primaryCtaHref} className="rounded-xl bg-ink px-7 py-3.5 text-sm font-medium text-cream shadow-soft transition hover:-translate-y-0.5 hover:bg-ink-2">
                {primaryCtaLabel}
              </a>
              <a href="#how-it-works" className="rounded-xl border border-stone px-6 py-3 text-sm text-ink-2 transition hover:bg-stone-light">
                See how it works
              </a>
            </div>

            <div className="mt-8 hidden md:flex items-center gap-3 text-sm text-ink-3">
              <div className="flex -space-x-2">
                {['AK', 'SM', 'PR', 'JL'].map((label) => (
                  <span key={label} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-cream bg-stone text-[11px] font-semibold text-ink-2">
                    {label}
                  </span>
                ))}
                <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-cream bg-green-light text-[11px] font-semibold text-green">
                  +
                </span>
              </div>
              <p>
                <span className="font-medium text-ink-2">2,400+ students</span> across 12 campuses are already sharing
              </p>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="overflow-hidden rounded-[2rem] border border-stone-light bg-white shadow-soft">
              <div className="flex items-center justify-between border-b border-stone-light px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-ink">Campus Feed</p>
                  <p className="text-xs text-ink-3">  Live listings from your campus</p>
                </div>
                <span className="rounded-full bg-green-light px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-green">
                  Live
                </span>
              </div>

              <div className="space-y-1 p-3">
                {feedItems.length > 0 ? (
                  feedItems.slice(0, 3).map((item, index) => (
                    <ListingFeedRow
                      key={item.id}
                      item={item}
                      faded={index === 2}
                    />
                  ))
                ) : (
                  <div className="rounded-[1.5rem] border border-dashed border-stone-light bg-cream px-5 py-8 text-center">
                    <p className="text-sm font-medium text-ink">No live listings yet</p>
                    <p className="mt-2 text-xs text-ink-3">
                      {listingsError
                        ? 'Unable to load listings right now.'
                        : 'No listings have been posted yet.'}                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="absolute -bottom-5 -left-4 rounded-2xl border border-stone-light bg-white px-4 py-3 shadow-soft">
              <p className="text-sm font-medium text-ink">Item claimed</p>
              <p className="text-xs text-ink-3">Someone nearby just claimed an item</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-stone-light bg-cream-dark py-10">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 sm:px-6 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-bold text-3xl sm:text-4xl leading-none text-ink">{stat.value}</p>
              <p className="mt-2 text-sm text-ink-3">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="post" className="mx-auto max-w-6xl px-4 sm:px-6 py-24">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div className="max-w-xl">
            <SectionLabel>Post</SectionLabel>
            <h2 className="font-bold text-4xl tracking-[-0.03em] md:text-6xl">
              Post from a dedicated <span className="italic text-ink-3">listing page</span>
            </h2>
            <p className="mt-4 text-lg font-light leading-8 text-ink-2">
              Keep browsing and posting separate. Open the posting page to quickly create and manage listings.            </p>
            <div className="mt-8 rounded-[1.5rem] border border-stone-light bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-ink">Dedicated posting flow</p>
              <p className="mt-2 text-sm leading-7 text-ink-2">
                A dedicated page makes posting faster, cleaner, and easier to manage.              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="/post" className="rounded-xl bg-ink px-6 py-3 text-sm font-medium text-cream transition hover:bg-ink-2">
                Open post page
              </a>
              <a href="/feed" className="rounded-xl border border-stone px-6 py-3 text-sm text-ink-2 transition hover:bg-stone-light">
                Browse live listings
              </a>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-stone-light bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-ink">What lives on the post page</p>
            <div className="mt-5 space-y-3 text-sm text-ink-2">
              <div className="rounded-2xl bg-cream/60 px-4 py-3">Item title, type, icon, and pricing fields</div>
              <div className="rounded-2xl bg-cream/60 px-4 py-3">Secure posting tied to your account</div>
              <div className="rounded-2xl bg-cream/60 px-4 py-3">Success and error states after publishing</div>
              <div className="rounded-2xl bg-cream/60 px-4 py-3">Automatic home feed refresh after submit</div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-6xl px-4 sm:px-6 py-24">
        <div className="max-w-2xl">
          <SectionLabel>Process</SectionLabel>
          <h2 className="font-bold text-4xl tracking-[-0.03em] md:text-6xl">
            How CampusShare <span className="italic text-ink-3">actually works</span>
          </h2>
          <p className="mt-4 text-lg font-light leading-8 text-ink-2">
            Three steps, no friction. Exchange campus items with people you can actually trust.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, index) => (
            <article key={step.title} className="rounded-[1.75rem] border border-stone-light bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
              <p className="font-bold text-5xl leading-none text-stone">0{index + 1}</p>
              <div className="mt-5 flex h-11 w-11 items-center justify-center rounded-xl border border-stone-light bg-cream text-lg">
                {index === 0 ? 'V' : index === 1 ? 'P' : 'C'}
              </div>
              <h3 className="mt-4 text-xl font-semibold text-ink">{step.title}</h3>
              <p className="mt-3 text-sm leading-7 text-ink-2">{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="listings" className="bg-cream-dark py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionLabel>Browse</SectionLabel>
          <div className="max-w-2xl">
            <h2 className="font-bold text-4xl tracking-[-0.03em] md:text-6xl">
              What is on campus <span className="italic text-ink-3">right now</span>
            </h2>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {feedItems.length > 0 ? (
              feedItems.map((item, index) => (
                <ListingCard key={item.id} item={item} priority={index < 3} />
              ))
            ) : (
              <div className="rounded-[1.75rem] border border-dashed border-stone-light bg-white p-10 text-center lg:col-span-3">
                <p className="text-lg font-medium text-ink">No live listings yet</p>
                <p className="mt-2 text-sm text-ink-3">
                  Be the first student to post an item!
                </p>
              </div>
            )}
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href="/feed"
              className="rounded-xl bg-ink px-6 py-3 text-sm font-medium text-cream transition hover:bg-ink-2"
            >
              View all listings
            </a>
            {isSignedIn ? (
              <a
                href="/my-listings"
                className="rounded-xl border border-stone px-6 py-3 text-sm text-ink-2 transition hover:bg-stone-light"
              >
                My listings
              </a>
            ) : null}
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-4 sm:px-6 py-24">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <SectionLabel>Features</SectionLabel>
            <h2 className="max-w-xl font-bold text-4xl tracking-[-0.03em] md:text-6xl">
              Built for the <span className="italic text-ink-3">campus reality</span>
            </h2>
            <p className="mt-4 max-w-2xl text-lg font-light leading-8 text-ink-2">
              Every feature is designed around how students actually live and share.
            </p>

            <div className="mt-10 space-y-4">
              {features.map((feature, index) => (
                <div key={feature.title} className="flex flex-col sm:flex-row gap-4 rounded-2xl border border-transparent p-5 transition hover:border-stone-light hover:bg-white hover:shadow-sm">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-stone-light bg-cream-dark font-semibold text-ink-2">
                    {index === 0 ? 'S' : index === 1 ? 'R' : index === 2 ? 'D' : 'F'}
                  </div>
                  <div>
                    <h3 className="font-medium text-ink">{feature.title}</h3>
                    <p className="mt-1 text-sm leading-7 text-ink-2">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-stone-light bg-white p-5 sm:p-7 shadow-soft">
            <div className="mb-5 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-stone" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#fac75a]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#a3d98e]" />
            </div>
            <div className="rounded-[1.5rem] bg-cream p-6">
              <p className="text-sm font-medium text-ink-2">Verified campus community</p>
              <div className="mt-5 space-y-3">
                <div className="rounded-2xl border border-stone-light bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-ink-3">University email</p>
                  <p className="mt-1 text-sm font-medium text-ink">student@campus.edu</p>
                </div>
                <div className="rounded-2xl border border-stone-light bg-green-light p-4">
                  <p className="text-sm font-medium text-green">Enrollment verified</p>
                  <p className="mt-1 text-xs text-green">  Your campus email confirms your student account.
                  </p>
                </div>
                <div className="rounded-2xl border border-stone-light bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-ink-3">Realtime status</p>
                  <p className="mt-1 text-sm font-medium text-ink">Claimed items update instantly across the feed.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-ink py-24 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionLabel>What students say</SectionLabel>
          <h2 className="max-w-2xl font-bold text-4xl tracking-[-0.03em] md:text-6xl">
            Real stories from <span className="italic text-white/45">real campuses</span>
          </h2>

          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <figure key={testimonial.name} className="rounded-[1.5rem] sm:rounded-[1.75rem] border border-white/10 bg-white/5 p-5 sm:p-7">
                <p className="mb-5 text-sm leading-7 text-white/75">{testimonial.quote}</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white">
                    {testimonial.name
                      .split(' ')
                      .map((part) => part[0])
                      .join('')}
                  </div>
                  <div>
                    <figcaption className="text-sm font-medium text-white">{testimonial.name}</figcaption>
                    <p className="text-xs text-white/45">{testimonial.role}</p>
                  </div>
                </div>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section id="cta" className="mx-auto max-w-3xl px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-green-light px-5 py-2 text-sm font-medium text-green">
          <span className="h-1.5 w-1.5 rounded-full bg-green" />
          {isSignedIn ? 'Ready to post' : 'Open for early access'}
        </div>
        <h2 className="mt-6 font-bold text-4xl tracking-[-0.03em] md:text-6xl">
          {isSignedIn ? (
            <>
              You’re in on <span className="italic text-ink-3">your campus</span>
            </>
          ) : (
            <>
              Start sharing on <span className="italic text-ink-3">your campus</span>
            </>
          )}
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg font-light leading-8 text-ink-2">
          {isSignedIn
            ? 'Your account is confirmed. Post your first item now and it will appear in the live campus feed.'
            : 'Join students already reducing waste, saving money, and helping their campus community.'}
        </p>

        {isSignedIn ? (
          <div className="mt-8 rounded-[1.75rem] border border-stone-light bg-white p-8 text-left shadow-sm">
            <p className="text-sm font-medium text-ink">Signed in and ready to publish</p>
            <p className="mt-2 text-sm leading-7 text-ink-2">
              The signup step is complete. Open the dedicated posting page and add a listing to the live feed.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-start text-center sm:justify-start">
              <a href="/post" className="rounded-xl bg-ink px-5 py-3 text-sm font-medium text-cream transition hover:bg-ink-2">
                Post an item
              </a>
              <a href="/feed" className="rounded-xl border border-stone px-5 py-3 text-sm text-ink-2 transition hover:bg-stone-light">
                Browse live listings
              </a>
            </div>
          </div>
        ) : (
          <SignupForm redirectTo={authCallbackUrl} />
        )}
      </section>

      <footer className="border-t border-stone-light bg-cream-dark py-14">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <a href="#top" className="flex items-center gap-3 font-bold text-[1.35rem]">
              <span className="h-2 w-2 rounded-full bg-accent" />
              CampusShare
            </a>
            <p className="mt-3 max-w-xs text-sm leading-7 text-ink-3">
              A hyper-local bulletin board for campus communities to give, borrow, buy, and claim items with verified peers nearby.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-3">Product</p>
            <div className="mt-4 space-y-2 text-sm text-ink-2">
              <a className="block hover:text-ink" href="#how-it-works">
                How it works
              </a>
              <a className="block hover:text-ink" href="/feed">
                Browse listings
              </a>
              <a className="block hover:text-ink" href="/post">
                Post an item
              </a>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-3">Company</p>
            <div className="mt-4 space-y-2 text-sm text-ink-2">
              <a className="block hover:text-ink" href="#top">
                About
              </a>
              <a className="block hover:text-ink" href="#features">
                Features
              </a>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-3">Support</p>
            <div className="mt-4 space-y-2 text-sm text-ink-2">
              <a className="block hover:text-ink" href="#cta">
                Help centre
              </a>
              <a className="block hover:text-ink" href="#cta">
                Community rules
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
