import Link from 'next/link';
import { PassportQuickOpen } from './_components/PassportQuickOpen';
import { isDemoMode } from '@/lib/env';

export default function HomePage() {
  const demoMode = isDemoMode();

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      {demoMode && (
        <div className="card" style={{ background: '#fff9e6', borderColor: '#ffc107' }}>
          <p style={{ margin: 0, fontSize: 14 }}>
            <strong>🚀 Demo Mode Active</strong> — All data is seeded for testing. Configure Supabase to enable
            partner tools and real data.
          </p>
        </div>
      )}

      <div>
        <h1 style={{ margin: 0 }}>Dionisos</h1>
        <p className="muted" style={{ marginTop: 6 }}>
          Bottle passports + cellar storage entitlement + experiences pass, backed by NFTs on Base with an official
          rule-enforced marketplace.
        </p>
      </div>

      <PassportQuickOpen />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        <Link href="/passports" style={{ textDecoration: 'none', color: 'inherit' }}>
          <section className="card" style={{ height: '100%', cursor: 'pointer', transition: 'transform 0.2s' }}>
            <h2 style={{ margin: 0, marginBottom: 8 }}>📜 Passports</h2>
            <p className="muted" style={{ margin: 0, fontSize: 14 }}>
              Browse bottle passports with on-chain verification, custody history, and signed attestations.
            </p>
          </section>
        </Link>

        <Link href="/events" style={{ textDecoration: 'none', color: 'inherit' }}>
          <section className="card" style={{ height: '100%', cursor: 'pointer', transition: 'transform 0.2s' }}>
            <h2 style={{ margin: 0, marginBottom: 8 }}>🎫 Events</h2>
            <p className="muted" style={{ margin: 0, fontSize: 14 }}>
              Exclusive tastings, masterclasses, and galas. Access gated by membership tier.
            </p>
          </section>
        </Link>

        <Link href="/marketplace" style={{ textDecoration: 'none', color: 'inherit' }}>
          <section className="card" style={{ height: '100%', cursor: 'pointer', transition: 'transform 0.2s' }}>
            <h2 style={{ margin: 0, marginBottom: 8 }}>🏛️ Marketplace</h2>
            <p className="muted" style={{ margin: 0, fontSize: 14 }}>
              Official marketplace with on-chain rule enforcement (max price, allowlist, cooldown).
            </p>
          </section>
        </Link>
      </div>

      <section className="card">
        <h2 style={{ margin: 0, marginBottom: 12 }}>What ships in MVP</h2>
        <div style={{ display: 'grid', gap: 8 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'start' }}>
            <span>✓</span>
            <span style={{ fontSize: 14 }}>Public bottle passport pages (scan → verify)</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'start' }}>
            <span>✓</span>
            <span style={{ fontSize: 14 }}>Partner-signed attestations (condition, storage check-in/out)</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'start' }}>
            <span>✓</span>
            <span style={{ fontSize: 14 }}>Events list + tier-gated reservations + door check-in</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'start' }}>
            <span>✓</span>
            <span style={{ fontSize: 14 }}>Official marketplace (ETH + BTC-backed ERC-20 on Base)</span>
          </div>
        </div>
      </section>
    </div>
  );
}
