import { NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";

/**
 * GET /api/admin/merchants
 *
 * Lists every merchant on the platform with enriched fields:
 *   - has_connection : has rows in square_connections
 *   - location_count : active merchant_locations
 *   - item_count     : non-archived merchant_catalog_items
 *
 * Service role bypasses RLS so admins (who have no merchants row of their own)
 * can see everyone. Gated by ADMIN_EMAILS.
 */
export const dynamic = "force-dynamic";

type EnrichedMerchant = {
  id: string;
  business_name: string;
  owner_name: string;
  email: string;
  phone: string | null;
  created_at: string;
  has_connection: boolean;
  location_count: number;
  item_count: number;
};

export async function GET() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "not_signed_in" }, { status: 401 });
  }
  if (!isAdminEmail(user.email)) {
    return NextResponse.json({ error: "not_authorized" }, { status: 403 });
  }

  const admin = createServiceClient();

  const { data: merchants, error } = await admin
    .from("merchants")
    .select("id, business_name, owner_name, email, phone, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[Admin Merchants] list failed:", error);
    return NextResponse.json({ error: "fetch_failed" }, { status: 500 });
  }

  if (!merchants || merchants.length === 0) {
    return NextResponse.json({ merchants: [] });
  }

  const merchantIds = merchants.map((m) => m.id);

  // One round-trip per enrichment dimension is fine — admin lists are small
  // and these queries are indexed.
  const [{ data: connections }, { data: locations }, { data: items }] =
    await Promise.all([
      admin
        .from("square_connections")
        .select("merchant_id")
        .in("merchant_id", merchantIds),
      admin
        .from("merchant_locations")
        .select("merchant_id, is_active")
        .in("merchant_id", merchantIds),
      admin
        .from("merchant_catalog_items")
        .select("merchant_id, is_archived")
        .in("merchant_id", merchantIds),
    ]);

  const connectedSet = new Set(
    (connections ?? []).map((c) => c.merchant_id),
  );
  const locCountByMerchant = new Map<string, number>();
  for (const loc of locations ?? []) {
    if (!loc.is_active) continue;
    locCountByMerchant.set(
      loc.merchant_id,
      (locCountByMerchant.get(loc.merchant_id) ?? 0) + 1,
    );
  }
  const itemCountByMerchant = new Map<string, number>();
  for (const it of items ?? []) {
    if (it.is_archived) continue;
    itemCountByMerchant.set(
      it.merchant_id,
      (itemCountByMerchant.get(it.merchant_id) ?? 0) + 1,
    );
  }

  const enriched: EnrichedMerchant[] = merchants.map((m) => ({
    id: m.id,
    business_name: m.business_name,
    owner_name: m.owner_name,
    email: m.email,
    phone: m.phone,
    created_at: m.created_at,
    has_connection: connectedSet.has(m.id),
    location_count: locCountByMerchant.get(m.id) ?? 0,
    item_count: itemCountByMerchant.get(m.id) ?? 0,
  }));

  return NextResponse.json({ merchants: enriched });
}
