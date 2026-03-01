'use client';

import Link from 'next/link';
import { useState } from 'react';
import { getAllDemoListings, type MarketplaceListing } from '@/lib/marketplace-demo';

function RuleBadge({ label, color }: { label: string; color: string }) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '3px 8px',
        fontSize: 11,
        fontWeight: 600,
        color: '#fff',
        background: color,
        borderRadius: 4,
      }}
    >
      {label}
    </span>
  );
}

function ListingCard({ listing }: { listing: MarketplaceListing }) {
  const { passport, price, paymentTokens, rules } = listing;

  return (
    <Link href={`/marketplace/${listing.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="card" style={{ cursor: 'pointer', transition: 'transform 0.2s', display: 'grid', gap: 12 }}>
        <div>
          <h3 style={{ margin: 0, marginBottom: 6 }}>
            {passport.bottle.producer} — {passport.bottle.label}
          </h3>
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>
            {passport.bottle.vintage ? `${passport.bottle.vintage} • ` : ''}
            {passport.bottle.region}, {passport.bottle.country}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <div
            style={{
              padding: '6px 12px',
              background: 'var(--fg)',
              color: 'var(--bg)',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 16,
            }}
          >
            {price} ETH
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {paymentTokens.map((token) => (
              <span
                key={token}
                style={{
                  padding: '4px 8px',
                  fontSize: 11,
                  border: '1px solid var(--border)',
                  borderRadius: 4,
                  background: 'var(--card)',
                }}
              >
                {token}
              </span>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span
            style={{
              padding: '4px 8px',
              fontSize: 11,
              border: '1px solid var(--border)',
              borderRadius: 4,
              background: 'var(--card)',
            }}
          >
            {passport.token?.standard}
          </span>
          {rules.maxPrice && <RuleBadge label={`Max: ${rules.maxPrice} ETH`} color="#2196f3" />}
          {rules.allowlist && <RuleBadge label="Allowlist" color="#9c27b0" />}
          {rules.cooldown && (
            <RuleBadge label={`Cooldown: ${rules.cooldown / 3600}h`} color="#ff9800" />
          )}
        </div>

        <div style={{ fontSize: 12, color: 'var(--muted)' }}>
          Seller: <span className="code">{listing.seller}</span>
        </div>
      </div>
    </Link>
  );
}

export default function MarketplacePage() {
  const [selectedPayment, setSelectedPayment] = useState<'ETH' | 'BTC'>('ETH');
  const listings = getAllDemoListings();

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div>
        <h1 style={{ margin: 0 }}>Official Marketplace</h1>
        <p className="muted" style={{ marginTop: 6 }}>
          Rule-enforced listings with on-chain verification. All rules are enforced by smart contracts.
        </p>
      </div>

      <div className="card" style={{ background: '#e3f2fd', borderColor: '#2196f3' }}>
        <p style={{ margin: 0, fontSize: 14, color: '#0d47a1' }}>
          <strong>ℹ️ Official Marketplace</strong> — Rules are enforced on-chain. Max price, buyer allowlist, and
          resale cooldown are verified by smart contracts on Base.
        </p>
      </div>

      <div className="card">
        <div style={{ marginBottom: 12 }}>
          <strong>Payment method (demo):</strong>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setSelectedPayment('ETH')}
            style={{
              padding: '8px 16px',
              border: '1px solid var(--border)',
              borderRadius: 8,
              background: selectedPayment === 'ETH' ? 'var(--fg)' : 'var(--bg)',
              color: selectedPayment === 'ETH' ? 'var(--bg)' : 'var(--fg)',
              cursor: 'pointer',
              fontWeight: selectedPayment === 'ETH' ? 600 : 400,
            }}
          >
            ETH (native)
          </button>
          <button
            onClick={() => setSelectedPayment('BTC')}
            style={{
              padding: '8px 16px',
              border: '1px solid var(--border)',
              borderRadius: 8,
              background: selectedPayment === 'BTC' ? 'var(--fg)' : 'var(--bg)',
              color: selectedPayment === 'BTC' ? 'var(--bg)' : 'var(--fg)',
              cursor: 'pointer',
              fontWeight: selectedPayment === 'BTC' ? 600 : 400,
            }}
          >
            BTC (ERC-20 on Base)
          </button>
        </div>
        <p className="muted" style={{ margin: 0, marginTop: 8, fontSize: 12 }}>
          BTC payments are supported via a BTC-backed ERC-20 token on Base (WBTC-like).
        </p>
      </div>

      <div>
        <h2 style={{ margin: 0, marginBottom: 12 }}>Active Listings</h2>
        <div style={{ display: 'grid', gap: 12 }}>
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </div>

      <div className="card">
        <h3 style={{ margin: 0, marginBottom: 8 }}>Rule badges explained</h3>
        <div style={{ display: 'grid', gap: 6, fontSize: 13 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <RuleBadge label="Max: X ETH" color="#2196f3" />
            <span className="muted">Price cap enforced by smart contract</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <RuleBadge label="Allowlist" color="#9c27b0" />
            <span className="muted">Only approved buyers can purchase</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <RuleBadge label="Cooldown: Xh" color="#ff9800" />
            <span className="muted">Minimum time before resale allowed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
