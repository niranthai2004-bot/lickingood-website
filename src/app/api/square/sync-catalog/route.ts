import { NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";
import {
  fetchInventoryCounts,
  fetchSquareCatalog,
  getValidAccessToken,
  type SquareCatalogItem,
  type SquareInventoryCount,
} from "@/lib/square/api";

/**
 * POST /api/square/sync-catalog
 *
 * Pulls the authenticated merchant's full Square catalog (items, variations,
 * categories, images) plus current inventory counts, and persists everything
 * into our merchant-scoped catalog tables.
 *
 * Idempotent: re-running upserts changes, leaves stable rows in place, and
 * marks anything Square has since deleted/archived as is_archived=true.
 *
 * Auth: caller must be the merchant owner (server-validates via supabase
 * session → merchants.user_id match). Writes happen via service role to
 * bypass RLS for cross-table population.
 */
export async function POST() {
  // ─── 1. Identify the merchant ───
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "not_signed_in" }, { status: 401 });
  }
  const { data: merchant } = await supabase
    .from("merchants")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!merchant) {
    return NextResponse.json({ error: "no_merchant" }, { status: 404 });
  }

  // ─── 2. Resolve a valid Square access token ───
  let accessToken: string;
  try {
    ({ accessToken } = await getValidAccessToken(merchant.id));
  } catch (e) {
    return NextResponse.json(
      { error: "no_square_connection", message: String(e) },
      { status: 400 },
    );
  }

  // ─── 3. Pull catalog (paginated) + the merchant's locations ───
  const admin = createServiceClient();
  let catalog;
  try {
    catalog = await fetchSquareCatalog(accessToken);
  } catch (e) {
    console.error("[Sync Catalog] catalog fetch failed:", e);
    return NextResponse.json(
      { error: "catalog_fetch_failed", message: String(e) },
      { status: 502 },
    );
  }

  const { data: locationRows } = await admin
    .from("merchant_locations")
    .select("id, square_location_id")
    .eq("merchant_id", merchant.id);

  // Map Square location IDs → our internal UUID for quick joins
  const locationByid = new Map<string, string>();
  for (const row of locationRows ?? []) {
    if (row.square_location_id) {
      locationByid.set(row.square_location_id, row.id);
    }
  }

  // ─── 4. Upsert categories ───
  const categoryRows = catalog.categories.map((cat) => ({
    merchant_id: merchant.id,
    square_category_id: cat.id,
    name: cat.category_data?.name ?? "(unnamed)",
    ordinal: cat.category_data?.ordinal ?? 0,
  }));

  if (categoryRows.length > 0) {
    const { error: catErr } = await admin
      .from("merchant_catalog_categories")
      .upsert(categoryRows, { onConflict: "merchant_id,square_category_id" });
    if (catErr) {
      console.error("[Sync Catalog] category upsert failed:", catErr);
      return NextResponse.json(
        { error: "category_persist_failed", message: catErr.message },
        { status: 500 },
      );
    }
  }

  // Pull the UUIDs back so we can FK items to categories
  const { data: storedCats } = await admin
    .from("merchant_catalog_categories")
    .select("id, square_category_id")
    .eq("merchant_id", merchant.id);
  const categoryUuidBySquareId = new Map<string, string>();
  for (const c of storedCats ?? []) {
    if (c.square_category_id) categoryUuidBySquareId.set(c.square_category_id, c.id);
  }

  // ─── 5. Resolve image_id → URL map ───
  const imageUrlById = new Map<string, string>();
  for (const img of catalog.images) {
    if (img.image_data?.url) {
      imageUrlById.set(img.id, img.image_data.url);
    }
  }

  // ─── 6. Upsert items ───
  const itemRows = catalog.items.map((item: SquareCatalogItem) => {
    const primaryImageId = item.item_data?.image_ids?.[0];
    return {
      merchant_id: merchant.id,
      square_item_id: item.id,
      square_category_id: item.item_data?.category_id ?? null,
      category_id: item.item_data?.category_id
        ? categoryUuidBySquareId.get(item.item_data.category_id) ?? null
        : null,
      name: item.item_data?.name ?? "(unnamed item)",
      description: item.item_data?.description ?? null,
      image_url: primaryImageId
        ? imageUrlById.get(primaryImageId) ?? null
        : null,
      is_archived: item.item_data?.is_archived ?? false,
    };
  });

  if (itemRows.length > 0) {
    const { error: itemErr } = await admin
      .from("merchant_catalog_items")
      .upsert(itemRows, { onConflict: "merchant_id,square_item_id" });
    if (itemErr) {
      console.error("[Sync Catalog] item upsert failed:", itemErr);
      return NextResponse.json(
        { error: "item_persist_failed", message: itemErr.message },
        { status: 500 },
      );
    }
  }

  // Map Square item IDs → our UUID
  const { data: storedItems } = await admin
    .from("merchant_catalog_items")
    .select("id, square_item_id")
    .eq("merchant_id", merchant.id);
  const itemUuidBySquareId = new Map<string, string>();
  for (const it of storedItems ?? []) {
    itemUuidBySquareId.set(it.square_item_id, it.id);
  }

  // ─── 7. Flatten variations across all items, upsert ───
  type VariationRow = {
    item_id: string;
    merchant_id: string;
    square_variation_id: string;
    name: string;
    price_cents: number | null;
    currency: string;
    ordinal: number;
  };
  const variationRows: VariationRow[] = [];
  const variationToItemSquareId = new Map<string, string>(); // for inventory join

  for (const item of catalog.items) {
    const itemUuid = itemUuidBySquareId.get(item.id);
    if (!itemUuid) continue;
    for (const variation of item.item_data?.variations ?? []) {
      const data = variation.item_variation_data ?? {};
      variationRows.push({
        item_id: itemUuid,
        merchant_id: merchant.id,
        square_variation_id: variation.id,
        name: data.name ?? "Regular",
        price_cents: data.price_money?.amount ?? null,
        currency: data.price_money?.currency ?? "USD",
        ordinal: data.ordinal ?? 0,
      });
      variationToItemSquareId.set(variation.id, item.id);
    }
  }

  if (variationRows.length > 0) {
    const { error: varErr } = await admin
      .from("merchant_catalog_item_variations")
      .upsert(variationRows, { onConflict: "square_variation_id" });
    if (varErr) {
      console.error("[Sync Catalog] variation upsert failed:", varErr);
      return NextResponse.json(
        { error: "variation_persist_failed", message: varErr.message },
        { status: 500 },
      );
    }
  }

  // ─── 8. Per-location availability ───
  // Square uses a tri-state model: present_at_all_locations vs
  // explicit allow/deny lists. We flatten to one boolean per (item, location).
  const itemLocationRows: Array<{
    item_id: string;
    location_id: string;
    merchant_id: string;
    is_available: boolean;
  }> = [];

  for (const item of catalog.items) {
    const itemUuid = itemUuidBySquareId.get(item.id);
    if (!itemUuid) continue;
    const presentAll = item.present_at_all_locations ?? false;
    const presentIds = new Set(item.present_at_location_ids ?? []);
    const absentIds = new Set(item.absent_at_location_ids ?? []);

    for (const [squareLocId, locUuid] of locationByid.entries()) {
      const available = presentAll
        ? !absentIds.has(squareLocId)
        : presentIds.has(squareLocId);
      itemLocationRows.push({
        item_id: itemUuid,
        location_id: locUuid,
        merchant_id: merchant.id,
        is_available: available,
      });
    }
  }

  if (itemLocationRows.length > 0) {
    const { error: ilErr } = await admin
      .from("merchant_catalog_item_locations")
      .upsert(itemLocationRows, { onConflict: "item_id,location_id" });
    if (ilErr) {
      console.error("[Sync Catalog] item-location upsert failed:", ilErr);
      return NextResponse.json(
        { error: "item_location_persist_failed", message: ilErr.message },
        { status: 500 },
      );
    }
  }

  // ─── 9. Inventory counts ───
  // Square tracks inventory at the variation (not item) level.
  const variationSquareIds = variationRows.map((v) => v.square_variation_id);
  const squareLocationIds = Array.from(locationByid.keys());

  let inventoryUpserts = 0;
  if (variationSquareIds.length > 0 && squareLocationIds.length > 0) {
    let counts: SquareInventoryCount[] = [];
    try {
      counts = await fetchInventoryCounts(
        accessToken,
        variationSquareIds,
        squareLocationIds,
      );
    } catch (e) {
      // Non-fatal: items still sync, just without inventory.
      console.error("[Sync Catalog] inventory fetch failed (non-fatal):", e);
    }

    if (counts.length > 0) {
      // Map our variation UUIDs by Square ID
      const { data: storedVars } = await admin
        .from("merchant_catalog_item_variations")
        .select("id, square_variation_id")
        .eq("merchant_id", merchant.id);
      const variationUuidBySquareId = new Map<string, string>();
      for (const v of storedVars ?? []) {
        variationUuidBySquareId.set(v.square_variation_id, v.id);
      }

      const inventoryRows = counts
        .map((c) => {
          const variationUuid = variationUuidBySquareId.get(c.catalog_object_id);
          const locUuid = locationByid.get(c.location_id);
          if (!variationUuid || !locUuid) return null;
          const qty =
            c.quantity != null ? Number.parseInt(c.quantity, 10) : null;
          return {
            variation_id: variationUuid,
            location_id: locUuid,
            merchant_id: merchant.id,
            stock_count: Number.isFinite(qty as number) ? qty : null,
            state: c.state ?? null,
          };
        })
        .filter((r): r is NonNullable<typeof r> => r !== null);

      if (inventoryRows.length > 0) {
        const { error: invErr } = await admin
          .from("merchant_catalog_inventory")
          .upsert(inventoryRows, {
            onConflict: "variation_id,location_id",
          });
        if (invErr) {
          console.error("[Sync Catalog] inventory upsert failed:", invErr);
          // Non-fatal — items + availability already saved
        } else {
          inventoryUpserts = inventoryRows.length;
        }
      }
    }
  }

  // ─── 10. Mark items deleted in Square as archived locally ───
  // (We only upserted live ones; anything that disappeared since last sync
  // gets flipped to is_archived so the public site stops showing it.)
  const liveSquareItemIds = new Set(catalog.items.map((i) => i.id));
  const { data: allLiveItems } = await admin
    .from("merchant_catalog_items")
    .select("id, square_item_id")
    .eq("merchant_id", merchant.id)
    .eq("is_archived", false);

  const orphanIds = (allLiveItems ?? [])
    .filter((row) => !liveSquareItemIds.has(row.square_item_id))
    .map((row) => row.id);

  if (orphanIds.length > 0) {
    await admin
      .from("merchant_catalog_items")
      .update({ is_archived: true })
      .in("id", orphanIds);
  }

  return NextResponse.json({
    success: true,
    counts: {
      categories: catalog.categories.length,
      items: catalog.items.length,
      variations: variationRows.length,
      itemLocations: itemLocationRows.length,
      inventory: inventoryUpserts,
    },
  });
}
