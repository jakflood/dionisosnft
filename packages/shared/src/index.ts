export * from './schemas/passport';
export * from './schemas/attestation';
export * from './schemas/events';

export * from './crypto/attestation-message';
export * from './crypto/stable-json';

export const APP = {
  name: 'Dionisos',
  chain: 'base',
} as const;
