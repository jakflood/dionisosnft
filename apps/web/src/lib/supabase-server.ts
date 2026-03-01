import 'server-only';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseAnonKey, getSupabaseServiceRoleKey, getSupabaseUrl, hasSupabaseConfigured } from './env';

let _client: SupabaseClient | null = null;

/**
 * Server-side Supabase client.
 *
 * For MVP we use the service role key when provided (server-only) to simplify
 * partner/admin flows later. For public reads, the anon key is sufficient.
 */
export function supabaseServer(): SupabaseClient | null {
  if (!hasSupabaseConfigured()) return null;
  if (_client) return _client;

  const url = getSupabaseUrl();
  const key = getSupabaseServiceRoleKey() ?? getSupabaseAnonKey();
  _client = createClient(url, key, {
    auth: { persistSession: false },
    global: {
      // Reduce edge timeouts on some hosts.
      fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }),
    },
  });
  return _client;
}

/**
 * Server client scoped to an end-user token.
 *
 * If a service role key is available, we still use it (but callers must enforce
 * authorization explicitly). If not, we inject the bearer token so RLS applies.
 */
export function supabaseServerAuthed(token: string): SupabaseClient | null {
  if (!hasSupabaseConfigured()) return null;
  const url = getSupabaseUrl();
  const service = getSupabaseServiceRoleKey();
  if (service) {
    return createClient(url, service, {
      auth: { persistSession: false },
      global: { fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }) },
    });
  }

  // RLS-enforced client.
  return createClient(url, getSupabaseAnonKey(), {
    auth: { persistSession: false },
    global: {
      headers: { Authorization: `Bearer ${token}` },
      fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }),
    },
  });
}
