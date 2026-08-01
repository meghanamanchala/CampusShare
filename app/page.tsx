import MobileMenu from '@/components/mobile-menu';
import { ListingCard, ListingFeedRow } from '@/components/listing-card';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { LISTING_SELECT_FIELDS, mapListingRow } from '@/lib/listings';
import Link from 'next/link';
import { SiteLogo } from '@/components/site-logo';
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
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Users,
  Building2,
  Package,
  Clock,
  ChevronRight,
  TrendingUp,
  Sparkle,
} from 'lucide-react';

const stats = [
  { value: '2,400+', label: 'Active Students', icon: Users, change: '+18% this month' },
  { value: '12', label: 'Verified Campuses', icon: Building2, change: 'Expanding fast' },
  { value: '8,100+', label: 'Items Exchanged', icon: Package, change: '100% peer-to-peer' },
  { value: '<4 min', label: 'Avg. Claim Time', icon: Clock, change: 'Instant connection' },
];

const categories = [
  {
    name: 'Textbooks & Notes',
    count: '340+ items',
    icon: BookOpen,
    color: 'from-blue-500/10 to-indigo-500/10 text-blue-600 border-blue-200/60',
    href: '/feed?type=all',
  },
  {
    name: 'Tech & Electronics',
    count: '190+ items',
    icon: Laptop,
    color: 'from-purple-500/10 to-pink-500/10 text-purple-600 border-purple-200/60',
    href: '/feed?type=all',
  },
  {
    name: 'Dorm & Furniture',
    count: '280+ items',
    icon: Armchair,
    color: 'from-amber-500/10 to-orange-500/10 text-amber-600 border-amber-200/60',
    href: '/feed?type=all',
  },
  {
    name: 'Bikes & Transit',
    count: '95+ items',
    icon: Bike,
    color: 'from-emerald-500/10 to-teal-500/10 text-emerald-600 border-emerald-200/60',
    href: '/feed?type=all',
  },
  {
    name: 'Free & Giveaways',
    count: '410+ items',
    icon: Gift,
    color: 'from-rose-500/10 to-red-500/10 text-rose-600 border-rose-200/60',
    href: '/feed?type=free',
  },
  {
    name: 'Sports & Fitness',
    count: '115+ items',
    icon: Dumbbell,
    color: 'from-cyan-500/10 to-blue-500/10 text-cyan-600 border-cyan-200/60',
    href: '/feed?type=all',
  },
];

const steps = [
  {
    step: '01',
    title: 'Verify with University Email',
    description: 'Sign up using your official campus email. Only verified students get access, keeping transactions 100% safe.',
    icon: ShieldCheck,
    badge: 'Trust & Safety',
  },
  {
    step: '02',
    title: 'Post Item in 30 Seconds',
    description: 'Add title, category, photo, and select if it is Free, For Sale, or Borrow. Your listing publishes instantly to campus.',
    icon: PlusCircle,
    badge: 'Lightning Fast',
  },
  {
    step: '03',
    title: 'Claim & Pickup on Campus',
    description: 'Message peers directly and arrange quick handoffs right at the quad, library, or dorm lobby with zero shipping costs.',
    icon: Handshake,
    badge: 'Local Connection',
  },
];

const features = [
  {
    title: 'Verified Campus Identity',
    description: 'Strict email verification ensures you only deal with verified peers from your university campus.',
    icon: ShieldCheck,
  },
  {
    title: 'Realtime Availability Feed',
    description: 'Live updates keep listings active. Items claimed by peers disappear instantly without ghost posts.',
    icon: Zap,
  },
  {
    title: 'Flexible Exchange Options',
    description: 'Choose to give away for free, sell secondhand, or loan out items for short-term course projects.',
    icon: Layers,
  },
  {
    title: 'Photo Uploads & Details',
    description: 'High-res image support and item condition tags let you assess items quickly before claiming.',
    icon: Camera,
  },
];

const testimonials = [
  {
    name: 'Ananya Krishnan',
    role: '3rd year, CSE • IIT Madras',
    quote: 'I cleared out my entire dorm room after finals without throwing anything away! Verified campus access meant every handover was super safe.',
    avatar: 'AK',
  },
  {
    name: 'Rohan Mehta',
    role: '1st year, ME • BITS Pilani',
    quote: 'Bought core engineering textbooks from senior students for a fraction of the original price. Saved over ₹4,000 in my very first semester.',
    avatar: 'RM',
  },
  {
    name: 'Priya Sharma',
    role: '2nd year, Physics • DU',
    quote: 'Needed a HDMI projector for a single class presentation. Borrowed one from a student two halls over within 15 minutes!',
    avatar: 'PS',
  },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-stone-light/80 bg-white/80 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-ink-3 shadow-xs backdrop-blur-xs">
      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
      {children}
    </div>
  );
}

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: listingsData, error: listingsError } = await supabase
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
    <main className="relative min-h-screen bg-cream text-ink overflow-x-hidden">
      {/* Background Decorative Gradients */}
      <div className="pointer-events-none absolute -top-40 -right-40 h-[42rem] w-[42rem] rounded-full bg-radial from-blue-200/40 via-emerald-100/30 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute top-[30rem] -left-40 h-[36rem] w-[36rem] rounded-full bg-radial from-amber-200/30 via-stone-200/20 to-transparent blur-3xl" />

      {/* Site Header */}
      <header className="sticky top-0 z-50 border-b border-stone-light/80 bg-cream/90 backdrop-blur-md transition-all">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <a href="#top" className="transition hover:opacity-90">
            <SiteLogo />
          </a>

          {/* Mobile Menu */}
          <MobileMenu
            primaryCtaHref={primaryCtaHref}
            primaryCtaLabel={primaryCtaLabel}
          />

          {/* Desktop Menu */}
          <nav className="hidden items-center gap-1 md:flex">
            <a
              href="#how-it-works"
              className="rounded-xl px-4 py-2 text-sm font-medium text-ink-2 transition hover:bg-stone-light/70 hover:text-ink"
            >
              How it works
            </a>
            <a
              href="#categories"
              className="rounded-xl px-4 py-2 text-sm font-medium text-ink-2 transition hover:bg-stone-light/70 hover:text-ink"
            >
              Categories
            </a>
            <a
              href="/feed"
              className="rounded-xl px-4 py-2 text-sm font-medium text-ink-2 transition hover:bg-stone-light/70 hover:text-ink"
            >
              Browse Feed
            </a>
            <a
              href="#features"
              className="rounded-xl px-4 py-2 text-sm font-medium text-ink-2 transition hover:bg-stone-light/70 hover:text-ink"
            >
              Features
            </a>

            <a
              href={primaryCtaHref}
              className="ml-3 inline-flex items-center gap-1.5 rounded-xl bg-ink px-5 py-2.5 text-sm font-medium text-cream shadow-sm transition duration-200 hover:bg-ink-2 hover:shadow-md"
            >
              <Sparkles className="h-4 w-4 text-amber-400" />
              {primaryCtaLabel}
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section id="top" className="relative mx-auto max-w-6xl px-4 pt-12 pb-20 sm:px-6 md:pt-20 md:pb-28">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            {/* Live Status Pill */}
            <div className="mb-6 inline-flex flex-wrap items-center gap-2 rounded-full border border-stone-light bg-white px-4 py-1.5 text-xs font-semibold shadow-xs">
              <span className="flex h-2 w-2 rounded-full bg-green animate-pulse" />
              <span className="uppercase tracking-wider text-green-700 font-bold">Verified Campus Network</span>
              <span className="text-stone">|</span>
              <span className="text-ink-2 font-normal">Over 8,100+ items exchanged</span>
            </div>

            <h1 className="font-bold text-4xl leading-[1.15] tracking-tight sm:text-5xl md:text-6xl text-ink">
              Your campus, <span className="italic text-ink-3 underline decoration-amber-300 decoration-wavy underline-offset-8">less stuff</span> going to waste.
            </h1>

            <p className="mt-6 max-w-xl text-lg font-light leading-relaxed text-ink-2">
              The hyper-local bulletin board for students. Give away dorm items, borrow lab gear, buy used textbooks, or claim freebies directly from verified campus peers.
            </p>

            {/* Hero CTAs */}
            <div className="mt-8 flex flex-col gap-3.5 sm:flex-row sm:items-center">
              <a
                href={primaryCtaHref}
                className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-ink px-8 py-4 text-sm font-semibold text-cream shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:bg-ink-2 hover:shadow-lg"
              >
                <Zap className="h-4 w-4 fill-amber-400 text-amber-400" />
                {primaryCtaLabel}
              </a>
              <a
                href="/feed"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-stone bg-white px-7 py-4 text-sm font-medium text-ink transition-all duration-200 hover:bg-stone-light/60 hover:shadow-xs"
              >
                Browse Live Feed
                <ArrowRight className="h-4 w-4 text-ink-3" />
              </a>
            </div>

            {/* Quick Category Quicklinks */}
            <div className="mt-10 pt-6 border-t border-stone-light/60">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-3 mb-3">Popular Campus Searches</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: '📚 Textbooks', href: '/feed?type=all' },
                  { label: '🪑 Dorm Prep', href: '/feed?type=all' },
                  { label: '🔌 Electronics', href: '/feed?type=all' },
                  { label: '🎁 Freebies', href: '/feed?type=free' },
                  { label: '🚴 Bikes & Mobility', href: '/feed?type=all' },
                ].map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="inline-flex items-center gap-1 rounded-xl border border-stone-light bg-white/80 px-3 py-1.5 text-xs font-medium text-ink-2 shadow-2xs transition hover:border-stone hover:bg-white hover:text-ink"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Social Proof Avatars */}
            <div className="mt-8 flex items-center gap-3 text-sm text-ink-3">
              <div className="flex -space-x-2.5">
                {['AK', 'RM', 'PS', 'DT'].map((label) => (
                  <span
                    key={label}
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-cream bg-stone text-[11px] font-semibold text-ink-2 shadow-xs"
                  >
                    {label}
                  </span>
                ))}
                <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-cream bg-green-light text-[11px] font-semibold text-green shadow-xs">
                  ✓
                </span>
              </div>
              <p className="text-xs sm:text-sm">
                <span className="font-semibold text-ink">2,400+ students</span> active across 12 university campuses
              </p>
            </div>
          </div>

          {/* Right Hero Interactive Live Card */}
          <div className="relative hidden lg:block lg:col-span-5">
            <div className="relative z-10 overflow-hidden rounded-[2rem] border border-stone-light bg-white shadow-soft transition hover:shadow-xl">
              <div className="flex items-center justify-between border-b border-stone-light/80 bg-cream/50 px-6 py-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-green animate-ping" />
                  <div>
                    <p className="text-sm font-semibold text-ink">Campus Feed Preview</p>
                    <p className="text-xs text-ink-3">Verified live items nearby</p>
                  </div>
                </div>
                <span className="rounded-full bg-green-light px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-green">
                  Live
                </span>
              </div>

              <div className="space-y-1.5 p-3.5">
                {feedItems.length > 0 ? (
                  feedItems.slice(0, 3).map((item) => (
                    <ListingFeedRow
                      key={item.id}
                      item={item}
                    />
                  ))
                ) : (
                  <div className="rounded-[1.5rem] border border-dashed border-stone-light bg-cream/50 px-5 py-10 text-center">
                    <Package className="mx-auto h-8 w-8 text-stone mb-2" />
                    <p className="text-sm font-medium text-ink">No live listings right now</p>
                    <p className="mt-1 text-xs text-ink-3">Be the first to post an item on your campus!</p>
                  </div>
                )}
              </div>

              <div className="border-t border-stone-light/80 bg-stone-light/20 px-5 py-3 text-center">
                <a href="/feed" className="inline-flex items-center gap-1 text-xs font-semibold text-ink-2 hover:text-accent">
                  View full live feed
                  <ChevronRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            {/* Floating Live Claim Badge */}
            <div className="absolute -bottom-6 -left-6 z-20 flex items-center gap-3 rounded-2xl border border-stone-light bg-white p-3.5 shadow-soft">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-light text-green">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-ink">Item Claimed!</p>
                <p className="text-[11px] text-ink-3">Calculus Vol 2 claimed 4m ago</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Banner */}
      <section className="border-y border-stone-light/80 bg-cream-dark/80 py-12">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 sm:px-6 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="group relative rounded-2xl border border-stone-light/60 bg-white/60 p-6 text-center shadow-xs backdrop-blur-xs transition hover:border-stone hover:bg-white hover:shadow-soft">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-cream text-ink-2 group-hover:bg-ink group-hover:text-cream transition-colors">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="font-bold text-3xl sm:text-4xl text-ink tracking-tight">{stat.value}</p>
                <p className="mt-1 text-sm font-medium text-ink-2">{stat.label}</p>
                <p className="mt-1 text-[11px] text-ink-3 font-mono">{stat.change}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive Category Explorer */}
      <section id="categories" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
          <div>
            <SectionLabel>Explore Categories</SectionLabel>
            <h2 className="mt-3 font-bold text-3xl tracking-tight sm:text-4xl md:text-5xl text-ink">
              Find exactly what you <span className="italic text-ink-3">need for campus</span>
            </h2>
          </div>
          <a
            href="/feed"
            className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-2 hover:text-ink"
          >
            Browse all categories
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <a
                key={cat.name}
                href={cat.href}
                className="group relative overflow-hidden rounded-3xl border border-stone-light bg-white p-7 shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-stone hover:shadow-soft"
              >
                <div className="flex items-center justify-between">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border bg-gradient-to-br ${cat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-cream px-3 py-1 text-xs font-semibold text-ink-3">
                    {cat.count}
                  </span>
                </div>
                <h3 className="mt-6 text-xl font-bold text-ink group-hover:text-accent transition-colors">
                  {cat.name}
                </h3>
                <p className="mt-2 text-xs text-ink-3 font-medium flex items-center gap-1">
                  View listings
                  <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </p>
              </a>
            );
          })}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="border-t border-stone-light/80 bg-cream-dark/50 py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <SectionLabel>Process</SectionLabel>
            <h2 className="mt-3 font-bold text-3xl tracking-tight sm:text-4xl md:text-5xl text-ink">
              How CampusShare <span className="italic text-ink-3">actually works</span>
            </h2>
            <p className="mt-4 text-base sm:text-lg font-light leading-relaxed text-ink-2">
              Three simple steps with zero middleman, shipping delay, or extra fees. Built strictly for student-to-student sharing.
            </p>
          </div>

          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <article
                  key={step.step}
                  className="group relative flex flex-col justify-between rounded-3xl border border-stone-light bg-white p-8 shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:shadow-soft"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-4xl font-bold text-stone group-hover:text-ink transition-colors">
                        {step.step}
                      </span>
                      <span className="rounded-full bg-green-light px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-green">
                        {step.badge}
                      </span>
                    </div>

                    <div className="mt-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-stone-light bg-cream text-ink">
                      <Icon className="h-6 w-6 text-ink-2" />
                    </div>

                    <h3 className="mt-5 text-xl font-bold text-ink">{step.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-ink-2">{step.description}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Dedicated Post Highlight Section */}
      <section id="post" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-6">
            <SectionLabel>Post an Item</SectionLabel>
            <h2 className="mt-3 font-bold text-3xl tracking-tight sm:text-4xl md:text-5xl text-ink">
              Dedicated, fast <span className="italic text-ink-3">listing workflow</span>
            </h2>
            <p className="mt-4 text-base sm:text-lg font-light leading-relaxed text-ink-2">
              Clean and focused. Create a listing in under a minute with structured fields for condition, photos, price, or borrow duration.
            </p>

            <div className="mt-8 space-y-3">
              {[
                'Instant peer verification tied to your student account',
                'Specify Free, Price, or Borrow tag with zero fees',
                'Upload photos to increase claim speed',
                'Listings automatically publish to your campus feed',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-stone-light/60 bg-white/70 px-4 py-3 shadow-2xs">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-green" />
                  <span className="text-sm font-medium text-ink-2">{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="/post"
                className="inline-flex items-center gap-2 rounded-xl bg-ink px-6 py-3.5 text-sm font-semibold text-cream shadow-sm transition hover:bg-ink-2"
              >
                Open Posting Page
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="/feed"
                className="inline-flex items-center gap-2 rounded-xl border border-stone px-6 py-3.5 text-sm font-medium text-ink-2 transition hover:bg-stone-light"
              >
                Browse Live Feed
              </a>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-3xl border border-stone-light bg-white p-7 shadow-soft">
              <div className="flex items-center justify-between border-b border-stone-light pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-amber-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                </div>
                <span className="text-xs font-mono text-ink-3">campusshare.edu/post</span>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-stone-light bg-cream/60 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink-3">Listing Title</p>
                  <p className="mt-1 text-sm font-medium text-ink">Engineering Graphics Kit & Drawing Board</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-stone-light bg-cream/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-ink-3">Type</p>
                    <p className="mt-1 text-sm font-medium text-green-700">For Sale • ₹600</p>
                  </div>
                  <div className="rounded-2xl border border-stone-light bg-cream/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-ink-3">Condition</p>
                    <p className="mt-1 text-sm font-medium text-ink">Like New</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-dashed border-stone p-6 text-center bg-cream/30">
                  <Camera className="mx-auto h-6 w-6 text-stone mb-1" />
                  <p className="text-xs font-medium text-ink-3">Photo attached & verified</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Campus Feed Spotlight */}
      <section id="listings" className="bg-cream-dark py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12">
            <div>
              <SectionLabel>Live Listings</SectionLabel>
              <h2 className="mt-3 font-bold text-3xl tracking-tight sm:text-4xl md:text-5xl text-ink">
                What is available <span className="italic text-ink-3">right now</span>
              </h2>
            </div>
            <a
              href="/feed"
              className="mt-4 sm:mt-0 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-2 hover:text-ink"
            >
              View all listings ({feedItems.length})
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {feedItems.length > 0 ? (
              feedItems.map((item, index) => (
                <ListingCard key={item.id} item={item} priority={index < 3} />
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-stone-light bg-white p-12 text-center lg:col-span-3">
                <Package className="mx-auto h-10 w-10 text-stone mb-3" />
                <p className="text-lg font-semibold text-ink">No live listings right now</p>
                <p className="mt-1 text-sm text-ink-3">Be the first student to list an item on CampusShare!</p>
                <a
                  href="/post"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-ink px-6 py-3 text-sm font-medium text-cream"
                >
                  Post an item now
                </a>
              </div>
            )}
          </div>

          <div className="mt-12 text-center">
            <a
              href="/feed"
              className="inline-flex items-center gap-2 rounded-2xl bg-ink px-8 py-4 text-sm font-semibold text-cream shadow-soft hover:bg-ink-2"
            >
              Browse Full Live Feed
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Built For Campus Features */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <SectionLabel>Features</SectionLabel>
            <h2 className="mt-3 font-bold text-3xl tracking-tight sm:text-4xl md:text-5xl text-ink">
              Built for <span className="italic text-ink-3">campus reality</span>
            </h2>
            <p className="mt-4 text-base sm:text-lg font-light leading-relaxed text-ink-2">
              Unlike generic marketplaces, CampusShare is engineered specifically around how students live, study, move, and share on campus.
            </p>

            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="rounded-2xl border border-stone-light bg-white p-6 shadow-2xs transition hover:border-stone hover:shadow-soft"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cream-dark text-ink">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 font-bold text-ink">{feature.title}</h3>
                    <p className="mt-2 text-xs sm:text-sm leading-relaxed text-ink-2">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-stone-light bg-white p-6 shadow-soft">
              <div className="rounded-2xl bg-cream p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-light text-green font-bold">
                    ✓
                  </div>
                  <div>
                    <p className="text-sm font-bold text-ink">Campus Access Verified</p>
                    <p className="text-xs text-ink-3">student@university.edu</p>
                  </div>
                </div>

                <div className="mt-5 space-y-2.5">
                  <div className="rounded-xl border border-stone-light bg-white p-3.5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-3">Security Level</p>
                    <p className="text-xs font-medium text-green-700">100% Peer Verified</p>
                  </div>
                  <div className="rounded-xl border border-stone-light bg-white p-3.5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-3">Realtime Status</p>
                    <p className="text-xs font-medium text-ink">Listings refresh automatically</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-ink py-24 text-white relative overflow-hidden">
        <div className="pointer-events-none absolute top-0 right-0 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
        <div className="mx-auto max-w-6xl px-4 sm:px-6 relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 backdrop-blur-xs">
            Student Stories
          </div>
          <h2 className="mt-4 font-bold text-3xl tracking-tight sm:text-4xl md:text-5xl text-white">
            Loved by students <span className="italic text-white/50">across campuses</span>
          </h2>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <figure
                key={t.name}
                className="flex flex-col justify-between rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur-xs transition hover:border-white/20 hover:bg-white/10"
              >
                <p className="text-sm leading-relaxed text-white/80 font-light">"{t.quote}"</p>
                <div className="mt-8 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-xs font-bold text-white">
                    {t.avatar}
                  </div>
                  <div>
                    <figcaption className="text-sm font-semibold text-white">{t.name}</figcaption>
                    <p className="text-xs text-white/50">{t.role}</p>
                  </div>
                </div>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="mx-auto max-w-5xl px-4 py-20 sm:px-6 text-center">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-stone-light/80 bg-gradient-to-b from-white to-cream p-8 sm:p-14 shadow-soft">
          <div className="inline-flex items-center gap-2 rounded-full bg-green-light px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-green mb-4">
            <span className="h-2 w-2 rounded-full bg-green animate-pulse" />
            {isSignedIn ? 'Ready to post' : 'Open for early access'}
          </div>

          <h2 className="font-bold text-3xl tracking-tight sm:text-4xl md:text-5xl text-ink">
            Start sharing on <span className="italic text-ink-3">your campus today</span>
          </h2>

          <p className="mx-auto mt-4 max-w-lg text-base text-ink-2 leading-relaxed font-light">
            Join thousands of students reducing waste, saving money, and building local campus community trust.
          </p>

          {isSignedIn ? (
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
              <a
                href="/post"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-ink px-8 py-4 text-sm font-semibold text-cream shadow-sm hover:bg-ink-2"
              >
                <PlusCircle className="h-4 w-4" />
                Post an Item
              </a>
              <a
                href="/feed"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-stone bg-white px-8 py-4 text-sm font-medium text-ink-2 hover:bg-stone-light"
              >
                Browse Live Feed
              </a>
            </div>
          ) : (
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-ink px-8 py-4 text-sm font-semibold text-cream shadow-sm hover:bg-ink-2"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-stone bg-white px-8 py-4 text-sm font-medium text-ink-2 hover:bg-stone-light"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-light/80 bg-cream-dark py-16">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          <div>
            <SiteLogo />
            <p className="mt-4 max-w-xs text-xs sm:text-sm leading-relaxed text-ink-3">
              CampusShare is a hyper-local peer platform for university students to share, borrow, buy, and claim items with verified peers.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-ink-3">Product</p>
            <div className="mt-4 space-y-2.5 text-sm text-ink-2">
              <a className="block hover:text-ink transition-colors" href="#how-it-works">
                How it works
              </a>
              <a className="block hover:text-ink transition-colors" href="#categories">
                Explore Categories
              </a>
              <a className="block hover:text-ink transition-colors" href="/feed">
                Live Feed
              </a>
              <a className="block hover:text-ink transition-colors" href="/post">
                Post an item
              </a>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-ink-3">Company</p>
            <div className="mt-4 space-y-2.5 text-sm text-ink-2">
              <a className="block hover:text-ink transition-colors" href="#top">
                About CampusShare
              </a>
              <a className="block hover:text-ink transition-colors" href="#features">
                Features & Trust
              </a>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-ink-3">Safety & Support</p>
            <div className="mt-4 space-y-2.5 text-sm text-ink-2">
              <a className="block hover:text-ink transition-colors" href="#cta">
                Student Verification
              </a>
              <a className="block hover:text-ink transition-colors" href="#cta">
                Community Guidelines
              </a>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-6xl border-t border-stone-light/60 px-4 pt-6 text-center text-xs text-ink-3 sm:px-6">
          © {new Date().getFullYear()} CampusShare Inc. All rights reserved.
        </div>
      </footer>
    </main>
  );
}

