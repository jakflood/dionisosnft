import { PassportSchema, type Passport } from '@dionisos/shared';

/**
 * Demo data used until Supabase is wired.
 * Kept schema-valid so it can be swapped 1:1 with DB results later.
 */

const baseTimestamp = new Date('2024-01-15T10:00:00Z').toISOString();

const demoPassports: Passport[] = [
  {
    id: '9b8b6a58-07f0-4d7c-9fb4-0a5c6a1c0d11',
    tagId: 'demo-tag',
    token: {
      chainId: 8453,
      contract: '0x0000000000000000000000000000000000000001',
      tokenId: '1',
      standard: 'ERC721',
    },
    bottle: {
      producer: 'Dionisos Cellars',
      label: "Founder's Reserve",
      vintage: 2021,
      region: 'Lazio',
      country: 'Italy',
      sizeMl: 750,
      lot: 'FR-2021-001',
      notes: 'Flagship Sangiovese blend. Deep ruby color with notes of cherry and leather.',
    },
    media: { frontImageUrl: null, backImageUrl: null, capsuleImageUrl: null },
    custody: 'in_hand',
    createdAt: baseTimestamp,
    updatedAt: baseTimestamp,
  },
  {
    id: 'a1c2e3f4-5678-9abc-def0-123456789abc',
    tagId: 'TAG-001-2022',
    token: {
      chainId: 8453,
      contract: '0x0000000000000000000000000000000000000001',
      tokenId: '42',
      standard: 'ERC721',
    },
    bottle: {
      producer: 'Tenuta Bella Vista',
      label: 'Gran Riserva',
      vintage: 2019,
      region: 'Tuscany',
      country: 'Italy',
      sizeMl: 750,
      lot: 'GR-2019-007',
      notes: 'Complex Brunello with aging potential. Dark fruit, tobacco, and spice.',
    },
    media: { frontImageUrl: null, backImageUrl: null, capsuleImageUrl: null },
    custody: 'cellar_storage',
    createdAt: baseTimestamp,
    updatedAt: baseTimestamp,
  },
  {
    id: 'b2d3e4f5-6789-0bcd-ef01-234567890bcd',
    tagId: 'TAG-002-2023',
    token: {
      chainId: 8453,
      contract: '0x0000000000000000000000000000000000000002',
      tokenId: '1',
      standard: 'ERC1155',
    },
    bottle: {
      producer: 'Château Mont Blanc',
      label: 'Prestige Cuvée',
      vintage: 2020,
      region: 'Bordeaux',
      country: 'France',
      sizeMl: 750,
      lot: 'PC-2020-015',
      notes: 'Left Bank blend. Cassis, cedar, and graphite. Cellar 10+ years.',
    },
    media: { frontImageUrl: null, backImageUrl: null, capsuleImageUrl: null },
    custody: 'in_transit',
    createdAt: baseTimestamp,
    updatedAt: baseTimestamp,
  },
  {
    id: 'c3e4f5g6-7890-1cde-f012-34567890cdef',
    tagId: 'TAG-003-MAGNUM',
    token: {
      chainId: 8453,
      contract: '0x0000000000000000000000000000000000000001',
      tokenId: '88',
      standard: 'ERC721',
    },
    bottle: {
      producer: 'Vino Rosso Estate',
      label: 'Anniversary Magnum',
      vintage: 2018,
      region: 'Piedmont',
      country: 'Italy',
      sizeMl: 1500,
      lot: 'AM-2018-001',
      notes: 'Limited magnum release. Only 50 bottles. Nebbiolo perfection.',
    },
    media: { frontImageUrl: null, backImageUrl: null, capsuleImageUrl: null },
    custody: 'cellar_storage',
    createdAt: baseTimestamp,
    updatedAt: baseTimestamp,
  },
  {
    id: 'd4f5g6h7-8901-2def-0123-456789def012',
    tagId: 'TAG-004-WHITE',
    token: {
      chainId: 8453,
      contract: '0x0000000000000000000000000000000000000001',
      tokenId: '99',
      standard: 'ERC721',
    },
    bottle: {
      producer: 'Alpine Vineyards',
      label: 'Mountain Reserve Chardonnay',
      vintage: 2022,
      region: 'Alto Adige',
      country: 'Italy',
      sizeMl: 750,
      lot: 'MR-2022-042',
      notes: 'Crisp minerality with hints of green apple and citrus. Fresh and elegant.',
    },
    media: { frontImageUrl: null, backImageUrl: null, capsuleImageUrl: null },
    custody: 'in_hand',
    createdAt: baseTimestamp,
    updatedAt: baseTimestamp,
  },
  {
    id: 'e5g6h7i8-9012-3ef0-1234-56789ef01234',
    tagId: 'TAG-005-CASE',
    token: {
      chainId: 8453,
      contract: '0x0000000000000000000000000000000000000002',
      tokenId: '12',
      standard: 'ERC1155',
    },
    bottle: {
      producer: 'Domaine du Soleil',
      label: 'Classic Collection Case (12 bottles)',
      vintage: 2021,
      region: 'Rhône Valley',
      country: 'France',
      sizeMl: 750,
      lot: 'CC-2021-CASE-003',
      notes: 'Mixed case: 6 red, 6 white. Perfect introduction to our estate.',
    },
    media: { frontImageUrl: null, backImageUrl: null, capsuleImageUrl: null },
    custody: 'cellar_storage',
    createdAt: baseTimestamp,
    updatedAt: baseTimestamp,
  },
  {
    id: 'f6h7i8j9-0123-4f01-2345-6789f0123456',
    tagId: 'TAG-006-RARE',
    token: {
      chainId: 8453,
      contract: '0x0000000000000000000000000000000000000001',
      tokenId: '777',
      standard: 'ERC721',
    },
    bottle: {
      producer: 'Antica Cantina',
      label: 'Centenario Special Edition',
      vintage: 2015,
      region: 'Veneto',
      country: 'Italy',
      sizeMl: 750,
      lot: 'CS-2015-LIMITED',
      notes: 'Rare vintage. Only 100 bottles produced. Amarone style with dried fruit complexity.',
    },
    media: { frontImageUrl: null, backImageUrl: null, capsuleImageUrl: null },
    custody: 'in_hand',
    createdAt: baseTimestamp,
    updatedAt: baseTimestamp,
  },
  {
    id: 'g7i8j9k0-1234-5012-3456-789g01234567',
    tagId: 'TAG-007-ROSE',
    token: {
      chainId: 8453,
      contract: '0x0000000000000000000000000000000000000001',
      tokenId: '200',
      standard: 'ERC721',
    },
    bottle: {
      producer: 'Provence Paradise',
      label: 'Summer Rosé',
      vintage: 2023,
      region: 'Provence',
      country: 'France',
      sizeMl: 750,
      lot: 'SR-2023-088',
      notes: 'Delicate salmon color. Strawberry and peach aromatics. Perfect for summer.',
    },
    media: { frontImageUrl: null, backImageUrl: null, capsuleImageUrl: null },
    custody: 'in_hand',
    createdAt: baseTimestamp,
    updatedAt: baseTimestamp,
  },
  {
    id: 'h8j9k0l1-2345-6123-4567-89h012345678',
    tagId: 'TAG-008-SPARKLING',
    token: {
      chainId: 8453,
      contract: '0x0000000000000000000000000000000000000001',
      tokenId: '333',
      standard: 'ERC721',
    },
    bottle: {
      producer: 'Franciacorta Prestige',
      label: 'Brut Réserve',
      vintage: 2019,
      region: 'Lombardy',
      country: 'Italy',
      sizeMl: 750,
      lot: 'BR-2019-024',
      notes: 'Traditional method sparkling. Fine bubbles, citrus, brioche notes.',
    },
    media: { frontImageUrl: null, backImageUrl: null, capsuleImageUrl: null },
    custody: 'cellar_storage',
    createdAt: baseTimestamp,
    updatedAt: baseTimestamp,
  },
  {
    id: 'i9k0l1m2-3456-7234-5678-9i0123456789',
    tagId: 'TAG-009-DESSERT',
    token: {
      chainId: 8453,
      contract: '0x0000000000000000000000000000000000000001',
      tokenId: '500',
      standard: 'ERC721',
    },
    bottle: {
      producer: 'Dolce Vita Estates',
      label: 'Vin Santo Riserva',
      vintage: 2017,
      region: 'Tuscany',
      country: 'Italy',
      sizeMl: 375,
      lot: 'VS-2017-012',
      notes: 'Traditional Tuscan dessert wine. Dried fig, honey, and walnut. Aged 5 years in caratelli.',
    },
    media: { frontImageUrl: null, backImageUrl: null, capsuleImageUrl: null },
    custody: 'in_hand',
    createdAt: baseTimestamp,
    updatedAt: baseTimestamp,
  },
].map((p) => PassportSchema.parse(p));

export function getDemoPassportByTagId(tagId: string): Passport | null {
  return demoPassports.find((p) => p.tagId === tagId) ?? null;
}

export function getAllDemoPassports(): Passport[] {
  return demoPassports;
}

export function getDemoCustodyTimeline(tagId: string) {
  // Mock custody events for demo
  return [
    {
      id: '1',
      timestamp: '2024-01-15T10:00:00Z',
      event: 'created',
      notes: 'Passport created and bottle authenticated',
      location: 'Producer facility',
    },
    {
      id: '2',
      timestamp: '2024-01-20T14:30:00Z',
      event: 'checked_in',
      notes: 'Received at Dionisos cellar facility',
      location: 'Dionisos Cellar, Rome',
    },
    {
      id: '3',
      timestamp: '2024-02-10T09:15:00Z',
      event: 'condition_check',
      notes: 'Excellent condition. Temperature and humidity optimal.',
      location: 'Dionisos Cellar, Rome',
    },
  ];
}

export function getDemoAttestations(tagId: string) {
  // Mock attestations for demo
  return [
    {
      id: 'att-1',
      timestamp: '2024-01-20T14:35:00Z',
      issuer: 'Dionisos Cellar Staff',
      issuerAddress: '0x1234...5678',
      attestationType: 'condition',
      data: {
        condition: 'excellent',
        fill_level: '100%',
        capsule: 'intact',
        label: 'pristine',
      },
      signature: '0xabcd...ef01',
    },
    {
      id: 'att-2',
      timestamp: '2024-02-10T09:20:00Z',
      issuer: 'Sommelier Certification',
      issuerAddress: '0x8765...4321',
      attestationType: 'authentication',
      data: {
        authenticated: true,
        method: 'label_inspection',
        notes: 'Verified genuine producer seal',
      },
      signature: '0x9876...5432',
    },
  ];
}
