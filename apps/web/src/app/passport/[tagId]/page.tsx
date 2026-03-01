import { resolvePassportByTagId } from '@/lib/passport';
import { normalizeTagId } from '@/lib/tag';
import { getDemoCustodyTimeline, getDemoAttestations } from '@/lib/passport-demo';
import { isDemoMode } from '@/lib/env';
import type { Passport } from '@dionisos/shared';
import type { ReactNode } from 'react';

function Row({ k, v }: { k: string; v: ReactNode }) {
  return (
    <div className="kv">
      <div className="k">{k}</div>
      <div className="v">{v}</div>
    </div>
  );
}

function TokenBlock({ passport }: { passport: Passport }) {
  if (!passport.token) return <span className="muted">Not minted on-chain yet</span>;
  const t = passport.token;
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <Row k="Chain" v={`${t.chainId} (${t.standard})`} />
      <Row k="Contract" v={<span className="code">{t.contract}</span>} />
      <Row k="Token ID" v={<span className="code">{t.tokenId}</span>} />
    </div>
  );
}

export default async function PassportPage({ params }: { params: { tagId: string } }) {
  const tagId = normalizeTagId(params.tagId);
  const passport = await resolvePassportByTagId(tagId);
  const demoMode = isDemoMode();

  if (!passport) {
    return (
      <div style={{ display: 'grid', gap: 12 }}>
        <h1>Passport not found</h1>
        <p className="muted">
          No passport is associated with tag: <span className="code">{tagId}</span>
        </p>
      </div>
    );
  }

  const custodyTimeline = demoMode ? getDemoCustodyTimeline(tagId) : [];
  const attestations = demoMode ? getDemoAttestations(tagId) : [];

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0 }}>Bottle Passport</h1>
          <p className="muted" style={{ marginTop: 6 }}>
            Tag: <span className="code">{passport.tagId}</span>
          </p>
        </div>
        <div className="card" style={{ minWidth: 260 }}>
          <Row k="Custody" v={passport.custody.replace('_', ' ')} />
          <Row k="Updated" v={new Date(passport.updatedAt).toLocaleString()} />
        </div>
      </div>

      <section className="card" style={{ display: 'grid', gap: 10 }}>
        <h2 style={{ margin: 0 }}>Bottle</h2>
        <Row k="Producer" v={passport.bottle.producer} />
        <Row k="Label" v={passport.bottle.label} />
        <Row k="Vintage" v={passport.bottle.vintage ?? '—'} />
        <Row k="Region" v={passport.bottle.region ?? '—'} />
        <Row k="Country" v={passport.bottle.country ?? '—'} />
        <Row k="Size" v={`${passport.bottle.sizeMl} mL`} />
        <Row k="Lot" v={passport.bottle.lot ?? '—'} />
        {passport.bottle.notes && <Row k="Notes" v={passport.bottle.notes} />}
      </section>

      <section className="card" style={{ display: 'grid', gap: 10 }}>
        <h2 style={{ margin: 0 }}>On-chain reference</h2>
        <TokenBlock passport={passport} />
      </section>

      {custodyTimeline.length > 0 && (
        <section className="card" style={{ display: 'grid', gap: 12 }}>
          <h2 style={{ margin: 0 }}>Custody Timeline</h2>
          <div style={{ display: 'grid', gap: 10 }}>
            {custodyTimeline.map((event) => (
              <div key={event.id} style={{ paddingLeft: 12, borderLeft: '2px solid var(--border)' }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{event.event.replace('_', ' ')}</div>
                <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>
                  {new Date(event.timestamp).toLocaleString()}
                </div>
                {event.location && (
                  <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>
                    📍 {event.location}
                  </div>
                )}
                {event.notes && (
                  <div style={{ fontSize: 13, marginTop: 4 }}>
                    {event.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {attestations.length > 0 && (
        <section className="card" style={{ display: 'grid', gap: 12 }}>
          <h2 style={{ margin: 0 }}>Signed Attestations</h2>
          <div style={{ display: 'grid', gap: 10 }}>
            {attestations.map((att) => (
              <div key={att.id} style={{ padding: 12, background: 'var(--bg)', borderRadius: 8 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>
                  {att.attestationType.replace('_', ' ')}
                </div>
                <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>
                  {new Date(att.timestamp).toLocaleString()} • {att.issuer}
                </div>
                <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                  Signer: <span className="code">{att.issuerAddress}</span>
                </div>
                <div style={{ fontSize: 13, marginTop: 8 }}>
                  <pre className="code" style={{ margin: 0 }}>
                    {JSON.stringify(att.data, null, 2)}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="card" style={{ display: 'grid', gap: 10 }}>
        <h2 style={{ margin: 0 }}>Raw JSON</h2>
        <pre className="code">{JSON.stringify(passport, null, 2)}</pre>
      </section>
    </div>
  );
}
