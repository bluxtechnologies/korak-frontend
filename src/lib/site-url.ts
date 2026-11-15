/**
 * Resolves the canonical site URL from environment variables.
 * Production domain is OPEN (see docs/00-README.md).
 * In local development, defaults to http://localhost:3000.
 */
export function getSiteUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";

  return url.replace(/\/+$/, "");
}
