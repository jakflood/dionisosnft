import { stableStringify } from './stable-json';

export type AttestationMessageParams = {
  tagId: string;
  partnerId: string;
  attestationType: string;
  payload: unknown;
  issuedAt: string; // ISO timestamp
};

/**
 * Canonical message format to be signed by a partner EVM address.
 *
 * Verification: signer_address === verifyMessage(message, signature).
 *
 * IMPORTANT: Any format change is a breaking change.
 */
export function buildAttestationMessage(params: AttestationMessageParams): string {
  const payload = stableStringify(params.payload);
  return [
    'DIONISOS_ATTESTATION_V1',
    `tagId:${params.tagId}`,
    `partnerId:${params.partnerId}`,
    `type:${params.attestationType}`,
    `issuedAt:${params.issuedAt}`,
    `payload:${payload}`,
  ].join('\n');
}
