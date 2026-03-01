import { describe, expect, it } from 'vitest';
import { PassportSchema } from '../passport';

describe('PassportSchema', () => {
  it('parses a minimal valid passport', () => {
    const now = new Date().toISOString();
    const parsed = PassportSchema.parse({
      id: '9b8b6a58-07f0-4d7c-9fb4-0a5c6a1c0d11',
      tagId: 'demo-tag',
      bottle: {
        producer: 'X',
        label: 'Y',
      },
      media: {},
      custody: 'in_hand',
      createdAt: now,
      updatedAt: now,
    });

    expect(parsed.tagId).toBe('demo-tag');
    expect(parsed.bottle.sizeMl).toBe(750);
  });
});
