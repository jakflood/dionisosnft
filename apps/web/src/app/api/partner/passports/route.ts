import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { requireActivePartner, requireAuth } from '@/lib/auth-server';
import { normalizeTagId } from '@/lib/tag';
import { supabaseServerAuthed } from '@/lib/supabase-server';

const CreatePassport = z.object({
  tagId: z.string().min(1),
  standard: z.enum(['ERC721', 'ERC1155']),
  producer: z.string().min(1),
  label: z.string().min(1),
  vintage: z.number().int().min(1900).max(2100).optional(),
  region: z.string().optional(),
  country: z.string().optional(),
  sizeMl: z.number().int().min(50).max(3000).optional(),
  lot: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    const partner = await requireActivePartner(req, auth.userId, auth.token);
    const json = await req.json();
    const body = CreatePassport.parse(json);

    const supabase = supabaseServerAuthed(auth.token);
    if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });

    const tagId = normalizeTagId(body.tagId);

    const { data, error } = await supabase
      .from('passports')
      .insert({
        tag_id: tagId,
        standard: body.standard,
        producer: body.producer,
        label: body.label,
        vintage: body.vintage ?? null,
        region: body.region ?? null,
        country: body.country ?? null,
        size_ml: body.sizeMl ?? 750,
        lot: body.lot ?? null,
        notes: body.notes ?? null,
        issuer_partner_id: partner.partnerId,
      })
      .select('id, tag_id')
      .single();

    if (error) throw error;
    return NextResponse.json({ ok: true, passport: data, partner });
  } catch (e: any) {
    const status = e?.status ?? 400;
    return NextResponse.json({ error: e?.message ?? 'error' }, { status });
  }
}
