/**
 * Deterministic JSON stringify.
 *
 * We use this to ensure signatures are reproducible across environments.
 * - Object keys are sorted.
 * - Arrays preserve order.
 * - `undefined` is omitted (like JSON.stringify).
 */
export function stableStringify(value: unknown): string {
  return JSON.stringify(stableNormalize(value));
}

function stableNormalize(value: unknown): unknown {
  if (value === null) return null;
  const t = typeof value;
  if (t === 'string' || t === 'number' || t === 'boolean') return value;
  if (t === 'bigint') return value.toString();
  if (t === 'undefined' || t === 'function' || t === 'symbol') return undefined;

  if (Array.isArray(value)) {
    return value.map((v) => stableNormalize(v));
  }

  // Dates become ISO strings.
  if (value instanceof Date) return value.toISOString();

  // Plain objects: sort keys.
  if (t === 'object') {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj).sort();
    const out: Record<string, unknown> = {};
    for (const k of keys) {
      const v = stableNormalize(obj[k]);
      if (v !== undefined) out[k] = v;
    }
    return out;
  }

  // Fallback: let JSON.stringify handle (likely undefined).
  return undefined;
}
