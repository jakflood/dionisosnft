import 'server-only';

import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseAnonKey, getSupabaseServiceRoleKey, getSupabaseUrl, hasSupabaseConfigured } from './env';

export type AuthedContext = {
  userId: string;
  email: string | null;
  token: string;
};

function getBearerToken(req: NextRequest): string | null {
  const h = req.headers.get('authorization');
  if (!h) return null;
  const m = /^Bearer\s+(.+)$/i.exec(h);
  return m?.[1] ?? null;
}

/**
 * Verifies a Supabase access token and returns basic user context.
 *
 * We intentionally avoid SSR cookie auth for MVP; the browser sends a bearer token.
 */
export async function requireAuth(req: NextRequest): Promise<AuthedContext> {
  if (!hasSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }
  const token = getBearerToken(req);
  if (!token) {
    const err = new Error('Missing Authorization bearer token');
    (err as any).status = 401;
    throw err;
  }

  const url = getSupabaseUrl();
  const key = getSupabaseServiceRoleKey() ?? getSupabaseAnonKey();
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    const err = new Error('Invalid session');
    (err as any).status = 401;
    throw err;
  }

  return {
    userId: data.user.id,
    email: data.user.email ?? null,
    token,
  };
}

export type PartnerMembership = {
  partnerId: string;
  partnerName: string;
  partnerKind: string;
  role: 'admin' | 'staff';
};

/**
 * Returns partner memberships for the authenticated user.
 */
export async function getPartnerMemberships(userId: string, token?: string) {
  if (!hasSupabaseConfigured()) return [] as PartnerMembership[];

  const url = getSupabaseUrl();
  const service = getSupabaseServiceRoleKey();
  const supabase = service
    ? createClient(url, service, { auth: { persistSession: false } })
    : createClient(url, getSupabaseAnonKey(), {
        auth: { persistSession: false },
        global: token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
      });

  const { data, error } = await supabase
    .from('partner_users')
    .select('partner_id, role, partners:partner_id ( name, kind )')
    .eq('user_id', userId);

  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    partnerId: row.partner_id as string,
    role: row.role as 'admin' | 'staff',
    partnerName: row.partners?.name ?? 'Partner',
    partnerKind: row.partners?.kind ?? 'unknown',
  })) as PartnerMembership[];
}

/**
 * Determines the active partner for a request.
 * - If X-Dionisos-Partner-Id header is present, we validate membership.
 * - Otherwise, if the user has exactly one partner, we use it.
 */
export async function requireActivePartner(req: NextRequest, userId: string, token?: string): Promise<PartnerMembership> {
  const memberships = await getPartnerMemberships(userId, token);
  if (memberships.length === 0) {
    const err = new Error('No partner membership');
    (err as any).status = 403;
    throw err;
  }

  const headerPartnerId = req.headers.get('x-dionisos-partner-id');
  if (headerPartnerId) {
    const match = memberships.find((m) => m.partnerId === headerPartnerId);
    if (!match) {
      const err = new Error('Not a member of requested partner');
      (err as any).status = 403;
      throw err;
    }
    return match;
  }

  if (memberships.length === 1) return memberships[0];

  const err = new Error('Multiple partners: set X-Dionisos-Partner-Id');
  (err as any).status = 400;
  throw err;
}
