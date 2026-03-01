'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

export function PassportQuickOpen() {
  const router = useRouter();
  const [tag, setTag] = useState('demo-tag');
  const normalized = useMemo(() => tag.trim(), [tag]);

  return (
    <form
      className="card"
      onSubmit={(e) => {
        e.preventDefault();
        if (!normalized) return;
        router.push(`/passport/${encodeURIComponent(normalized)}`);
      }}
      style={{ display: 'grid', gap: 10 }}
    >
      <h2 style={{ margin: 0 }}>Scan / open a bottle passport</h2>
      <p className="muted" style={{ margin: 0 }}>
        For now, only <span className="code">demo-tag</span> exists. Next step will load real passports from Supabase.
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          placeholder="tag id"
          style={{ padding: 10, borderRadius: 10, border: '1px solid var(--border)', minWidth: 260 }}
        />
        <button
          type="submit"
          style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', cursor: 'pointer' }}
        >
          Open
        </button>
      </div>
    </form>
  );
}
