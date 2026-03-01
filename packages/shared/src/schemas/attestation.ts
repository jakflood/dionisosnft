import { z } from 'zod';

/**
 * Signed partner attestation payload.
 * We keep it generic to support condition reports, storage check-in/out, etc.
 */
export const AttestationPayloadSchema = z.object({
  passportId: z.string().uuid(),
  type: z.enum(['condition', 'storage_check_in', 'storage_check_out', 'origin', 'transfer_verification']),
  issuedAt: z.string().datetime(),
  partnerId: z.string().uuid(),
  data: z.record(z.unknown()),
  nonce: z.string().min(8),
});

export const AttestationSchema = z.object({
  id: z.string().uuid(),
  payload: AttestationPayloadSchema,
  signerAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  signature: z.string().min(10),
  createdAt: z.string().datetime(),
});

export type AttestationPayload = z.infer<typeof AttestationPayloadSchema>;
export type Attestation = z.infer<typeof AttestationSchema>;
