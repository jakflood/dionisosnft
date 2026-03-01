import { describe, expect, it } from 'vitest';
import { buildAttestationMessage } from '../attestation-message';
import { stableStringify } from '../stable-json';

describe('crypto helpers', () => {
  it('stableStringify sorts keys deterministically', () => {
    const a = stableStringify({ b: 2, a: 1, nested: { z: 1, y: 2 } });
    const b = stableStringify({ nested: { y: 2, z: 1 }, a: 1, b: 2 });
    expect(a).toBe(b);
  });

  it('buildAttestationMessage produces stable output', () => {
    const msg = buildAttestationMessage({
      tagId: 'demo-tag',
      partnerId: '00000000-0000-0000-0000-000000000000',
      attestationType: 'condition',
      issuedAt: '2026-03-01T00:00:00.000Z',
      payload: { b: 2, a: 1 },
    });
    expect(msg).toContain('DIONISOS_ATTESTATION_V1');
    expect(msg).toContain('tagId:demo-tag');
    expect(msg).toContain('type:condition');
    expect(msg).toContain('payload:{"a":1,"b":2}');
  });
});
