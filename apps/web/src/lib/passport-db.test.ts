import { describe, expect, it } from 'vitest';
import { passportFromRow, type PassportRow } from './passport-db';

describe('passportFromRow', () => {
  it('maps DB row to schema-valid Passport', () => {
    const row: PassportRow = {
      id: '9b8b6a58-07f0-4d7c-9fb4-0a5c6a1c0d11',
      tag_id: 'demo-tag',
      standard: 'ERC721',
      chain_id: 8453,
      contract_address: '0x0000000000000000000000000000000000000000',
      token_id: '1',
      producer: 'Dionisos Cellars',
      label: 'Founder’s Reserve',
      vintage: 2021,
      region: 'Lazio',
      country: 'Italy',
      size_ml: 750,
      lot: 'FR-2021-001',
      notes: null,
      custody: 'in_hand',
      front_image_url: null,
      back_image_url: null,
      capsule_image_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const p = passportFromRow(row);
    expect(p).not.toBeNull();
    expect(p!.tagId).toBe('demo-tag');
    expect(p!.token?.chainId).toBe(8453);
    expect(p!.bottle.producer).toBe('Dionisos Cellars');
  });

  it('does not drop tokenId "0"', () => {
    const row: PassportRow = {
      id: '11111111-1111-4111-8111-111111111111',
      tag_id: 'edge-tag-0',
      standard: 'ERC1155',
      chain_id: 8453,
      contract_address: '0x0000000000000000000000000000000000000000',
      token_id: '0',
      producer: 'Edge Winery',
      label: 'Zero Token',
      vintage: null,
      region: null,
      country: null,
      size_ml: 750,
      lot: null,
      notes: null,
      custody: 'in_hand',
      front_image_url: null,
      back_image_url: null,
      capsule_image_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const p = passportFromRow(row);
    expect(p).not.toBeNull();
    expect(p!.token?.tokenId).toBe('0');
    expect(p!.token?.standard).toBe('ERC1155');
  });
});
