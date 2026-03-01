'use client';

import { useEffect, useMemo, useState } from 'react';
import { buildAttestationMessage } from '@dionisos/shared';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { normalizeTagId } from '@/lib/tag';

type Membership = {
  partnerId: string;
  partnerName: string;
  partnerKind: string;
  role: 'admin' | 'staff';
};

async function authedFetch(path: string, token: string, partnerId?: string, init?: RequestInit) {
  const headers = new Headers(init?.headers ?? {});
  headers.set('Authorization', `Bearer ${token}`);
  if (partnerId) headers.set('X-Dionisos-Partner-Id', partnerId);
  headers.set('Content-Type', 'application/json');
  const res = await fetch(path, { ...init, headers });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = json?.error ?? `Request failed (${res.status})`;
    throw new Error(message);
  }
  return json;
}

function pretty(obj: unknown) {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return String(obj);
  }
}

export default function PartnerPortal() {
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [activePartnerId, setActivePartnerId] = useState<string>('');
  const [status, setStatus] = useState<string>('');

  // Passport form
  const [tagId, setTagId] = useState('');
  const [producer, setProducer] = useState('');
  const [label, setLabel] = useState('');
  const [standard, setStandard] = useState<'ERC721' | 'ERC1155'>('ERC721');

  // Custody form
  const [custodyTagId, setCustodyTagId] = useState('');
  const [custodyAction, setCustodyAction] = useState<'check_in' | 'check_out'>('check_in');

  // Attestation form
  const [attTagId, setAttTagId] = useState('');
  const [attType, setAttType] = useState<'condition' | 'storage_check_in' | 'storage_check_out' | 'origin' | 'transfer_verification'>(
    'condition'
  );
  const [payloadText, setPayloadText] = useState('{\n  "note": "ok"\n}');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [lastSignedMessage, setLastSignedMessage] = useState<string | null>(null);

  const activePartner = useMemo(() => memberships.find((m) => m.partnerId === activePartnerId) ?? null, [memberships, activePartnerId]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const sb = supabaseBrowser();
        const { data } = await sb.auth.getSession();
        const accessToken = data.session?.access_token ?? null;
        if (!mounted) return;
        setToken(accessToken);
        if (!accessToken) {
          setLoading(false);
          return;
        }
        const me = await authedFetch('/api/partner/me', accessToken);
        const ms: Membership[] = me.memberships ?? [];
        setMemberships(ms);
        if (ms.length === 1) setActivePartnerId(ms[0].partnerId);
        setLoading(false);
      } catch (e: any) {
        setStatus(e?.message ?? 'Failed to load partner memberships');
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  async function connectWallet() {
    if (!(window as any).ethereum) throw new Error('No wallet detected (install MetaMask or similar)');
    const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
    const addr = (accounts?.[0] ?? '').toString();
    if (!addr) throw new Error('No account returned');
    setWalletAddress(addr);
  }

  async function createPassport() {
    if (!token) throw new Error('Not signed in');
    if (!activePartnerId) throw new Error('Select a partner');
    setStatus('Creating passport...');
    const res = await authedFetch(
      '/api/partner/passports',
      token,
      activePartnerId,
      {
        method: 'POST',
        body: JSON.stringify({ tagId, standard, producer, label }),
      }
    );
    setStatus(`✅ Passport created: ${pretty(res.passport)}`);
  }

  async function logCustody() {
    if (!token) throw new Error('Not signed in');
    if (!activePartnerId) throw new Error('Select a partner');
    setStatus('Logging custody event...');
    const res = await authedFetch(
      '/api/partner/custody',
      token,
      activePartnerId,
      {
        method: 'POST',
        body: JSON.stringify({ tagId: custodyTagId, action: custodyAction, metadata: {} }),
      }
    );
    setStatus(`✅ Custody event logged: ${pretty(res.event)}`);
  }

  async function signAndSubmitAttestation() {
    if (!token) throw new Error('Not signed in');
    if (!activePartnerId) throw new Error('Select a partner');
    if (!walletAddress) throw new Error('Connect a wallet');

    let payload: any;
    try {
      payload = JSON.parse(payloadText);
    } catch {
      throw new Error('Payload must be valid JSON');
    }

    const issuedAt = new Date().toISOString();
    const message = buildAttestationMessage({
      tagId: normalizeTagId(attTagId),
      partnerId: activePartnerId,
      attestationType: attType,
      issuedAt,
      payload,
    });

    // personal_sign expects hex or utf8 string; most wallets accept raw string.
    const signature = await (window as any).ethereum.request({
      method: 'personal_sign',
      params: [message, walletAddress],
    });

    setLastSignedMessage(message);
    setStatus('Submitting attestation...');

    const res = await authedFetch(
      '/api/partner/attestations',
      token,
      activePartnerId,
      {
        method: 'POST',
        body: JSON.stringify({
          tagId: attTagId,
          attestationType: attType,
          payload,
          issuedAt,
          signature,
        }),
      }
    );
    setStatus(`✅ Attestation stored. signer=${res.signer}`);
  }

  if (loading) return <div>Loading…</div>;

  if (!token) {
    return (
      <div style={{ padding: 12, border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12 }}>
        <p style={{ marginBottom: 8 }}>You must sign in to use partner tools.</p>
        <a href="/login">Go to sign-in</a>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <section style={{ padding: 12, border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12 }}>
        <h2 style={{ marginTop: 0 }}>Active partner</h2>
        {memberships.length === 0 ? (
          <p>No partner memberships found for this account.</p>
        ) : (
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <select value={activePartnerId} onChange={(e) => setActivePartnerId(e.target.value)}>
              <option value="">Select…</option>
              {memberships.map((m) => (
                <option key={m.partnerId} value={m.partnerId}>
                  {m.partnerName} ({m.role})
                </option>
              ))}
            </select>
            {activePartner && (
              <span style={{ opacity: 0.85 }}>
                kind: {activePartner.partnerKind} — id: {activePartner.partnerId}
              </span>
            )}
          </div>
        )}
      </section>

      <section style={{ padding: 12, border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12 }}>
        <h2 style={{ marginTop: 0 }}>Create passport</h2>
        <div style={{ display: 'grid', gap: 8 }}>
          <label>
            Tag ID
            <input value={tagId} onChange={(e) => setTagId(e.target.value)} placeholder="demo-tag-001" />
          </label>
          <label>
            Standard
            <select value={standard} onChange={(e) => setStandard(e.target.value as any)}>
              <option value="ERC721">ERC-721 (premium bottle)</option>
              <option value="ERC1155">ERC-1155 (case/batch)</option>
            </select>
          </label>
          <label>
            Producer
            <input value={producer} onChange={(e) => setProducer(e.target.value)} placeholder="Winery Name" />
          </label>
          <label>
            Label
            <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Barolo XYZ" />
          </label>
          <button onClick={() => createPassport().catch((e) => setStatus(e.message))}>Create</button>
        </div>
      </section>

      <section style={{ padding: 12, border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12 }}>
        <h2 style={{ marginTop: 0 }}>Custody event</h2>
        <div style={{ display: 'grid', gap: 8 }}>
          <label>
            Tag ID
            <input value={custodyTagId} onChange={(e) => setCustodyTagId(e.target.value)} placeholder="demo-tag-001" />
          </label>
          <label>
            Action
            <select value={custodyAction} onChange={(e) => setCustodyAction(e.target.value as any)}>
              <option value="check_in">Check-in (→ in_storage)</option>
              <option value="check_out">Check-out (→ in_hand)</option>
            </select>
          </label>
          <button onClick={() => logCustody().catch((e) => setStatus(e.message))}>Log event</button>
        </div>
      </section>

      <section style={{ padding: 12, border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12 }}>
        <h2 style={{ marginTop: 0 }}>Signed attestation</h2>
        <p style={{ opacity: 0.8 }}>
          Partners sign a canonical message with an EVM wallet. The server verifies and stores the attestation.
        </p>
        <div style={{ display: 'grid', gap: 8 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => connectWallet().catch((e) => setStatus(e.message))}>
              {walletAddress ? 'Wallet connected' : 'Connect wallet'}
            </button>
            {walletAddress && <span style={{ fontFamily: 'monospace' }}>{walletAddress}</span>}
          </div>
          <label>
            Tag ID
            <input value={attTagId} onChange={(e) => setAttTagId(e.target.value)} placeholder="demo-tag-001" />
          </label>
          <label>
            Type
            <select value={attType} onChange={(e) => setAttType(e.target.value as any)}>
              <option value="condition">condition</option>
              <option value="storage_check_in">storage_check_in</option>
              <option value="storage_check_out">storage_check_out</option>
              <option value="origin">origin</option>
              <option value="transfer_verification">transfer_verification</option>
            </select>
          </label>
          <label>
            Payload (JSON)
            <textarea value={payloadText} onChange={(e) => setPayloadText(e.target.value)} rows={6} />
          </label>
          <button onClick={() => signAndSubmitAttestation().catch((e) => setStatus(e.message))}>Sign & submit</button>
          {lastSignedMessage && (
            <details>
              <summary>Last signed message</summary>
              <pre style={{ whiteSpace: 'pre-wrap' }}>{lastSignedMessage}</pre>
            </details>
          )}
        </div>
      </section>

      <section>
        <h3>Status</h3>
        <pre style={{ whiteSpace: 'pre-wrap' }}>{status || '—'}</pre>
      </section>
    </div>
  );
}
