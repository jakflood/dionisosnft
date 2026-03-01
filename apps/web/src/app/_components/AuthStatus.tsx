'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';

type State =
  | { kind: 'unconfigured' }
  | { kind: 'signed_out' }
  | { kind: 'signed_in'; email: string | null };

export function AuthStatus() {
  const configured = useMemo(
    () => Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    []
  );

  // Avoid a brief “Sign in” flash when Supabase isn't configured.
  const [state, setState] = useState<State>(() => (configured ? { kind: 'signed_out' } : { kind: 'unconfigured' }));

  useEffect(() => {
    if (!configured) {
      setState({ kind: 'unconfigured' });
      return;
    }

    const sb = supabaseBrowser();
    sb.auth.getSession().then(({ data }) => {
      const email = data.session?.user?.email ?? null;
      setState(email ? { kind: 'signed_in', email } : { kind: 'signed_out' });
    });

    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
      const email = session?.user?.email ?? null;
      setState(email ? { kind: 'signed_in', email } : { kind: 'signed_out' });
    });
    return () => sub.subscription.unsubscribe();
  }, [configured]);

  if (state.kind === 'unconfigured') {
    return <span className="muted">Auth not configured</span>;
  }

  if (state.kind === 'signed_in') {
    return (
      <span className="muted" title={state.email ?? undefined}>
        {state.email ?? 'Signed in'}
      </span>
    );
  }

  return <Link href="/login">Sign in</Link>;
}
