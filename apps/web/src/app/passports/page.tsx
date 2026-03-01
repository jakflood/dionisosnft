import Link from 'next/link';
import { getAllDemoPassports } from '@/lib/passport-demo';
import { isDemoMode } from '@/lib/env';

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        fontSize: 12,
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 6,
      }}
    >
      {children}
    </span>
  );
}

export default function PassportsPage() {
  const demoMode = isDemoMode();
  const passports = demoMode ? getAllDemoPassports() : [];

  if (!demoMode) {
    return (
      <div style={{ display: 'grid', gap: 12 }}>
        <h1>Passports</h1>
        <p className="muted">Configure Supabase to see passports from the database.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div>
        <h1 style={{ margin: 0 }}>Bottle Passports</h1>
        <p className="muted" style={{ marginTop: 6 }}>
          Browse all registered bottles with on-chain verification and custody tracking.
        </p>
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        {passports.map((p) => (
          <Link
            key={p.id}
            href={`/passport/${p.tagId}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div
              className="card"
              style={{
                display: 'grid',
                gap: 10,
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>
                    {p.bottle.producer} — {p.bottle.label}
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--muted)' }}>
                    {p.bottle.vintage ? `${p.bottle.vintage} • ` : ''}
                    {p.bottle.region}, {p.bottle.country}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <Badge>{p.token?.standard}</Badge>
                  <Badge>{p.custody.replace('_', ' ')}</Badge>
                </div>
              </div>

              <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                Tag: <span className="code">{p.tagId}</span>
              </div>

              {p.bottle.notes && (
                <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
                  {p.bottle.notes}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
