import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/locations/slug";

/**
 * GET /api/public/locations/[slug]/menu
 *
 * Returns the customer-ordering payload for a single merchant location:
 *  - location header info (name, address, phone, map link)
 *  - dynamic category tabs (from the merchant's Square catalog, not hardcoded)
 *  - items available at THIS location, with prices, images, sold-out filtering
 *
 * The endpoint is the only data source the customer-facing pickup page uses;
 * the hardcoded menuFull.ts data module is no longer consulted on this route.
 *
 * Uses the service role to bypass RLS (cross-merchant public read), then
 * sanitizes the output to public-safe fields only — no merchant_id,
 * square_item_id, or any internal identifier leaks to the browser.
 */
export const dynamic = "force-dynamic";
export const revalidate = 30;

type AvailabilityState = "fresh" | "limited" | "almost-gone" | "sold-out";

// Bundle tier heuristic. Square doesn't carry "tier" semantics, so we infer
// it from category + name keywords. Donut shops typically mark cake / mochi
// / fritter / cinnamon roll as premium, glazed as basic, everything else
// in between. The frontend bundle pricing tables already exist; we just
// hand each item a tier label so the existing calculator works unchanged.
type BundleTier = "basic" | "standard" | "premium";

function inferBundleTier(
  categoryName: string | null,
  itemName: string,
): BundleTier {
  const cat = (categoryName ?? "").toLowerCase();
  const name = itemName.toLowerCase();
  if (
    name.includes("mochi") ||
    name.includes("fritter") ||
    name.includes("cinnamon roll") ||
    name.includes("cake") ||
    cat.includes("specialty") ||
    cat.includes("premium")
  ) {
    return "premium";
  }
  if (
    name.includes("glazed") &&
    !name.includes("chocolate") &&
    !name.includes("maple")
  ) {
    return "basic";
  }
  return "standard";
}

function inferDozenEligible(
  categoryName: string | null,
  itemName: string,
): boolean {
  const blob = `${categoryName ?? ""} ${itemName}`.toLowerCase();
  // Anything that's a single drink, bottled beverage, kolache, or breakfast
  // sandwich shouldn't count toward a donut box.
  if (
    blob.includes("coffee") ||
    blob.includes("juice") ||
    blob.includes("milk") ||
    blob.includes("tea") ||
    blob.includes("drink") ||
    blob.includes("frapp") ||
    blob.includes("kolache") ||
    blob.includes("biscuit") ||
    blob.includes("croissant") ||
    blob.includes("sandwich") ||
    blob.includes("sausage") ||
    blob.includes("dozen") // "Donut Holes (Dozen)" already pre-bundled
  ) {
    return false;
  }
  return true;
}

function inferAvailability(
  stockCount: number | null,
  state: string | null,
  isAvailable: boolean,
): AvailabilityState {
  if (!isAvailable) return "sold-out";
  if (state && state.toUpperCase() === "OUT_OF_STOCK") return "sold-out";
  if (stockCount == null) return "fresh";
  if (stockCount <= 0) return "sold-out";
  if (stockCount <= 6) return "almost-gone";
  if (stockCount <= 18) return "limited";
  return "fresh";
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  if (!slug) {
    return NextResponse.json({ error: "missing_slug" }, { status: 400 });
  }

  const admin = createServiceClient();

  // ─── 1. Resolve the location ───
  const { data: loc } = await admin
    .from("merchant_locations")
    .select(
      "id, merchant_id, location_name, address, city, state, zip, phone, slug, is_active",
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .is("archived_at", null)
    .maybeSingle();

  if (!loc) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const fullAddress = [
    loc.address,
    loc.city,
    loc.state && loc.zip ? `${loc.state} ${loc.zip}` : loc.state,
  ]
    .filter(Boolean)
    .join(", ");

  // ─── 2. Available items at this location ───
  // RLS doesn't permit cross-merchant access from the anon client; this is
  // the service role so we can read globally, then aggressively filter.
  const { data: avails } = await admin
    .from("merchant_catalog_item_locations")
    .select(
      "is_available, item:merchant_catalog_items!inner(id, name, description, image_url, is_archived, category_id, square_item_id)",
    )
    .eq("location_id", loc.id)
    .eq("merchant_id", loc.merchant_id)
    .eq("is_available", true);

  type AvailRow = {
    is_available: boolean;
    item: {
      id: string;
      name: string;
      description: string | null;
      image_url: string | null;
      is_archived: boolean;
      category_id: string | null;
      square_item_id: string;
    };
  };

  const liveItems = ((avails ?? []) as unknown as AvailRow[])
    .map((row) => row.item)
    .filter((it) => it && !it.is_archived);

  if (liveItems.length === 0) {
    return NextResponse.json({
      location: locationPayload(loc, fullAddress),
      categories: [],
      items: [],
    });
  }

  // ─── 3. Pull categories so we can label tabs ───
  const categoryIds = Array.from(
    new Set(liveItems.map((it) => it.category_id).filter(Boolean)),
  ) as string[];
  const categoriesById = new Map<
    string,
    { id: string; name: string; ordinal: number }
  >();

  if (categoryIds.length > 0) {
    const { data: catRows } = await admin
      .from("merchant_catalog_categories")
      .select("id, name, ordinal")
      .in("id", categoryIds);
    for (const row of catRows ?? []) {
      categoriesById.set(row.id, {
        id: row.id,
        name: row.name,
        ordinal: row.ordinal ?? 0,
      });
    }
  }

  // ─── 4. First variation per item (for price) ───
  const itemUuids = liveItems.map((it) => it.id);
  const { data: variations } = await admin
    .from("merchant_catalog_item_variations")
    .select("id, item_id, square_variation_id, price_cents, ordinal")
    .in("item_id", itemUuids)
    .order("ordinal", { ascending: true });

  const firstVariationByItem = new Map<
    string,
    { id: string; square_variation_id: string; price_cents: number | null }
  >();
  for (const v of variations ?? []) {
    if (!firstVariationByItem.has(v.item_id)) {
      firstVariationByItem.set(v.item_id, {
        id: v.id,
        square_variation_id: v.square_variation_id,
        price_cents: v.price_cents,
      });
    }
  }

  // ─── 5. Inventory state for those variations at this location ───
  const variationIds = Array.from(firstVariationByItem.values()).map(
    (v) => v.id,
  );
  const inventoryByVariation = new Map<
    string,
    { stock_count: number | null; state: string | null }
  >();
  if (variationIds.length > 0) {
    const { data: invRows } = await admin
      .from("merchant_catalog_inventory")
      .select("variation_id, stock_count, state")
      .eq("location_id", loc.id)
      .in("variation_id", variationIds);
    for (const inv of invRows ?? []) {
      inventoryByVariation.set(inv.variation_id, {
        stock_count: inv.stock_count,
        state: inv.state,
      });
    }
  }

  // ─── 6. Assemble public items + tabs ───
  const seenCategoryIds = new Set<string>();
  const items = liveItems
    .map((it, idx) => {
      const variation = firstVariationByItem.get(it.id);
      const inv = variation ? inventoryByVariation.get(variation.id) : null;
      const availability = inferAvailability(
        inv?.stock_count ?? null,
        inv?.state ?? null,
        true,
      );

      // Sold-out items are filtered out entirely from public display
      if (availability === "sold-out") return null;

      const cat = it.category_id ? categoriesById.get(it.category_id) : null;
      const categoryName = cat?.name ?? "Menu";
      const categorySlug = slugify(categoryName) || "menu";
      seenCategoryIds.add(categorySlug);

      return {
        id: it.id,
        name: it.name,
        description: it.description ?? "",
        category: categorySlug,
        image:
          it.image_url ??
          `https://loremflickr.com/900/720/donut,bakery?lock=${4000 + idx}`,
        // Tone is purely visual fallback; pick a neutral cream tone.
        tone: "bg-cream-100",
        price: variation?.price_cents != null ? variation.price_cents / 100 : 0,
        bundleTier: inferBundleTier(cat?.name ?? null, it.name),
        dozenEligible: inferDozenEligible(cat?.name ?? null, it.name),
        availability,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const categories = Array.from(seenCategoryIds).map((catSlug) => {
    // Find a category whose slug matches; use its real name as the label
    // (and its ordinal for sorting). If multiple categories slugify to the
    // same id, just take the first hit.
    const match = Array.from(categoriesById.values()).find(
      (c) => slugify(c.name) === catSlug,
    );
    return {
      id: catSlug,
      label: match?.name ?? capitalize(catSlug),
      ordinal: match?.ordinal ?? 999,
    };
  });

  categories.sort((a, b) => a.ordinal - b.ordinal || a.label.localeCompare(b.label));

  return NextResponse.json({
    location: locationPayload(loc, fullAddress),
    categories: categories.map(({ id, label }) => ({ id, label })),
    items,
  });
}

// ─── Helpers ───

function locationPayload(
  loc: {
    location_name: string;
    address: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
    phone: string | null;
    slug: string | null;
  },
  fullAddress: string,
) {
  return {
    slug: loc.slug ?? "",
    name: loc.location_name,
    address: fullAddress || loc.address || "",
    city: loc.city ?? "",
    state: loc.state ?? "",
    zip: loc.zip,
    phone: loc.phone,
    mapUrl: `https://maps.google.com/?q=${encodeURIComponent(
      fullAddress || loc.location_name,
    )}`,
  };
}

function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, " ");
}
