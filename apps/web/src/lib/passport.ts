import { getDemoPassportByTagId } from './passport-demo';
import type { Passport } from '@dionisos/shared';
import { supabaseServer } from './supabase-server';
import { passportFromRow, type PassportRow } from './passport-db';

/**
 * Passport resolver.
 *
 * MVP behavior:
 * - If Supabase env vars are not configured, serve demo data.
 * - If configured, read from Supabase (server-side) and map to the shared schema.
 */
export async function resolvePassportByTagId(tagId: string): Promise<Passport | null> {
  const sb = supabaseServer();
  if (!sb) {
    const demo = getDemoPassportByTagId(tagId);
    return demo ?? null;
  }

  const { data, error } = await sb
    .from('passports')
    .select('*')
    .eq('tag_id', tagId)
    .maybeSingle();

  if (error) {
    // Avoid leaking operational details to the public API route.
    console.error('[passport] supabase read error', { code: error.code, message: error.message });
    // Fail closed: return demo only when tag matches demo tag.
    const demo = getDemoPassportByTagId(tagId);
    return demo ?? null;
  }

  if (!data) return null;
  return passportFromRow(data as unknown as PassportRow);
}
