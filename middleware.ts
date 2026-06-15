import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_ROUTES = ['/', '/auth/signup', '/auth/login', '/auth/pending'];
const AUTH_ROUTES = ['/auth/signup', '/auth/login'];
const ADMIN_ROUTES = ['/admin'];

type CookieToSet = {
  name: string;
  value: string;
  options: Parameters<NextResponse['cookies']['set']>[2];
};

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          const response = NextResponse.next();
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
          return response;
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Allow public routes
  if (PUBLIC_ROUTES.includes(pathname)) {
    // If logged in and trying to access auth pages, redirect to feed
    if (user && AUTH_ROUTES.includes(pathname)) {
      return NextResponse.redirect(new URL('/feed', request.url));
    }
    return NextResponse.next();
  }

  // Not logged in - redirect to login
  if (!user) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // User is logged in - check admin and verification status
  
  // Check admin status from profiles
  let isAdmin = false;
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();
    
    isAdmin = profile?.is_admin ?? false;
  } catch (error) {
    isAdmin = false;
  }

  // IMPORTANT: If user is admin and trying to access /feed, redirect to admin dashboard
  if (isAdmin && pathname === '/feed') {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  // Check admin routes
  if (ADMIN_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/feed', request.url));
    }
    // Admin is allowed, continue
    return NextResponse.next();
  }

  // Check verification status from user_verifications
  let isVerified = false;
  try {
    const { data: verification } = await supabase
      .from('user_verifications')
      .select('status')
      .eq('user_id', user.id)
      .single();
    
    isVerified = verification?.status === 'approved';
  } catch (error) {
    isVerified = false;
  }

  // Allow pending page even if not verified
  if (pathname === '/auth/pending') {
    return NextResponse.next();
  }

  // Protected routes require verification
  if (!isVerified) {
    return NextResponse.redirect(new URL('/auth/pending', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};