'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getDemoListingById } from '@/lib/marketplace-demo';
import { useParams } from 'next/navigation';

export default function MarketplaceListingDetailPage() {
  const params = useParams();
  const listingId = params.id as string;
  const listing = getDemoListingById(listingId);

  const [selectedPayment, setSelectedPayment] = useState<'ETH' | 'BTC'>('ETH');
  const [purchased, setPurchased] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  if (!listing) {
    return (
      <div style={{ display: 'grid', gap: 12 }}>
        <h1>Listing not found</h1>
        <Link href="/marketplace" style={{ color: 'var(--fg)' }}>
          ← Back to marketplace
        </Link>
      </div>
    );
  }

  const { passport, price, paymentTokens, rules } = listing;

  const handlePurchase = () => {
    // Mock purchase
    const mockTx = `0x${Math.random().toString(16).slice(2)}`;
    setTxHash(mockTx);
    setPurchased(true);
  };

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <Link href="/marketplace" style={{ color: 'var(--fg)', fontSize: 14 }}>
        ← Back to marketplace
      </Link>

      <div className="card" style={{ background: '#e3f2fd', borderColor: '#2196f3' }}>
        <p style={{ margin: 0, fontSize: 14, color: '#0d47a1' }}>
          <strong>ℹ️ Official Marketplace</strong> — This is a rule-enforced listing. All purchase conditions are
          verified on-chain.
        </p>
      </div>

      <div>
        <h1 style={{ margin: 0 }}>
          {passport.bottle.producer} — {passport.bottle.label}
        </h1>
        <div style={{ marginTop: 8, fontSize: 14, color: 'var(--muted)' }}>
          {passport.bottle.vintage ? `${passport.bottle.vintage} • ` : ''}
          {passport.bottle.region}, {passport.bottle.country}
        </div>
        <div style={{ marginTop: 4, fontSize: 13, color: 'var(--muted)' }}>
          Tag: <span className="code">{passport.tagId}</span>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'grid', gap: 12 }}>
          <div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>Price</div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{price} ETH</div>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 6 }}>Payment methods</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {paymentTokens.map((token) => (
                <span
                  key={token}
                  style={{
                    padding: '4px 10px',
                    fontSize: 12,
                    border: '1px solid var(--border)',
                    borderRadius: 6,
                    background: 'var(--card)',
                  }}
                >
                  {token}
                </span>
              ))}
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 6 }}>Seller</div>
            <span className="code" style={{ fontSize: 13 }}>
              {listing.seller}
            </span>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ margin: 0, marginBottom: 12 }}>On-chain Rules</h2>
        <div style={{ display: 'grid', gap: 10 }}>
          {rules.maxPrice && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'start' }}>
              <span style={{ fontSize: 18 }}>💰</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Max price: {rules.maxPrice} ETH</div>
                <div className="muted" style={{ fontSize: 13 }}>
                  Smart contract enforces this price cap. Cannot be exceeded.
                </div>
              </div>
            </div>
          )}

          {rules.allowlist && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'start' }}>
              <span style={{ fontSize: 18 }}>🔒</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Buyer allowlist active</div>
                <div className="muted" style={{ fontSize: 13 }}>
                  Only approved addresses can purchase. Verified on-chain.
                </div>
              </div>
            </div>
          )}

          {rules.cooldown && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'start' }}>
              <span style={{ fontSize: 18 }}>⏱️</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Resale cooldown: {rules.cooldown / 3600} hours</div>
                <div className="muted" style={{ fontSize: 13 }}>
                  Minimum time before you can resell after purchase.
                </div>
              </div>
            </div>
          )}

          {!rules.maxPrice && !rules.allowlist && !rules.cooldown && (
            <div className="muted" style={{ fontSize: 13 }}>No special rules for this listing.</div>
          )}
        </div>
      </div>

      {!purchased && (
        <div className="card">
          <h2 style={{ margin: 0, marginBottom: 12 }}>Purchase (Demo)</h2>
          <div style={{ display: 'grid', gap: 12 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Select payment method:</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {paymentTokens.map((token) => (
                  <button
                    key={token}
                    onClick={() => setSelectedPayment(token)}
                    disabled={!paymentTokens.includes(token)}
                    style={{
                      padding: '8px 16px',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      background: selectedPayment === token ? 'var(--fg)' : 'var(--bg)',
                      color: selectedPayment === token ? 'var(--bg)' : 'var(--fg)',
                      cursor: paymentTokens.includes(token) ? 'pointer' : 'not-allowed',
                      fontWeight: selectedPayment === token ? 600 : 400,
                    }}
                  >
                    {token}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handlePurchase}
              style={{
                padding: '14px 24px',
                background: 'var(--fg)',
                color: 'var(--bg)',
                border: 'none',
                borderRadius: 8,
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: 16,
              }}
            >
              Buy for {price} {selectedPayment}
            </button>

            <p className="muted" style={{ margin: 0, fontSize: 12 }}>
              In production, this would connect your wallet and execute the smart contract transaction.
            </p>
          </div>
        </div>
      )}

      {purchased && txHash && (
        <div className="card" style={{ background: '#e8f5e9', borderColor: '#4caf50' }}>
          <h2 style={{ margin: 0, marginBottom: 8, color: '#2e7d32' }}>✓ Purchase successful!</h2>
          <p style={{ margin: 0, fontSize: 14, color: '#2e7d32', marginBottom: 8 }}>
            Transaction hash: <span className="code">{txHash}</span>
          </p>
          <p style={{ margin: 0, fontSize: 14, color: '#2e7d32' }}>
            The bottle passport has been transferred to your wallet. View it at{' '}
            <Link href={`/passport/${passport.tagId}`} style={{ fontWeight: 600, textDecoration: 'underline' }}>
              /passport/{passport.tagId}
            </Link>
          </p>
        </div>
      )}

      <div className="card">
        <h2 style={{ margin: 0, marginBottom: 12 }}>Bottle Details</h2>
        <div style={{ display: 'grid', gap: 6, fontSize: 14 }}>
          <div className="kv">
            <div className="k">Producer</div>
            <div className="v">{passport.bottle.producer}</div>
          </div>
          <div className="kv">
            <div className="k">Label</div>
            <div className="v">{passport.bottle.label}</div>
          </div>
          <div className="kv">
            <div className="k">Vintage</div>
            <div className="v">{passport.bottle.vintage ?? '—'}</div>
          </div>
          <div className="kv">
            <div className="k">Region</div>
            <div className="v">{passport.bottle.region ?? '—'}</div>
          </div>
          <div className="kv">
            <div className="k">Size</div>
            <div className="v">{passport.bottle.sizeMl} mL</div>
          </div>
          <div className="kv">
            <div className="k">Custody</div>
            <div className="v">{passport.custody.replace('_', ' ')}</div>
          </div>
        </div>

        {passport.bottle.notes && (
          <div style={{ marginTop: 12, padding: 12, background: 'var(--bg)', borderRadius: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Tasting Notes</div>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>{passport.bottle.notes}</div>
          </div>
        )}
      </div>
    </div>
  );
}
