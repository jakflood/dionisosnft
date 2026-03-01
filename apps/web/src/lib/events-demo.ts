import { EventSchema, type Event, type Reservation } from '@dionisos/shared';

/**
 * Demo events data for testing eligibility, reservations, and check-in flows.
 */

const demoEvents: Event[] = [
  {
    id: 'evt-001-harvest',
    title: 'Harvest Festival & Tasting',
    city: 'Rome',
    venue: 'Dionisos Wine Bar',
    startsAt: '2024-09-15T18:00:00Z',
    capacity: 50,
    gating: {
      minTier: null, // Open to all
      requiresWallet: false,
    },
    createdAt: '2024-08-01T10:00:00Z',
  },
  {
    id: 'evt-002-masterclass',
    title: 'Sommelier Masterclass: Italian Reds',
    city: 'Florence',
    venue: 'Tenuta Bella Vista',
    startsAt: '2024-10-05T15:00:00Z',
    capacity: 20,
    gating: {
      minTier: 'cellar', // Cellar tier or higher
      requiresWallet: true,
    },
    createdAt: '2024-08-15T12:00:00Z',
  },
  {
    id: 'evt-003-auction',
    title: 'Rare Bottles Auction',
    city: 'Milan',
    venue: 'Grand Hotel Milano',
    startsAt: '2024-11-12T19:00:00Z',
    capacity: 30,
    gating: {
      minTier: 'patron', // Patron tier only
      requiresWallet: true,
    },
    createdAt: '2024-09-01T09:00:00Z',
  },
  {
    id: 'evt-004-vineyard',
    title: 'Vineyard Tour & Lunch',
    city: 'Siena',
    venue: 'Antica Cantina Estate',
    startsAt: '2024-12-03T11:00:00Z',
    capacity: 40,
    gating: {
      minTier: 'access', // Access tier or higher
      requiresWallet: false,
    },
    createdAt: '2024-10-01T08:00:00Z',
  },
  {
    id: 'evt-005-newyear',
    title: 'New Year's Eve Gala Dinner',
    city: 'Rome',
    venue: 'Palazzo Dionisos',
    startsAt: '2024-12-31T20:00:00Z',
    capacity: 100,
    gating: {
      minTier: 'cellar', // Cellar tier or higher
      requiresWallet: true,
    },
    createdAt: '2024-10-15T10:00:00Z',
  },
].map((e) => EventSchema.parse(e));

export function getAllDemoEvents(): Event[] {
  return demoEvents;
}

export function getDemoEventById(id: string): Event | null {
  return demoEvents.find((e) => e.id === id) ?? null;
}

export function getDemoReservations(userId: string): Reservation[] {
  // Mock reservations for demo
  return [
    {
      id: 'res-001',
      eventId: 'evt-001-harvest',
      userId,
      seats: 2,
      status: 'reserved',
      createdAt: '2024-08-05T14:00:00Z',
    },
    {
      id: 'res-002',
      eventId: 'evt-004-vineyard',
      userId,
      seats: 1,
      status: 'checked_in',
      createdAt: '2024-10-10T10:00:00Z',
    },
  ];
}

export function canUserAccessEvent(event: Event, userTier: string | null): boolean {
  const { minTier } = event.gating;
  if (!minTier) return true; // Open event

  const tierRank = { access: 1, cellar: 2, patron: 3 };
  const requiredRank = tierRank[minTier];
  const userRank = userTier ? tierRank[userTier as keyof typeof tierRank] ?? 0 : 0;

  return userRank >= requiredRank;
}
