import type { NextRequest } from "next/server";
import { createSessionCookie } from "../../../../lib/session";

const STATE_COOKIE = "google_login_state";
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_LOGIN_REDIRECT_URI ?? "http://localhost:3010/api/auth/google/callback";
const OWNER_EMAIL = process.env.OWNER_EMAIL;

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const expectedState = request.cookies.get(STATE_COOKIE)?.value ?? null;

  const headers = new Headers();
  headers.append("Set-Cookie", `${STATE_COOKIE}=; Path=/api/auth; Max-Age=0`);

  if (!code || !state || !expectedState || state !== expectedState) {
    return new Response("Invalid or expired sign-in attempt. Go back to /login and try again.", { status: 400, headers });
  }
  if (!CLIENT_ID || !CLIENT_SECRET || !OWNER_EMAIL) {
    return new Response("Server misconfigured: GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET/OWNER_EMAIL must be set in .env.local.", { status: 500, headers });
  }

  let tokens: { access_token?: string };
  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });
    if (!tokenRes.ok) return new Response("Google sign-in failed while exchanging the code.", { status: 502, headers });
    tokens = await tokenRes.json();
  } catch {
    return new Response("Could not reach Google.", { status: 502, headers });
  }
  if (!tokens.access_token) return new Response("Google did not return an access token.", { status: 502, headers });

  const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  if (!userRes.ok) return new Response("Google sign-in failed while fetching your profile.", { status: 502, headers });
  const profile = await userRes.json();
  const email = String(profile.email ?? "").toLowerCase().trim();

  if (!email || email !== OWNER_EMAIL.toLowerCase().trim()) {
    return new Response(`This Google account${email ? ` (${email})` : ""} isn't allowed to sign in to this workspace.`, { status: 403, headers });
  }

  headers.append("Set-Cookie", await createSessionCookie(email));
  headers.set("Location", "/");
  return new Response(null, { status: 302, headers });
}
