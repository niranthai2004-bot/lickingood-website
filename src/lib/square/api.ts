import {
  getSquareApiBaseUrl,
  refreshAccessToken,
  type SquareTokenResponse,
} from "./oauth";
import { createServiceClient } from "@/lib/supabase/server";

/**
 * Server-side Square API helpers.
 * Every call routes through getValidAccessToken() so expiring tokens get
 * refreshed transparently and the new tokens persisted.
 *
 * IMPORTANT: only call from route handlers / server actions — these touch
 * the service role and merchant access tokens that must never reach the client.
 */

export type StoredSquareConnection = {
  merchant_id: string;
  access_token: string;
  refresh_token: string;
  merchant_square_id: string;
  expires_at: string;
};

/**
 * Get a fresh access token for a merchant. If the cached token is within
 * 24h of expiry, refresh it and persist the new pair.
 */
export async function getValidAccessToken(
  merchantId: string,
): Promise<{ accessToken: string; squareMerchantId: string }> {
  const admin = createServiceClient();
  const { data: conn, error } = await admin
    .from("square_connections")
    .select(
      "merchant_id, access_token, refresh_token, merchant_square_id, expires_at",
    )
    .eq("merchant_id", merchantId)
    .maybeSingle();

  if (error || !conn) {
    throw new Error("No Square connection for this merchant.");
  }

  const expiresAt = new Date(conn.expires_at).getTime();
  const oneDay = 24 * 60 * 60 * 1000;
  if (expiresAt - Date.now() > oneDay) {
    return {
      accessToken: conn.access_token,
      squareMerchantId: conn.merchant_square_id,
    };
  }

  // Refresh and persist
  const refreshed: SquareTokenResponse = await refreshAccessToken(
    conn.refresh_token,
  );
  await admin
    .from("square_connections")
    .update({
      access_token: refreshed.access_token,
      refresh_token: refreshed.refresh_token,
      merchant_square_id: refreshed.merchant_id,
      expires_at: refreshed.expires_at,
    })
    .eq("merchant_id", merchantId);
  return {
    accessToken: refreshed.access_token,
    squareMerchantId: refreshed.merchant_id,
  };
}

export type SquareLocation = {
  id: string;
  name: string;
  status: "ACTIVE" | "INACTIVE";
  address?: {
    address_line_1?: string;
    address_line_2?: string;
    locality?: string;
    administrative_district_level_1?: string;
    postal_code?: string;
  };
};

/** Fetch all locations a merchant operates. */
export async function fetchSquareLocations(
  accessToken: string,
): Promise<SquareLocation[]> {
  const res = await fetch(`${getSquareApiBaseUrl()}/locations`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Square-Version": "2024-01-18",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Square locations fetch failed (${res.status}): ${body}`);
  }
  const json = (await res.json()) as { locations?: SquareLocation[] };
  return json.locations ?? [];
}

/**
 * Fetch a merchant's full catalog (items + variations).
 * Currently returns the raw Square shape — UI maps it later.
 */
export async function fetchSquareCatalog(accessToken: string) {
  const res = await fetch(
    `${getSquareApiBaseUrl()}/catalog/list?types=ITEM,CATEGORY,MODIFIER_LIST`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Square-Version": "2024-01-18",
      },
      cache: "no-store",
    },
  );
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Square catalog fetch failed (${res.status}): ${body}`);
  }
  return res.json();
}

/**
 * Fetch inventory counts for a set of catalog object IDs at a specific location.
 */
export async function fetchInventoryCounts(
  accessToken: string,
  catalogObjectIds: string[],
  locationIds: string[],
) {
  if (catalogObjectIds.length === 0 || locationIds.length === 0) {
    return { counts: [] };
  }
  const res = await fetch(
    `${getSquareApiBaseUrl()}/inventory/counts/batch-retrieve`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Square-Version": "2024-01-18",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        catalog_object_ids: catalogObjectIds,
        location_ids: locationIds,
      }),
      cache: "no-store",
    },
  );
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Square inventory fetch failed (${res.status}): ${body}`);
  }
  return res.json();
}
