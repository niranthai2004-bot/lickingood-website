import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";

/**
 * POST /api/admin/invite-merchant
 *
 * Admin-only: creates a Supabase auth invitation for a new merchant and seeds
 * their merchants + (optionally) merchant_locations rows.
 *
 * Auth:    must be a signed-in user whose email is in ADMIN_EMAILS.
 * Side fx: sends Supabase Auth invite email to the merchant's email address.
 */
export async function POST(req: NextRequest) {
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

  type InviteBody = {
    email: string;
    business_name: string;
    owner_name: string;
    phone?: string;
    store_name?: string;
    city?: string;
    state?: string;
  };

  let body: InviteBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!body.email || !body.business_name || !body.owner_name) {
    return NextResponse.json(
      { error: "missing_required_fields" },
      { status: 400 },
    );
  }

  const admin = createServiceClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  // 1. Send Supabase invite email — creates an auth user pending password setup
  const { data: invited, error: inviteErr } =
    await admin.auth.admin.inviteUserByEmail(body.email, {
      redirectTo: `${appUrl}/merchant/accept-invite`,
      data: {
        business_name: body.business_name,
        owner_name: body.owner_name,
      },
    });
  if (inviteErr || !invited?.user) {
    console.error("[Admin Invite] inviteUserByEmail failed:", inviteErr);
    return NextResponse.json(
      { error: "invite_failed", message: inviteErr?.message ?? "Unknown" },
      { status: 500 },
    );
  }

  // 2. Seed the merchants row tied to the new user
  const { data: merchant, error: merchantErr } = await admin
    .from("merchants")
    .insert({
      user_id: invited.user.id,
      business_name: body.business_name,
      owner_name: body.owner_name,
      email: body.email,
      phone: body.phone || null,
    })
    .select("id")
    .single();

  if (merchantErr || !merchant) {
    console.error("[Admin Invite] merchant insert failed:", merchantErr);
    // Best-effort cleanup of the orphaned auth user
    await admin.auth.admin.deleteUser(invited.user.id).catch(() => {});
    return NextResponse.json(
      { error: "merchant_create_failed", message: merchantErr?.message },
      { status: 500 },
    );
  }

  // 3. Optionally seed an initial location (real Square IDs come from OAuth sync later)
  if (body.store_name) {
    await admin.from("merchant_locations").insert({
      merchant_id: merchant.id,
      location_name: body.store_name,
      city: body.city || null,
      state: body.state || null,
    });
  }

  return NextResponse.json({
    success: true,
    merchant_id: merchant.id,
    invited_user_id: invited.user.id,
  });
}
