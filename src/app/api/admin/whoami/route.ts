import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";

/**
 * GET /api/admin/whoami
 * Returns 200 with the admin's email if the caller is allowlisted, else 403.
 * Used as a lightweight admin guard for client-side redirects.
 */
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
  return NextResponse.json({ email: user.email });
}
