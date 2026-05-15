import { NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";
import {
  fetchSquareLocations,
  getValidAccessToken,
  type SquareLocation,
} from "@/lib/square/api";
import { slugify, slugWithSuffix } from "@/lib/locations/slug";

/**
 * POST /api/square/sync-locations
 *
 * Pulls the authenticated merchant's locations from Square and upserts them
 * into `merchant_locations`. Idempotent — running it again refreshes the
 * cached names/addresses without duplicating rows.
 *
 * Populates phone + lat/lng + a URL-safe slug for the public-facing site.
 * Slug collisions are resolved by appending the last 4 chars of the Square
 * location ID, so retries remain deterministic.
 */
export async function POST() {
  // Who's the calling merchant?
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

  // Get a valid access token (refreshes if near expiry)
  let accessToken: string;
  try {
    ({ accessToken } = await getValidAccessToken(merchant.id));
  } catch (e) {
    return NextResponse.json(
      { error: "no_square_connection", message: String(e) },
      { status: 400 },
    );
  }

  // Pull locations
  let locations: SquareLocation[];
  try {
    locations = await fetchSquareLocations(accessToken);
  } catch (e) {
    return NextResponse.json(
      { error: "square_fetch_failed", message: String(e) },
      { status: 502 },
    );
  }

  if (locations.length === 0) {
    return NextResponse.json({ synced: 0, locations: [] });
  }

  // ─── Look up archived locations so the upsert doesn't resurrect them ───
  // Once a merchant archives a Square location locally, re-pulling from
  // Square should NOT bring it back unless they explicitly un-archive.
  const admin = createServiceClient();
  const { data: archivedRows } = await admin
    .from("merchant_locations")
    .select("square_location_id")
    .eq("merchant_id", merchant.id)
    .not("archived_at", "is", null);

  const archivedSquareIds = new Set(
    (archivedRows ?? [])
      .map((r) => r.square_location_id)
      .filter((id): id is string => !!id),
  );

  // Skip archived Square locations from the upsert payload entirely.
  const liveLocations = locations.filter(
    (l) => !archivedSquareIds.has(l.id),
  );

  if (liveLocations.length === 0) {
    return NextResponse.json({ synced: 0, locations: [] });
  }

  // ─── Resolve slug collisions against the rest of the platform ───
  const desiredSlugs = liveLocations.map((l) => slugify(l.name));
  const { data: clashing } = await admin
    .from("merchant_locations")
    .select("slug, square_location_id")
    .in("slug", desiredSlugs);

  // Map of slug → owning square_location_id. If our incoming Square ID matches
  // the existing owner of that slug, we keep it (idempotent re-sync).
  const slugOwner = new Map<string, string | null>();
  for (const row of clashing ?? []) {
    if (row.slug) slugOwner.set(row.slug, row.square_location_id ?? null);
  }

  const rows = liveLocations.map((loc) => {
    const base = slugify(loc.name);
    const owner = slugOwner.get(base);
    const finalSlug =
      owner == null || owner === loc.id
        ? base
        : slugWithSuffix(loc.name, loc.id);

    const address = [loc.address?.address_line_1, loc.address?.address_line_2]
      .filter(Boolean)
      .join(", ");

    return {
      merchant_id: merchant.id,
      square_location_id: loc.id,
      location_name: loc.name,
      slug: finalSlug || null,
      address: address || null,
      city: loc.address?.locality ?? null,
      state: loc.address?.administrative_district_level_1 ?? null,
      zip: loc.address?.postal_code ?? null,
      phone: loc.phone_number ?? null,
      latitude: loc.coordinates?.latitude ?? null,
      longitude: loc.coordinates?.longitude ?? null,
      timezone: loc.timezone ?? null,
      business_hours: loc.business_hours?.periods ?? [],
      business_email: loc.business_email ?? null,
      description: loc.description ?? null,
      is_active: loc.status === "ACTIVE",
      // pickup_enabled / delivery_enabled are INTENTIONALLY omitted from the
      // upsert payload so that re-syncing preserves the merchant's choices.
      // New rows get the DB defaults (both TRUE) on first insert.
    };
  });

  const { error: upsertErr } = await admin
    .from("merchant_locations")
    .upsert(rows, { onConflict: "merchant_id,square_location_id" });

  if (upsertErr) {
    return NextResponse.json(
      { error: "persistence_failed", message: upsertErr.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ synced: rows.length, locations: rows });
}
