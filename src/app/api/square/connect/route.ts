import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { buildAuthorizationUrl, getSquareAppId } from "@/lib/square/oauth";

/**
 * GET /api/square/connect
 *
 * Initiates the Square OAuth flow.
 * Generates a CSRF-protective `state`, drops it into an http-only cookie,
 * then 302s the merchant to Square's authorize page.
 */
export async function GET(_req: NextRequest) {
  if (!getSquareAppId()) {
    return NextResponse.json(
      {
        error:
          "Square app not configured. Set NEXT_PUBLIC_SQUARE_APP_ID and SQUARE_APP_SECRET in .env.local, then restart `npm run dev`.",
      },
      { status: 500 },
    );
  }

  const state = randomBytes(24).toString("hex");
  const authUrl = buildAuthorizationUrl(state);

  const res = NextResponse.redirect(authUrl);
  res.cookies.set("square_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600, // 10 minutes
  });
  return res;
}
