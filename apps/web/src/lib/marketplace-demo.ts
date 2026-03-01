import type { Passport } from '@dionisos/shared';
import { getAllDemoPassports } from './passport-demo';

export type MarketplaceListing = {
  id: string;
  passport: Passport;
  seller: string;
  price: string; // in ETH
  paymentTokens: Array<'ETH' | 'BTC'>; // 'BTC' = BTC-backed ERC20
  rules: {
    maxPrice?: string; // optional price cap
    allowlist?: boolean; // whether buyer allowlist is enforced
    cooldown?: number; // seconds before resale allowed
  };
  status: 'active' | 'sold' | 'cancelled';
  listedAt: string;
};

const demoListings: MarketplaceListing[] = [
  {
    id: 'list-001',
    passport: getAllDemoPassports()[1], // TAG-001-2022
    seller: '0xABC...123',
    price: '0.5',
    paymentTokens: ['ETH', 'BTC'],
    rules: {
      maxPrice: '0.8',
    },
    status: 'active',
    listedAt: '2024-02-01T10:00:00Z',
  },
  {
    id: 'list-002',
    passport: getAllDemoPassports()[3], // TAG-003-MAGNUM
    seller: '0xDEF...456',
    price: '2.5',
    paymentTokens: ['ETH'],
    rules: {
      maxPrice: '3.0',
      allowlist: true,
      cooldown: 86400, // 24 hours
    },
    status: 'active',
    listedAt: '2024-02-05T12:00:00Z',
  },
  {
    id: 'list-003',
    passport: getAllDemoPassports()[5], // TAG-005-CASE
    seller: '0xGHI...789',
    price: '1.2',
    paymentTokens: ['ETH', 'BTC'],
    rules: {},
    status: 'active',
    listedAt: '2024-02-10T14:00:00Z',
  },
  {
    id: 'list-004',
    passport: getAllDemoPassports()[6], // TAG-006-RARE
    seller: '0xJKL...012',
    price: '5.0',
    paymentTokens: ['ETH', 'BTC'],
    rules: {
      maxPrice: '6.0',
      allowlist: true,
    },
    status: 'active',
    listedAt: '2024-02-12T09:00:00Z',
  },
  {
    id: 'list-005',
    passport: getAllDemoPassports()[8], // TAG-008-SPARKLING
    seller: '0xMNO...345',
    price: '0.8',
    paymentTokens: ['ETH'],
    rules: {
      cooldown: 43200, // 12 hours
    },
    status: 'active',
    listedAt: '2024-02-15T16:00:00Z',
  },
];

export function getAllDemoListings(): MarketplaceListing[] {
  return demoListings.filter((l) => l.status === 'active');
}

export function getDemoListingById(id: string): MarketplaceListing | null {
  return demoListings.find((l) => l.id === id) ?? null;
}
