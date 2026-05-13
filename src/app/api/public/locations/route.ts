import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import type { PublicLocation } from "@/lib/locations/types";

/**
 * GET /api/public/locations
 *
 * Returns every active merchant location for the customer-facing site —
 * /locations, the pickup picker, and the search dropdown all read from here.
 *
 * Uses the service role to bypass merchant-scoped RLS, then sanitizes the
 * payload to ONLY public-safe fields. No merchant_id, square_location_id,
 * or any internal identifier ever leaves the server.
 */
export const dynamic = "force-dynamic";
export const revalidate = 60; // 1 minute cache window

export async function GET() {
  const admin = createServiceClient();

  const { data, error } = await admin
    .from("merchant_locations")
    .select(
      "slug, location_name, address, city, state, zip, phone, latitude, longitude",
    )
    .eq("is_active", true)
    .not("slug", "is", null)
    .order("state", { ascending: true })
    .order("city", { ascending: true })
    .order("location_name", { ascending: true });

  if (error) {
    console.error("[Public Locations] DB read failed:", error);
    return NextResponse.json(
      { error: "fetch_failed" },
      { status: 500 },
    );
  }

  const locations: PublicLocation[] = (data ?? []).map((row, i) => {
    const fullAddress = [
      row.address,
      row.city,
      row.state && row.zip ? `${row.state} ${row.zip}` : row.state,
    ]
      .filter(Boolean)
      .join(", ");

    return {
      slug: row.slug as string,
      name: row.location_name,
      address: fullAddress || row.address || "",
      city: row.city ?? "",
      state: row.state ?? "",
      zip: row.zip,
      phone: row.phone,
      latitude: row.latitude,
      longitude: row.longitude,
      mapUrl: `https://maps.google.com/?q=${encodeURIComponent(
        fullAddress || row.location_name,
      )}`,
      // Stable placeholder photo per slug — replace with real merchant
      // uploads in a future phase.
      image: `https://loremflickr.com/900/1100/donut,bakery,storefront?lock=${
        3000 + i
      }`,
      // Until per-location channels exist, all active locations support both.
      pickup: true,
      delivery: true,
    };
  });

  return NextResponse.json({ locations, count: locations.length });
}
