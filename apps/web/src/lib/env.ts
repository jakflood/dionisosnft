/**
 * Environment helpers.
 *
 * Keep this file dependency-free and server-safe.
 * For MVP we intentionally allow the app to run without Supabase configured
 * (it will fall back to demo data).
 */

export function getEnv(name: string): string | undefined {
  const v = process.env[name];
  return v && v.length > 0 ? v : undefined;
}

export function hasSupabaseConfigured(): boolean {
  return Boolean(getEnv('NEXT_PUBLIC_SUPABASE_URL') && getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'));
}

export function isDemoMode(): boolean {
  // Demo mode if explicitly enabled OR Supabase not configured
  const explicitDemo = getEnv('DEMO_MODE');
  if (explicitDemo === 'false') return false;
  return !hasSupabaseConfigured() || explicitDemo === 'true';
}

export function getSupabaseUrl(): string {
  const url = getEnv('NEXT_PUBLIC_SUPABASE_URL');
  if (!url) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
  return url;
}

export function getSupabaseAnonKey(): string {
  const key = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  if (!key) throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY');
  return key;
}

export function getSupabaseServiceRoleKey(): string | undefined {
  // Server-only: never expose.
  return getEnv('SUPABASE_SERVICE_ROLE_KEY');
}
