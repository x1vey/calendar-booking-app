import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    // If we're on the client at runtime, we should throw a clear error.
    // At build time (when window is undefined), we can return a placeholder 
    // to avoid crashing the static generation process.
    if (typeof window !== 'undefined') {
      throw new Error(
        'Supabase URL and Anon Key are missing. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment variables.'
      );
    }

    return createBrowserClient(
      'https://placeholder.supabase.co',
      'placeholder'
    );
  }

  return createBrowserClient(url, key);
}
