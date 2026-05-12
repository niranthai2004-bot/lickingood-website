import { NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";
import {
  fetchSquareLocations,
  getValidAccessToken,
} from "@/lib/square/api";

/**
 * POST /api/square/sync-locations
 *
 * Pulls the authenticated merchant's locations from Square and upserts them
 * into `merchant_locations`. Idempotent — running it again refreshes the
 * cached names/addresses without duplicating rows.
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
  let locations;
  try {
    locations = await fetchSquareLocations(accessToken);
  } catch (e) {
    return NextResponse.json(
      { error: "square_fetch_failed", message: String(e) },
      { status: 502 },
    );
  }

  // Upsert into merchant_locations (service role bypasses RLS)
  const admin = createServiceClient();
  const rows = locations.map((loc) => ({
    merchant_id: merchant.id,
    square_location_id: loc.id,
    location_name: loc.name,
    address: [
      loc.address?.address_line_1,
      loc.address?.address_line_2,
    ]
      .filter(Boolean)
      .join(", ") || null,
    city: loc.address?.locality ?? null,
    state: loc.address?.administrative_district_level_1 ?? null,
    zip: loc.address?.postal_code ?? null,
    is_active: loc.status === "ACTIVE",
  }));

  if (rows.length === 0) {
    return NextResponse.json({ synced: 0, locations: [] });
  }

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
