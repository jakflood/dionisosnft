'use client';

import Link from 'next/link';
import { useState } from 'react';
import { getAllDemoEvents, canUserAccessEvent } from '@/lib/events-demo';

function TierBadge({ tier }: { tier: string | null }) {
  if (!tier) return <span style={{ fontSize: 12, color: 'var(--muted)' }}>Open to all</span>;

  const colors = {
    access: '#4caf50',
    cellar: '#2196f3',
    patron: '#9c27b0',
  };

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '4px 10px',
        fontSize: 12,
        fontWeight: 600,
        color: '#fff',
        background: colors[tier as keyof typeof colors],
        borderRadius: 6,
      }}
    >
      {tier.toUpperCase()} tier+
    </span>
  );
}

export default function EventsPage() {
  const events = getAllDemoEvents();
  const [selectedTier, setSelectedTier] = useState<string | null>('cellar'); // Demo user tier

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div>
        <h1 style={{ margin: 0 }}>Events</h1>
        <p className="muted" style={{ marginTop: 6 }}>
          Exclusive tastings, masterclasses, and experiences. Access gated by membership tier.
        </p>
      </div>

      <div className="card">
        <div style={{ marginBottom: 12 }}>
          <strong>Your tier (demo):</strong>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['access', 'cellar', 'patron'].map((tier) => (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier)}
              style={{
                padding: '8px 16px',
                border: '1px solid var(--border)',
                borderRadius: 8,
                background: selectedTier === tier ? 'var(--fg)' : 'var(--bg)',
                color: selectedTier === tier ? 'var(--bg)' : 'var(--fg)',
                cursor: 'pointer',
                fontWeight: selectedTier === tier ? 600 : 400,
                textTransform: 'capitalize',
              }}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        {events.map((event) => {
          const canAccess = canUserAccessEvent(event, selectedTier);
          return (
            <Link
              key={event.id}
              href={`/events/${event.id}`}
              style={{
                textDecoration: 'none',
                color: 'inherit',
                opacity: canAccess ? 1 : 0.5,
              }}
            >
              <div className="card" style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, marginBottom: 6 }}>{event.title}</h3>
                    <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 8 }}>
                      📅 {new Date(event.startsAt).toLocaleDateString()} at{' '}
                      {new Date(event.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div style={{ fontSize: 14, color: 'var(--muted)' }}>
                      📍 {event.venue ? `${event.venue}, ` : ''}
                      {event.city}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                    <TierBadge tier={event.gating.minTier} />
                    {!canAccess && (
                      <span style={{ fontSize: 12, color: '#f44336', fontWeight: 600 }}>🔒 Tier required</span>
                    )}
                  </div>
                </div>

                <div style={{ marginTop: 12, fontSize: 13, color: 'var(--muted)' }}>
                  Capacity: {event.capacity} seats
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
