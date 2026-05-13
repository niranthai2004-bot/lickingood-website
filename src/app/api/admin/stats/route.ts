import { NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";

/**
 * GET /api/admin/stats
 *
 * Returns platform-wide counts for the admin overview page.
 *
 * Why this exists: the admin user has no row in `merchants`, so RLS on
 * the client supabase client blocks every read. Querying via service role
 * here lets admins see real counters.
 *
 * Auth: signed in + email in ADMIN_EMAILS.
 */
export const dynamic = "force-dynamic";

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
  const [
    { count: merchantCount },
    { count: connectedCount },
    { count: locationCount },
    { count: itemCount },
  ] = await Promise.all([
    admin.from("merchants").select("id", { count: "exact", head: true }),
    admin
      .from("square_connections")
      .select("id", { count: "exact", head: true }),
    admin
      .from("merchant_locations")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true),
    admin
      .from("merchant_catalog_items")
      .select("id", { count: "exact", head: true })
      .eq("is_archived", false),
  ]);

  return NextResponse.json({
    merchantCount: merchantCount ?? 0,
    connectedCount: connectedCount ?? 0,
    locationCount: locationCount ?? 0,
    itemCount: itemCount ?? 0,
  });
}
