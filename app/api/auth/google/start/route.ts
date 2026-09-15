// Entry point for "Continue with Google" sign-in (identity only - not the
// Gmail-sync connection, which lives on budget-server with its own OAuth
// client config). A signed-ish random `state` cookie is issued here and
// checked on callback to prevent login CSRF, same pattern as the Gmail
// connect flow on the backend.
import crypto from "crypto";

const STATE_COOKIE = "google_login_state";

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_LOGIN_REDIRECT_URI ?? "http://localhost:3010/api/auth/google/callback";
  if (!clientId) {
    return Response.json({ error: "Server misconfigured: GOOGLE_CLIENT_ID is not set" }, { status: 500 });
  }

  const state = crypto.randomBytes(24).toString("hex");
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });

  return new Response(null, {
    status: 302,
    headers: {
      Location: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
      "Set-Cookie": `${STATE_COOKIE}=${state}; HttpOnly; Path=/api/auth; Max-Age=600; SameSite=Lax`,
    },
  });
}
