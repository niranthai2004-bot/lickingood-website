/**
 * Admin allowlist — read from the ADMIN_EMAILS env var.
 * Used to gate /admin/* routes and the merchant-invite API.
 *
 * Format in .env.local:
 *   ADMIN_EMAILS=owner@example.com,partner@example.com
 *
 * Case-insensitive, comma-separated, whitespace tolerated.
 */
function readAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS ?? "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return readAdminEmails().includes(email.toLowerCase());
}

export function hasAnyAdmin(): boolean {
  return readAdminEmails().length > 0;
}
