import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { verifyMessage } from 'ethers';
import { buildAttestationMessage } from '@dionisos/shared';
import { requireActivePartner, requireAuth } from '@/lib/auth-server';
import { normalizeTagId } from '@/lib/tag';
import { supabaseServerAuthed } from '@/lib/supabase-server';

const AttestationRequest = z.object({
  tagId: z.string().min(1),
  attestationType: z.enum(['condition', 'storage_check_in', 'storage_check_out', 'origin', 'transfer_verification']),
  payload: z.record(z.unknown()),
  issuedAt: z.string().min(10),
  signature: z.string().min(10),
});

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    const partner = await requireActivePartner(req, auth.userId, auth.token);
    const json = await req.json();
    const body = AttestationRequest.parse(json);

    const supabase = supabaseServerAuthed(auth.token);
    if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });

    const tagId = normalizeTagId(body.tagId);

    const { data: passport, error: pErr } = await supabase
      .from('passports')
      .select('id, issuer_partner_id, tag_id')
      .eq('tag_id', tagId)
      .eq('issuer_partner_id', partner.partnerId)
      .single();
    if (pErr) throw pErr;
    if (!passport) throw new Error('Passport not found');

    const message = buildAttestationMessage({
      tagId: passport.tag_id,
      partnerId: partner.partnerId,
      attestationType: body.attestationType,
      issuedAt: body.issuedAt,
      payload: body.payload,
    });

    const signer = verifyMessage(message, body.signature);

    const { data: att, error: aErr } = await supabase
      .from('attestations')
      .insert({
        passport_id: passport.id,
        partner_id: partner.partnerId,
        attestation_type: body.attestationType,
        payload: body.payload,
        message,
        signer_address: signer.toLowerCase(),
        signature: body.signature,
      })
      .select('id, created_at')
      .single();

    if (aErr) throw aErr;
    return NextResponse.json({ ok: true, attestation: att, signer });
  } catch (e: any) {
    const status = e?.status ?? 400;
    return NextResponse.json({ error: e?.message ?? 'error' }, { status });
  }
}
