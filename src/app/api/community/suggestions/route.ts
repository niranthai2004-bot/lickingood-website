import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";

/**
 * Community flavor suggestions.
 *
 * GET  → public list (signed in or not). Returns suggestions sorted by
 *        vote count desc, with each entry annotated by `has_voted` if the
 *        caller is signed in.
 *
 * POST → adds a new suggestion. Requires auth; suggestion is attributed
 *        to the caller's user id. Length caps enforced both client-side
 *        and via DB check constraints.
 */
export const dynamic = "force-dynamic";

type SuggestionPayload = {
  id: string;
  name: string;
  description: string | null;
  vote_count: number;
  has_voted: boolean;
  created_at: string;
};

export async function GET() {
  // Service role so the public endpoint can read suggestions + tally votes
  // regardless of caller auth (and so vote totals stay accurate). The
  // is_visible filter still applies for safety.
  const admin = createServiceClient();
  const { data: suggestions, error } = await admin
    .from("flavor_suggestions")
    .select("id, name, description, created_at")
    .eq("is_visible", true)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("[Suggestions GET] read failed:", error);
    return NextResponse.json({ error: "fetch_failed" }, { status: 500 });
  }

  const suggestionIds = (suggestions ?? []).map((s) => s.id);
  if (suggestionIds.length === 0) {
    return NextResponse.json({ suggestions: [] });
  }

  // Tally votes in a single query
  const { data: voteRows } = await admin
    .from("flavor_votes")
    .select("suggestion_id, user_id")
    .in("suggestion_id", suggestionIds);

  const tally = new Map<string, number>();
  for (const row of voteRows ?? []) {
    tally.set(row.suggestion_id, (tally.get(row.suggestion_id) ?? 0) + 1);
  }

  // Determine the current user's votes (if signed in) so the UI can show
  // a filled-in vote button on entries they've voted for.
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userVotedSet = new Set<string>();
  if (user) {
    const { data: mine } = await admin
      .from("flavor_votes")
      .select("suggestion_id")
      .eq("user_id", user.id)
      .in("suggestion_id", suggestionIds);
    userVotedSet = new Set((mine ?? []).map((r) => r.suggestion_id));
  }

  const payload: SuggestionPayload[] = (suggestions ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description ?? null,
    vote_count: tally.get(s.id) ?? 0,
    has_voted: userVotedSet.has(s.id),
    created_at: s.created_at,
  }));

  // Sort: most-voted first, then newest. Ties → newer wins.
  payload.sort(
    (a, b) =>
      b.vote_count - a.vote_count ||
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return NextResponse.json({ suggestions: payload });
}

export async function POST(req: NextRequest) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "sign_in_required" }, { status: 401 });
  }

  let body: { name?: unknown; description?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const descriptionRaw =
    typeof body.description === "string" ? body.description.trim() : "";

  if (name.length < 2) {
    return NextResponse.json({ error: "name_too_short" }, { status: 400 });
  }
  if (name.length > 80) {
    return NextResponse.json({ error: "name_too_long" }, { status: 400 });
  }
  if (descriptionRaw.length > 280) {
    return NextResponse.json(
      { error: "description_too_long" },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("flavor_suggestions")
    .insert({
      name,
      description: descriptionRaw || null,
      created_by_user_id: user.id,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[Suggestions POST] insert failed:", error);
    return NextResponse.json({ error: "insert_failed" }, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}
