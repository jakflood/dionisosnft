'use client';

import { useMemo, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';

export default function LoginPage() {
  const configured = useMemo(
    () => Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    []
  );
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  if (!configured) {
    return (
      <div className="card" style={{ display: 'grid', gap: 10 }}>
        <h1 style={{ margin: 0 }}>Sign in</h1>
        <p className="muted" style={{ margin: 0 }}>
          Supabase is not configured yet. Add <span className="code">NEXT_PUBLIC_SUPABASE_URL</span> and{' '}
          <span className="code">NEXT_PUBLIC_SUPABASE_ANON_KEY</span> to your environment.
        </p>
      </div>
    );
  }

  const sb = supabaseBrowser();

  return (
    <div style={{ display: 'grid', gap: 12, maxWidth: 520 }}>
      <div>
        <h1 style={{ margin: 0 }}>Sign in</h1>
        <p className="muted" style={{ marginTop: 6 }}>
          MVP auth is optional. Use it later for reservations and partner workflows.
        </p>
      </div>

      <div className="card" style={{ display: 'grid', gap: 10 }}>
        <button
          style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', cursor: 'pointer' }}
          onClick={async () => {
            setStatus(null);
            const { error } = await sb.auth.signInWithOAuth({
              provider: 'google',
              options: { redirectTo: `${window.location.origin}/` },
            });
            if (error) setStatus(error.message);
          }}
        >
          Continue with Google
        </button>

        <button
          style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', cursor: 'pointer' }}
          onClick={async () => {
            setStatus(null);
            const { error } = await sb.auth.signInWithOAuth({
              provider: 'apple',
              options: { redirectTo: `${window.location.origin}/` },
            });
            if (error) setStatus(error.message);
          }}
        >
          Continue with Apple
        </button>
      </div>

      <div className="card" style={{ display: 'grid', gap: 10 }}>
        <h2 style={{ margin: 0 }}>Email magic link</h2>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          style={{ padding: 10, borderRadius: 10, border: '1px solid var(--border)' }}
        />
        <button
          style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', cursor: 'pointer' }}
          onClick={async () => {
            setStatus(null);
            const trimmed = email.trim();
            if (!trimmed) return;
            const { error } = await sb.auth.signInWithOtp({
              email: trimmed,
              options: { emailRedirectTo: `${window.location.origin}/` },
            });
            if (error) setStatus(error.message);
            else setStatus('Check your email for the sign-in link.');
          }}
        >
          Send link
        </button>
        {status ? <p className="muted" style={{ margin: 0 }}>{status}</p> : null}
      </div>
    </div>
  );
}
