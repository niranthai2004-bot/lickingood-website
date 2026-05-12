import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";
import { exchangeCodeForTokens, getSquareEnvironment } from "@/lib/square/oauth";

/**
 * GET /auth/callback
 *
 * Square redirects here after the merchant approves access.
 * - Verifies the `state` against our http-only cookie.
 * - Exchanges the `code` for tokens.
 * - Looks up the current Supabase merchant via the request's session.
 * - Upserts a row in `square_connections` (service role bypasses RLS).
 * - Redirects the merchant back to the dashboard with a success flag.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");

  console.log("[Auth Callback] Hit", {
    hasCode: !!code,
    hasState: !!state,
    oauthError,
  });

  if (oauthError) {
    return NextResponse.redirect(
      new URL(
        `/merchant/connect-square?error=${encodeURIComponent(oauthError)}`,
        request.url,
      ),
    );
  }
  if (!code || !state) {
    return NextResponse.redirect(
      new URL("/merchant/connect-square?error=missing_params", request.url),
    );
  }

  // CSRF check
  const cookieStore = await cookies();
  const expectedState = cookieStore.get("square_oauth_state")?.value;
  if (!expectedState || expectedState !== state) {
    console.error("[Auth Callback] State mismatch", {
      gotState: state?.slice(0, 8),
      expectedState: expectedState?.slice(0, 8),
    });
    return NextResponse.redirect(
      new URL("/merchant/connect-square?error=invalid_state", request.url),
    );
  }

  // Who is the logged-in merchant?
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(
      new URL("/merchant/login?error=not_signed_in", request.url),
    );
  }
  const { data: merchantRow, error: merchantErr } = await supabase
    .from("merchants")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (merchantErr || !merchantRow) {
    return NextResponse.redirect(
      new URL("/merchant/signup?error=no_merchant_record", request.url),
    );
  }

  // Exchange code → tokens
  let tokens;
  try {
    tokens = await exchangeCodeForTokens(code);
  } catch (e) {
    console.error("[Auth Callback] Token exchange threw:", e);
    return NextResponse.redirect(
      new URL(
        "/merchant/connect-square?error=token_exchange_failed",
        request.url,
      ),
    );
  }

  // Persist tokens with the service role (bypasses RLS — required because
  // we never expose write policies for square_connections to clients).
  const admin = createServiceClient();
  const { error: upsertErr } = await admin
    .from("square_connections")
    .upsert(
      {
        merchant_id: merchantRow.id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        merchant_square_id: tokens.merchant_id,
        expires_at: tokens.expires_at,
        environment: getSquareEnvironment(),
      },
      { onConflict: "merchant_id" },
    );

  if (upsertErr) {
    console.error("[Auth Callback] Failed to persist Square tokens:", upsertErr);
    return NextResponse.redirect(
      new URL(
        "/merchant/connect-square?error=persistence_failed",
        request.url,
      ),
    );
  }

  console.log("[Auth Callback] Connection saved for merchant", merchantRow.id);

  // Clear the state cookie + redirect to the cinematic "connecting" page
  // (which runs location sync in the background then drops on dashboard).
  const res = NextResponse.redirect(
    new URL("/merchant/connecting", request.url),
  );
  res.cookies.delete("square_oauth_state");
  return res;
}
