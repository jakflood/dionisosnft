import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { requireActivePartner, requireAuth } from '@/lib/auth-server';
import { normalizeTagId } from '@/lib/tag';
import { supabaseServerAuthed } from '@/lib/supabase-server';

const CustodyRequest = z.object({
  tagId: z.string().min(1),
  action: z.enum(['check_in', 'check_out', 'redeem', 'dispute', 'resolve']),
  metadata: z.record(z.unknown()).optional(),
});

function nextState(action: string) {
  switch (action) {
    case 'check_in':
      return 'in_storage';
    case 'check_out':
      return 'in_hand';
    case 'redeem':
      return 'redeemed';
    case 'dispute':
      return 'disputed';
    case 'resolve':
      return 'in_hand';
    default:
      return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    const partner = await requireActivePartner(req, auth.userId, auth.token);
    const json = await req.json();
    const body = CustodyRequest.parse(json);

    const supabase = supabaseServerAuthed(auth.token);
    if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });

    const tagId = normalizeTagId(body.tagId);
    const { data: passport, error: pErr } = await supabase
      .from('passports')
      .select('id, custody, issuer_partner_id, tag_id')
      .eq('tag_id', tagId)
      .eq('issuer_partner_id', partner.partnerId)
      .single();

    if (pErr) throw pErr;
    if (!passport) throw new Error('Passport not found');

    const to = nextState(body.action);
    const { data: event, error: eErr } = await supabase
      .from('custody_events')
      .insert({
        passport_id: passport.id,
        event_type: body.action,
        from_state: passport.custody,
        to_state: to,
        partner_id: partner.partnerId,
        metadata: body.metadata ?? {},
      })
      .select('id, created_at')
      .single();

    if (eErr) throw eErr;
    return NextResponse.json({ ok: true, event, passport: { tagId: passport.tag_id }, partner });
  } catch (e: any) {
    const status = e?.status ?? 400;
    return NextResponse.json({ error: e?.message ?? 'error' }, { status });
  }
}
