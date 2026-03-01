/**
 * Normalize an incoming tag id from route params.
 *
 * - Never throws
 * - Strips whitespace
 * - Leaves casing intact (some tag formats may be case-sensitive)
 */
export function normalizeTagId(raw: string): string {
  let tagId = raw;
  try {
    tagId = decodeURIComponent(raw);
  } catch {
    // Malformed percent-encoding should not crash the app.
    tagId = raw;
  }
  return tagId.trim();
}
