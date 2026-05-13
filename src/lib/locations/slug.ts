/**
 * URL-safe slug generator for merchant locations.
 *
 * "Cottage Hill #1"   → "cottage-hill-1"
 * "Gulf Shores"       → "gulf-shores"
 * "Pine Forest / Bellview" → "pine-forest-bellview"
 *
 * Idempotent — slugifying an already-slugified value returns the same string.
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD") // strip accents
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "")
    .slice(0, 80);
}

/**
 * If the desired slug collides with an existing slug, append a deterministic
 * suffix derived from a stable identifier (Square location ID, UUID, etc.)
 * so retries are idempotent.
 */
export function slugWithSuffix(base: string, suffixSource: string): string {
  const base_ = slugify(base);
  // Pull 4 alphanumeric chars from the suffix source for de-collision
  const tail = suffixSource
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(-4);
  return tail ? `${base_}-${tail}` : base_;
}
