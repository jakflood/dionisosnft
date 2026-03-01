import { NextResponse } from 'next/server';
import { hasSupabaseConfigured } from '@/lib/env';

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      app: 'dionisos',
      supabaseConfigured: hasSupabaseConfigured(),
      timestamp: new Date().toISOString(),
    },
    { status: 200, headers: { 'Cache-Control': 'no-store' } }
  );
}
