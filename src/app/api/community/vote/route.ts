import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";

/**
 * POST /api/community/vote
 *
 * Body: { suggestion_id: string }
 *
 * Toggles the caller's vote on a single suggestion:
 *   - if they have NOT voted yet → inserts a row
 *   - if they HAVE voted        → deletes their row
 *
 * Spam protection is database-level (composite PK on (suggestion_id, user_id))
 * + auth requirement (anonymous users get 401). No rate limiting beyond
 * "one user, one vote per suggestion."
 *
 * Returns the new vote_count + has_voted so the UI can update without a
 * full refetch.
 */
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "sign_in_required" }, { status: 401 });
  }

  let body: { suggestion_id?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const suggestionId =
    typeof body.suggestion_id === "string" ? body.suggestion_id : null;
  if (!suggestionId) {
    return NextResponse.json(
      { error: "missing_suggestion_id" },
      { status: 400 },
    );
  }

  // ─── Toggle ───
  // Look at current state, then flip it. We use the user-bound client for
  // the write to ensure RLS sees the right auth.uid().
  const { data: existing } = await supabase
    .from("flavor_votes")
    .select("user_id")
    .eq("suggestion_id", suggestionId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("flavor_votes")
      .delete()
      .eq("suggestion_id", suggestionId)
      .eq("user_id", user.id);
    if (error) {
      console.error("[Vote DELETE] failed:", error);
      return NextResponse.json({ error: "unvote_failed" }, { status: 500 });
    }
  } else {
    const { error } = await supabase.from("flavor_votes").insert({
      suggestion_id: suggestionId,
      user_id: user.id,
    });
    if (error) {
      console.error("[Vote INSERT] failed:", error);
      // Likely the suggestion doesn't exist or was hidden
      return NextResponse.json({ error: "vote_failed" }, { status: 500 });
    }
  }

  // ─── Re-tally for response ───
  const admin = createServiceClient();
  const { count: newCount } = await admin
    .from("flavor_votes")
    .select("suggestion_id", { count: "exact", head: true })
    .eq("suggestion_id", suggestionId);

  return NextResponse.json({
    vote_count: newCount ?? 0,
    has_voted: !existing,
  });
}
