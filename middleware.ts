import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_ROUTES = ['/', '/feed', '/auth/signup', '/auth/login', '/auth/pending'];
const AUTH_ROUTES = ['/auth/signup', '/auth/login'];
const ADMIN_ROUTES = ['/admin'];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // If environment variables are missing on Vercel, allow static/public fallback rather than crashing with 500
    console.error('Middleware: Missing Supabase environment variables');
    return response;
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Allow public routes
    if (PUBLIC_ROUTES.includes(pathname)) {
      // If logged in and trying to access auth pages, redirect to feed
      if (user && AUTH_ROUTES.includes(pathname)) {
        return NextResponse.redirect(new URL('/feed', request.url));
      }
      return response;
    }

    // Not logged in - redirect to login
    if (!user) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // User is logged in - check admin and verification status
    let isAdmin = false;
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      isAdmin = profile?.is_admin ?? false;
    } catch {
      isAdmin = false;
    }

    // Check admin routes
    if (ADMIN_ROUTES.some((route) => pathname.startsWith(route))) {
      if (!isAdmin) {
        return NextResponse.redirect(new URL('/feed', request.url));
      }
      return response;
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
    } catch {
      isVerified = false;
    }

    // Allow pending page even if not verified
    if (pathname === '/auth/pending') {
      return response;
    }

    // Protected routes require verification
    if (!isVerified) {
      return NextResponse.redirect(new URL('/auth/pending', request.url));
    }

    return response;
  } catch (error) {
    console.error('Middleware execution error:', error);
    return response;
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
