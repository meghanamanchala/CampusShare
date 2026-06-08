import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

function getSupabaseKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
}

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    getSupabaseKey(),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set({ name, value, ...options });
            });
          } catch {
            // During a normal Server Component render, Next.js does not allow
            // cookie mutation. Supabase can still read the session here, and any
            // refresh writes should happen in a Server Action or Route Handler.
          }
        },
      },
    }
  );
}
