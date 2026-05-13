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

const SQUARE_VERSION = "2024-01-18";

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

// ───────────────────────────────────────────────────────────────────────────
// LOCATIONS
// ───────────────────────────────────────────────────────────────────────────

export type SquareLocation = {
  id: string;
  name: string;
  status: "ACTIVE" | "INACTIVE";
  phone_number?: string;
  address?: {
    address_line_1?: string;
    address_line_2?: string;
    locality?: string;
    administrative_district_level_1?: string;
    postal_code?: string;
  };
  coordinates?: {
    latitude?: number;
    longitude?: number;
  };
  capabilities?: string[];
};

export async function fetchSquareLocations(
  accessToken: string,
): Promise<SquareLocation[]> {
  const res = await fetch(`${getSquareApiBaseUrl()}/locations`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Square-Version": SQUARE_VERSION,
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

// ───────────────────────────────────────────────────────────────────────────
// CATALOG
// ───────────────────────────────────────────────────────────────────────────

export type SquareMoney = {
  amount?: number;
  currency?: string;
};

export type SquareCatalogItemVariation = {
  type: "ITEM_VARIATION";
  id: string;
  updated_at?: string;
  is_deleted?: boolean;
  item_variation_data: {
    item_id?: string;
    name?: string;
    ordinal?: number;
    pricing_type?: "FIXED_PRICING" | "VARIABLE_PRICING";
    price_money?: SquareMoney;
    location_overrides?: Array<{
      location_id: string;
      price_money?: SquareMoney;
      track_inventory?: boolean;
      sold_out?: boolean;
    }>;
    track_inventory?: boolean;
  };
};

export type SquareCatalogItem = {
  type: "ITEM";
  id: string;
  updated_at?: string;
  is_deleted?: boolean;
  present_at_all_locations?: boolean;
  present_at_location_ids?: string[];
  absent_at_location_ids?: string[];
  item_data: {
    name?: string;
    description?: string;
    category_id?: string;
    image_ids?: string[];
    variations?: SquareCatalogItemVariation[];
    is_archived?: boolean;
  };
};

export type SquareCatalogCategory = {
  type: "CATEGORY";
  id: string;
  updated_at?: string;
  is_deleted?: boolean;
  category_data: {
    name?: string;
    ordinal?: number;
  };
};

export type SquareCatalogImage = {
  type: "IMAGE";
  id: string;
  is_deleted?: boolean;
  image_data: {
    url?: string;
    name?: string;
    caption?: string;
  };
};

export type SquareCatalogObject =
  | SquareCatalogItem
  | SquareCatalogItemVariation
  | SquareCatalogCategory
  | SquareCatalogImage
  | { type: string; id: string; is_deleted?: boolean };

/**
 * Pull the full catalog (items + categories + images) for the merchant,
 * paginating through all results. Square caps page size around 1000, so
 * even very large catalogs converge in a small handful of round-trips.
 */
export async function fetchSquareCatalog(
  accessToken: string,
): Promise<{
  items: SquareCatalogItem[];
  categories: SquareCatalogCategory[];
  images: SquareCatalogImage[];
}> {
  const items: SquareCatalogItem[] = [];
  const categories: SquareCatalogCategory[] = [];
  const images: SquareCatalogImage[] = [];

  let cursor: string | undefined = undefined;
  const types = "ITEM,CATEGORY,IMAGE";

  // Safety cap so a malformed cursor loop can't spin forever
  for (let page = 0; page < 50; page++) {
    const url = new URL(`${getSquareApiBaseUrl()}/catalog/list`);
    url.searchParams.set("types", types);
    if (cursor) url.searchParams.set("cursor", cursor);

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Square-Version": SQUARE_VERSION,
      },
      cache: "no-store",
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Square catalog fetch failed (${res.status}): ${body}`);
    }
    const json = (await res.json()) as {
      objects?: SquareCatalogObject[];
      cursor?: string;
    };

    for (const obj of json.objects ?? []) {
      if (obj.is_deleted) continue;
      if (obj.type === "ITEM") items.push(obj as SquareCatalogItem);
      else if (obj.type === "CATEGORY")
        categories.push(obj as SquareCatalogCategory);
      else if (obj.type === "IMAGE") images.push(obj as SquareCatalogImage);
    }

    if (!json.cursor) break;
    cursor = json.cursor;
  }

  return { items, categories, images };
}

// ───────────────────────────────────────────────────────────────────────────
// INVENTORY
// ───────────────────────────────────────────────────────────────────────────

export type SquareInventoryCount = {
  catalog_object_id: string;
  catalog_object_type?: string;
  state?: string;
  location_id: string;
  quantity?: string;
  calculated_at?: string;
};

/**
 * Fetch inventory counts for a set of catalog object IDs across one or
 * more locations. Square's batch-retrieve endpoint accepts up to 1000 IDs
 * per call, so we chunk to be safe.
 */
export async function fetchInventoryCounts(
  accessToken: string,
  catalogObjectIds: string[],
  locationIds: string[],
): Promise<SquareInventoryCount[]> {
  if (catalogObjectIds.length === 0 || locationIds.length === 0) {
    return [];
  }

  const CHUNK = 500;
  const all: SquareInventoryCount[] = [];

  for (let i = 0; i < catalogObjectIds.length; i += CHUNK) {
    const slice = catalogObjectIds.slice(i, i + CHUNK);
    let cursor: string | undefined = undefined;

    for (let page = 0; page < 25; page++) {
      const res = await fetch(
        `${getSquareApiBaseUrl()}/inventory/counts/batch-retrieve`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Square-Version": SQUARE_VERSION,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            catalog_object_ids: slice,
            location_ids: locationIds,
            cursor,
          }),
          cache: "no-store",
        },
      );
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(
          `Square inventory fetch failed (${res.status}): ${body}`,
        );
      }
      const json = (await res.json()) as {
        counts?: SquareInventoryCount[];
        cursor?: string;
      };
      if (json.counts) all.push(...json.counts);
      if (!json.cursor) break;
      cursor = json.cursor;
    }
  }

  return all;
}
