import { ListingCard, ListingFeedRow } from '@/components/listing-card';
import { SiteHeader } from '@/components/site-header';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { mapListingRow } from '@/lib/listings';
import Link from 'next/link';
import {
  ShieldCheck,
  PlusCircle,
  Handshake,
  Zap,
  Layers,
  Camera,
  BookOpen,
  Laptop,
  Armchair,
  Bike,
  Gift,
  Dumbbell,
  ArrowRight,
  CheckCircle2,
  Package,
  ChevronRight,
} from 'lucide-react';

const stats = [
  { value: '2,400+', label: 'Active Students' },
  { value: '12', label: 'Verified Campuses' },
  { value: '8,100+', label: 'Items Exchanged' },
  { value: '<4 min', label: 'Avg. Claim Time' },
];

const categories = [
  { name: 'Textbooks & Notes', count: '340+ items', icon: BookOpen, href: '/feed?type=all' },
  { name: 'Tech & Electronics', count: '190+ items', icon: Laptop, href: '/feed?type=all' },
  { name: 'Dorm & Furniture', count: '280+ items', icon: Armchair, href: '/feed?type=all' },
  { name: 'Bikes & Transit', count: '95+ items', icon: Bike, href: '/feed?type=all' },
  { name: 'Free & Giveaways', count: '410+ items', icon: Gift, href: '/feed?type=free' },
  { name: 'Sports & Fitness', count: '115+ items', icon: Dumbbell, href: '/feed?type=all' },
];

const steps = [
  {
    step: '01',
    title: 'Verify with Campus Email',
    description: 'Sign up using your university email to ensure 100% peer trust and security.',
    icon: ShieldCheck,
  },
  {
    step: '02',
    title: 'Post in Seconds',
    description: 'Add a title, category, photo, and select if it is Free, For Sale, or Borrow.',
    icon: PlusCircle,
  },
  {
    step: '03',
    title: 'Safe Campus Pickup',
    description: 'Coordinate quick handoffs at the quad, library, or dorm with zero shipping fees.',
    icon: Handshake,
  },
];

const features = [
  {
    title: 'Verified Campus Identity',
    description: 'Strict email verification ensures transactions stay between real campus peers.',
    icon: ShieldCheck,
  },
  {
    title: 'Realtime Availability Feed',
    description: 'Listings update instantly as items are claimed so you never chase stale posts.',
    icon: Zap,
  },
  {
    title: 'Flexible Options',
    description: 'Give away items for free, sell secondhand, or loan out gear for course projects.',
    icon: Layers,
  },
  {
    title: 'Photo & Details Support',
    description: 'High-res image previews and condition tags help you make decisions quickly.',
    icon: Camera,
  },
];

const testimonials = [
  {
    name: 'Ananya Krishnan',
    role: '3rd year, CSE',
    quote: 'Cleared out my dorm room after finals easily. The verified campus feed made handovers feel totally safe.',
    avatar: 'AK',
  },
  {
    name: 'Rohan Mehta',
    role: '1st year, ME',
    quote: 'Bought core engineering books from seniors at half price. Saved money right in my first semester.',
    avatar: 'RM',
  },
  {
    name: 'Priya Sharma',
    role: '2nd year, Physics',
    quote: 'Borrowed a projector for a class presentation within 15 minutes from a student two halls over.',
    avatar: 'PS',
  },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-ink-3">
      {children}
    </span>
  );
}

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: listingsData } = await supabase
    .from('listings')
    .select('*')
    .or('status.neq.removed,status.is.null')
    .order('created_at', { ascending: false })
    .limit(6);

  const isSignedIn = Boolean(user);
  const primaryCtaLabel = isSignedIn ? 'Post an item' : 'Join free';
  const primaryCtaHref = isSignedIn ? '/post' : '#cta';
  const feedItems = listingsData?.map(mapListingRow) ?? [];

  return (
    <main className="min-h-screen bg-cream text-ink">
      {/* Header */}
      <SiteHeader showMyListings={isSignedIn} />

      {/* Hero Section */}
      <section id="top" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-stone-light/80 bg-white px-3.5 py-1 text-xs text-ink-2">
              <span className="h-1.5 w-1.5 rounded-full bg-green" />
              <span>Verified Campus Network</span>
              <span className="text-stone font-light">|</span>
              <span className="text-ink-3">0% platform fees</span>
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl md:text-6xl leading-[1.12]">
              Your campus peer marketplace for sharing.
            </h1>

            <p className="mt-5 max-w-xl text-base sm:text-lg text-ink-2 font-light leading-relaxed">
              Give away dorm items, borrow lab gear, buy used textbooks, or claim freebies directly from verified student peers nearby.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href={primaryCtaHref}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-6 py-3.5 text-sm font-medium text-cream transition hover:bg-ink-2 shadow-2xs"
              >
                {primaryCtaLabel}
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="/feed"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-light bg-white px-6 py-3.5 text-sm text-ink-2 transition hover:border-stone hover:text-ink"
              >
                Browse Live Feed
              </a>
            </div>

            <div className="mt-8 flex items-center gap-2.5 text-xs text-ink-3">
              <div className="flex -space-x-2">
                {['AK', 'RM', 'PS'].map((label) => (
                  <span
                    key={label}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-white bg-stone-light text-[10px] font-semibold text-ink-2"
                  >
                    {label}
                  </span>
                ))}
              </div>
              <span>2,400+ students active across 12 campuses</span>
            </div>
          </div>

          {/* Right Live Preview Card */}
          <div className="hidden lg:block lg:col-span-5">
            <div className="rounded-2xl border border-stone-light/80 bg-white p-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-stone-light/60 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green" />
                  <span className="text-xs font-semibold text-ink">Live Campus Feed</span>
                </div>
                <span className="text-[10px] text-ink-3 uppercase tracking-wider">Realtime</span>
              </div>

              <div className="space-y-1">
                {feedItems.length > 0 ? (
                  feedItems.slice(0, 3).map((item) => (
                    <ListingFeedRow key={item.id} item={item} />
                  ))
                ) : (
                  <div className="py-10 text-center">
                    <Package className="mx-auto h-6 w-6 text-stone mb-2" />
                    <p className="text-xs text-ink-2 font-medium">No live listings yet</p>
                    <p className="text-[11px] text-ink-3 mt-0.5">Be the first to post an item on campus</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="border-y border-stone-light/60 bg-white py-8">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 sm:px-6 lg:grid-cols-4">
          {stats.map((s, idx) => (
            <div
              key={s.label}
              className={`text-center ${idx !== stats.length - 1 ? 'lg:border-r lg:border-stone-light/50' : ''}`}
            >
              <p className="text-2xl sm:text-3xl font-bold text-ink">{s.value}</p>
              <p className="mt-1 text-xs text-ink-3">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <SectionLabel>Categories</SectionLabel>
            <h2 className="mt-2 text-2xl font-bold text-ink sm:text-3xl">
              Explore by category
            </h2>
          </div>
          <a href="/feed" className="inline-flex items-center gap-1 text-xs text-ink-2 hover:text-ink font-medium">
            View all <ChevronRight className="h-3.5 w-3.5" />
          </a>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => {
            const Icon = c.icon;
            return (
              <a
                key={c.name}
                href={c.href}
                className="group flex items-center justify-between rounded-xl border border-stone-light/80 bg-white p-5 transition hover:border-stone hover:shadow-2xs"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cream text-ink-2">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-ink group-hover:text-accent transition-colors">
                      {c.name}
                    </h3>
                    <p className="text-xs text-ink-3">{c.count}</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-stone group-hover:text-ink transition-colors" />
              </a>
            );
          })}
        </div>
      </section>

      {/* Process */}
      <section id="how-it-works" className="border-t border-stone-light/60 bg-cream-dark/40 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-xl">
            <SectionLabel>Process</SectionLabel>
            <h2 className="mt-2 text-2xl font-bold text-ink sm:text-3xl">
              How CampusShare works
            </h2>
            <p className="mt-2 text-sm text-ink-2 leading-relaxed">
              Three simple steps to exchange campus items with verified peers.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {steps.map((st) => {
              const Icon = st.icon;
              return (
                <div key={st.step} className="rounded-2xl border border-stone-light/80 bg-white p-6">
                  <span className="text-xs font-mono font-semibold text-stone">{st.step}</span>
                  <div className="mt-4 flex h-9 w-9 items-center justify-center rounded-lg bg-cream text-ink">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-ink">{st.title}</h3>
                  <p className="mt-2 text-xs text-ink-2 leading-relaxed">{st.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Live Feed Grid */}
      <section id="listings" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <SectionLabel>Live Listings</SectionLabel>
            <h2 className="mt-2 text-2xl font-bold text-ink sm:text-3xl">
              Available on campus
            </h2>
          </div>
          <a href="/feed" className="inline-flex items-center gap-1 text-xs text-ink-2 hover:text-ink font-medium">
            Browse all ({feedItems.length}) <ChevronRight className="h-3.5 w-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {feedItems.length > 0 ? (
            feedItems.map((item, idx) => (
              <ListingCard key={item.id} item={item} priority={idx < 3} />
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-stone-light bg-white p-10 text-center lg:col-span-3">
              <Package className="mx-auto h-8 w-8 text-stone mb-2" />
              <p className="text-base font-medium text-ink">No live listings right now</p>
              <p className="mt-1 text-xs text-ink-3">Be the first student to list an item on campus.</p>
              <a
                href={primaryCtaHref}
                className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-ink px-5 py-2.5 text-xs font-medium text-cream hover:bg-ink-2 transition"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                {primaryCtaLabel}
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Features & Security */}
      <section id="features" className="border-t border-stone-light/60 bg-white py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-xl">
            <SectionLabel>Features</SectionLabel>
            <h2 className="mt-2 text-2xl font-bold text-ink sm:text-3xl">
              Built for campus reality
            </h2>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="rounded-xl border border-stone-light/70 p-5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-cream text-ink">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-ink">{f.title}</h3>
                  <p className="mt-1.5 text-xs text-ink-2 leading-relaxed">{f.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-ink text-white py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionLabel>Feedback</SectionLabel>
          <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
            Student experiences
          </h2>

          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="rounded-xl border border-white/10 bg-white/5 p-6">
                <p className="text-xs text-white/80 leading-relaxed">"{t.quote}"</p>
                <div className="mt-6 flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white">{t.name}</p>
                    <p className="text-[10px] text-white/50">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Minimal CTA */}
      <section id="cta" className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-ink sm:text-4xl">
          Start sharing on your campus
        </h2>
        <p className="mt-3 text-sm text-ink-2 font-light">
          Join students reducing waste and helping peers.
        </p>

        <div className="mt-6 flex justify-center gap-3">
          {isSignedIn ? (
            <a
              href="/post"
              className="rounded-xl bg-ink px-6 py-3 text-xs font-medium text-cream hover:bg-ink-2 transition"
            >
              Post an Item
            </a>
          ) : (
            <>
              <Link
                href="/auth/signup"
                className="rounded-xl bg-ink px-6 py-3 text-xs font-medium text-cream hover:bg-ink-2 transition"
              >
                Get Started Free
              </Link>
              <Link
                href="/auth/login"
                className="rounded-xl border border-stone-light bg-white px-6 py-3 text-xs font-medium text-ink-2 hover:border-stone transition"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-light/60 bg-cream-dark/50 py-12 text-xs text-ink-3">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <SiteLogo />
          <div className="flex gap-6 text-ink-2">
            <a href="#how-it-works" className="hover:text-ink">How it works</a>
            <a href="#categories" className="hover:text-ink font-normal">Categories</a>
            <a href="/feed" className="hover:text-ink font-normal">Browse</a>
            <a href="/post" className="hover:text-ink font-normal">Post</a>
          </div>
          <span>© {new Date().getFullYear()} CampusShare</span>
        </div>
      </footer>
    </main>
  );
}


