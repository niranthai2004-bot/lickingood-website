import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import type { PublicLocation } from "@/lib/locations/types";
import {
  getTodayHours,
  type BusinessHoursPeriod,
} from "@/lib/hours";

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
      "slug, location_name, address, city, state, zip, phone, latitude, longitude, timezone, business_hours, pickup_enabled, delivery_enabled",
    )
    .eq("is_active", true)
    .is("archived_at", null)
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

    const periods = (row.business_hours ?? []) as BusinessHoursPeriod[];
    const today = getTodayHours(periods, row.timezone ?? undefined);

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
      image: `https://loremflickr.com/900/1100/donut,bakery,storefront?lock=${
        3000 + i
      }`,
      pickup: row.pickup_enabled ?? true,
      delivery: row.delivery_enabled ?? true,
      timezone: row.timezone ?? null,
      businessHours: periods,
      todayLabel: today.label,
      isOpenNow: today.isOpenNow,
    };
  });

  return NextResponse.json({ locations, count: locations.length });
}
