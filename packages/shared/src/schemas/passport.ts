import { z } from 'zod';

/**
 * Canonical off-chain metadata for a bottle/case passport.
 * Stored in Postgres; referenced by on-chain tokenURI.
 */
export const PassportSchema = z.object({
  id: z.string().uuid(),
  tagId: z.string().min(6).max(128),
  token: z
    .object({
      chainId: z.number().int().positive(),
      contract: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
      tokenId: z.string(), // bigints as strings
      standard: z.enum(['ERC721', 'ERC1155']),
    })
    .optional(),

  bottle: z.object({
    producer: z.string().min(1),
    label: z.string().min(1),
    vintage: z.number().int().min(1900).max(2100).nullable().default(null),
    region: z.string().nullable().default(null),
    country: z.string().nullable().default(null),
    sizeMl: z.number().int().positive().default(750),
    lot: z.string().nullable().default(null),
    notes: z.string().nullable().default(null),
  }),

  media: z
    .object({
      frontImageUrl: z.string().url().nullable().default(null),
      backImageUrl: z.string().url().nullable().default(null),
      capsuleImageUrl: z.string().url().nullable().default(null),
    })
    .default({}),

  custody: z.enum(['in_hand', 'in_storage', 'redeemed', 'disputed']).default('in_hand'),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Passport = z.infer<typeof PassportSchema>;
