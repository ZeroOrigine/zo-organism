'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    // #4603: pkce is already this helper's default. Saying it out loud means a
    // future library default cannot quietly put a live token back in the URL.
    { auth: { flowType: 'pkce' } },
  );
}
