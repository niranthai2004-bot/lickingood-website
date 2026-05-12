/**
 * Square OAuth helpers.
 *
 * ONE Square Developer App ↔ many merchant Square accounts.
 * Merchants authorize our app via OAuth; we receive an access_token + refresh_token
 * scoped to their account and store them server-side in `square_connections`.
 *
 * We never see merchant Square passwords or banking info — Square hosts the
 * sign-in form during the authorize redirect.
 */

const SCOPES = [
  "ITEMS_READ",
  "ITEMS_WRITE",
  "INVENTORY_READ",
  "ORDERS_READ",
  "ORDERS_WRITE",
  "MERCHANT_PROFILE_READ",
  "PAYMENTS_READ",
  "CUSTOMERS_READ",
] as const;

export type SquareEnvironment = "sandbox" | "production";

export function getSquareEnvironment(): SquareEnvironment {
  return process.env.SQUARE_ENVIRONMENT === "production"
    ? "production"
    : "sandbox";
}

export function getSquareOAuthBaseUrl(): string {
  return getSquareEnvironment() === "production"
    ? "https://connect.squareup.com"
    : "https://connect.squareupsandbox.com";
}

/** Base URL for Square REST APIs (Locations, Catalog, etc) — distinct host. */
export function getSquareApiBaseUrl(): string {
  return getSquareEnvironment() === "production"
    ? "https://connect.squareup.com/v2"
    : "https://connect.squareupsandbox.com/v2";
}

/** Read the Square App ID. Supports both legacy and current env names. */
export function getSquareAppId(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SQUARE_APP_ID ||
    process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID
  );
}

/** Read the Square App Secret. Supports both legacy and current env names. */
export function getSquareAppSecret(): string | undefined {
  return process.env.SQUARE_APP_SECRET || process.env.SQUARE_APPLICATION_SECRET;
}

export function getRedirectUri(): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${appUrl}/auth/callback`;
}

/** Builds the Square authorize URL the merchant is redirected to. */
export function buildAuthorizationUrl(state: string): string {
  const appId = getSquareAppId();
  if (!appId) {
    throw new Error(
      "NEXT_PUBLIC_SQUARE_APP_ID is not set. Add it to .env.local.",
    );
  }
  const params = new URLSearchParams({
    client_id: appId,
    scope: SCOPES.join(" "),
    session: "false",
    state,
    redirect_uri: getRedirectUri(),
  });
  return `${getSquareOAuthBaseUrl()}/oauth2/authorize?${params.toString()}`;
}

export type SquareTokenResponse = {
  access_token: string;
  refresh_token: string;
  merchant_id: string;
  expires_at: string; // ISO timestamp
  token_type: string;
};

/** Exchange the authorization code returned by Square for tokens. */
export async function exchangeCodeForTokens(
  code: string,
): Promise<SquareTokenResponse> {
  const appId = getSquareAppId();
  const secret = getSquareAppSecret();
  const redirectUri = getRedirectUri();

  if (!appId || !secret) {
    console.error("[Square OAuth] Missing credentials", {
      hasAppId: !!appId,
      hasSecret: !!secret,
    });
    throw new Error("Square app credentials missing in env.");
  }

  console.log("[Square OAuth] Exchanging code", {
    environment: getSquareEnvironment(),
    redirectUri,
    appIdPrefix: appId.slice(0, 22),
    codeLength: code.length,
  });

  const res = await fetch(`${getSquareOAuthBaseUrl()}/oauth2/token`, {
    method: "POST",
    headers: {
      "Square-Version": "2024-12-18",
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: appId,
      client_secret: secret,
      code,
      grant_type: "authorization_code",
      // Square requires redirect_uri here to match the one used in the
      // authorization request. Omitting this is the #1 cause of OAuth_TOKEN failures.
      redirect_uri: redirectUri,
    }),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    console.error("[Square OAuth] Token exchange FAILED", {
      status: res.status,
      statusText: res.statusText,
      body: errBody,
    });
    throw new Error(`Square token exchange failed (${res.status}): ${errBody}`);
  }

  const json = (await res.json()) as SquareTokenResponse;
  console.log("[Square OAuth] Token exchange SUCCESS", {
    merchantId: json.merchant_id,
    expiresAt: json.expires_at,
  });
  return json;
}

/** Refresh an access token using its refresh_token. */
export async function refreshAccessToken(
  refreshToken: string,
): Promise<SquareTokenResponse> {
  const appId = getSquareAppId();
  const secret = getSquareAppSecret();
  if (!appId || !secret) {
    throw new Error("Square app credentials missing in env.");
  }

  const res = await fetch(`${getSquareOAuthBaseUrl()}/oauth2/token`, {
    method: "POST",
    headers: {
      "Square-Version": "2024-12-18",
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: appId,
      client_secret: secret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    console.error("[Square OAuth] Refresh FAILED", { status: res.status, body: errBody });
    throw new Error(`Square token refresh failed (${res.status}): ${errBody}`);
  }
  return res.json();
}

export const SQUARE_SCOPES = SCOPES;
