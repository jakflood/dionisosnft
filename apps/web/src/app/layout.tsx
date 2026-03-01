import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import './globals.css';
import { AuthStatus } from './_components/AuthStatus';

export const metadata: Metadata = {
  title: 'Dionisos',
  description: 'Bottle passports, cellar entitlements, and experiences — verified.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="header">
          <nav className="nav" aria-label="Primary">
            <strong>Dionisos</strong>
            <span className="muted">MVP</span>
            <span style={{ flex: 1 }} />
            <Link href="/">Home</Link>
            <Link href="/passports">Passports</Link>
            <Link href="/events">Events</Link>
            <Link href="/marketplace">Marketplace</Link>
            <Link href="/partner">Partner</Link>
            <AuthStatus />
          </nav>
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
