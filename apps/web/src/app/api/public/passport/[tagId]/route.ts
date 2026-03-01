import { NextResponse } from 'next/server';
import { resolvePassportByTagId } from '@/lib/passport';
import { normalizeTagId } from '@/lib/tag';

/**
 * Public passport endpoint.
 *
 * - No auth required (read-only)
 * - Returns schema-valid Passport JSON
 * - Never leaks Supabase error internals
 */
export async function GET(_req: Request, ctx: { params: { tagId: string } }) {
  const tagId = normalizeTagId(ctx.params.tagId);

  if (tagId.length < 1 || tagId.length > 128) {
    return NextResponse.json({ error: 'invalid_tag_id' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
  }

  const passport = await resolvePassportByTagId(tagId);
  if (!passport) {
    return NextResponse.json(
      { error: 'not_found', tagId },
      { status: 404, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  return NextResponse.json(passport, { status: 200, headers: { 'Cache-Control': 'no-store' } });
}
