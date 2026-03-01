import { NextResponse, type NextRequest } from 'next/server';
import { getPartnerMemberships, requireAuth } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    const memberships = await getPartnerMemberships(auth.userId, auth.token);
    return NextResponse.json({
      user: { id: auth.userId, email: auth.email },
      memberships,
    });
  } catch (e: any) {
    const status = e?.status ?? 500;
    return NextResponse.json({ error: e?.message ?? 'error' }, { status });
  }
}
