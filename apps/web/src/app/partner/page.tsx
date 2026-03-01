import type { ReactNode } from 'react';
import PartnerPortal from './_components/PartnerPortal';

export default function PartnerPage(): ReactNode {
  return (
    <main style={{ maxWidth: 860, margin: '0 auto', padding: 24 }}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>Partner tools</h1>
      <p style={{ opacity: 0.8, marginBottom: 16 }}>
        Create passports, log custody events, and publish signed attestations.
      </p>
      <PartnerPortal />
    </main>
  );
}
