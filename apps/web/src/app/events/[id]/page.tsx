'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getDemoEventById, canUserAccessEvent } from '@/lib/events-demo';
import { useParams } from 'next/navigation';

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

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params.id as string;
  const event = getDemoEventById(eventId);

  const [userTier] = useState<string | null>('cellar'); // Demo user tier
  const [seats, setSeats] = useState(1);
  const [reserved, setReserved] = useState(false);
  const [reservationId, setReservationId] = useState<string | null>(null);

  if (!event) {
    return (
      <div style={{ display: 'grid', gap: 12 }}>
        <h1>Event not found</h1>
        <Link href="/events" style={{ color: 'var(--fg)' }}>
          ← Back to events
        </Link>
      </div>
    );
  }

  const canAccess = canUserAccessEvent(event, userTier);

  const handleReserve = () => {
    // Mock reservation
    const mockId = `res-${Date.now()}`;
    setReservationId(mockId);
    setReserved(true);
  };

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <Link href="/events" style={{ color: 'var(--fg)', fontSize: 14 }}>
        ← Back to events
      </Link>

      <div>
        <h1 style={{ margin: 0 }}>{event.title}</h1>
        <div style={{ marginTop: 8, fontSize: 14, color: 'var(--muted)' }}>
          📅 {new Date(event.startsAt).toLocaleDateString()} at{' '}
          {new Date(event.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div style={{ marginTop: 4, fontSize: 14, color: 'var(--muted)' }}>
          📍 {event.venue ? `${event.venue}, ` : ''}
          {event.city}
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>Access requirement:</div>
            <TierBadge tier={event.gating.minTier} />
          </div>
          <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: 12 }}>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>Capacity:</div>
            <div style={{ fontWeight: 600 }}>{event.capacity} seats</div>
          </div>
          <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: 12 }}>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>Your tier (demo):</div>
            <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>{userTier ?? 'None'}</div>
          </div>
        </div>
      </div>

      {!canAccess && (
        <div className="card" style={{ background: '#ffebee', borderColor: '#f44336' }}>
          <p style={{ margin: 0, color: '#c62828', fontWeight: 600 }}>
            🔒 You need {event.gating.minTier?.toUpperCase()} tier or higher to access this event.
          </p>
        </div>
      )}

      {canAccess && !reserved && (
        <div className="card">
          <h2 style={{ margin: 0, marginBottom: 12 }}>Reserve your seat</h2>
          <div style={{ display: 'grid', gap: 12 }}>
            <div>
              <label htmlFor="seats" style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 6 }}>
                Number of seats
              </label>
              <select
                id="seats"
                value={seats}
                onChange={(e) => setSeats(Number(e.target.value))}
                style={{
                  padding: '8px 12px',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  background: 'var(--bg)',
                  fontSize: 14,
                }}
              >
                {[1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? 'seat' : 'seats'}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleReserve}
              style={{
                padding: '12px 24px',
                background: 'var(--fg)',
                color: 'var(--bg)',
                border: 'none',
                borderRadius: 8,
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: 14,
              }}
            >
              Reserve {seats} {seats === 1 ? 'seat' : 'seats'}
            </button>
          </div>
        </div>
      )}

      {reserved && reservationId && (
        <div className="card" style={{ background: '#e8f5e9', borderColor: '#4caf50' }}>
          <h2 style={{ margin: 0, marginBottom: 8, color: '#2e7d32' }}>✓ Reservation confirmed!</h2>
          <p style={{ margin: 0, fontSize: 14, color: '#2e7d32' }}>
            Reservation ID: <span className="code">{reservationId}</span>
          </p>
          <p style={{ margin: 0, marginTop: 8, fontSize: 14, color: '#2e7d32' }}>
            You have reserved {seats} {seats === 1 ? 'seat' : 'seats'} for this event.
          </p>

          <div style={{ marginTop: 16, padding: 16, background: '#fff', borderRadius: 8 }}>
            <h3 style={{ margin: 0, marginBottom: 8, fontSize: 14 }}>Staff Check-in (Demo)</h3>
            <p className="muted" style={{ margin: 0, fontSize: 13, marginBottom: 12 }}>
              At the door, staff would scan this QR code or enter the reservation ID:
            </p>
            <div
              className="code"
              style={{
                padding: 12,
                background: 'var(--card)',
                borderRadius: 8,
                textAlign: 'center',
                fontWeight: 600,
              }}
            >
              {reservationId}
            </div>
            <p className="muted" style={{ margin: 0, fontSize: 12, marginTop: 12 }}>
              In production, this would be a QR code linked to the blockchain reservation.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
