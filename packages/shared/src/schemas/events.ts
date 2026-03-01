import { z } from 'zod';

export const EventSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  city: z.string().min(1),
  venue: z.string().nullable().default(null),
  startsAt: z.string().datetime(),
  capacity: z.number().int().positive(),
  // gating policy evaluated server-side
  gating: z.object({
    minTier: z.enum(['access', 'cellar', 'patron']).nullable().default(null),
    requiresWallet: z.boolean().default(true),
  }),
  createdAt: z.string().datetime(),
});

export const ReservationSchema = z.object({
  id: z.string().uuid(),
  eventId: z.string().uuid(),
  userId: z.string().uuid(),
  seats: z.number().int().min(1).max(4).default(1),
  status: z.enum(['reserved', 'cancelled', 'checked_in', 'no_show']).default('reserved'),
  createdAt: z.string().datetime(),
});

export type Event = z.infer<typeof EventSchema>;
export type Reservation = z.infer<typeof ReservationSchema>;
