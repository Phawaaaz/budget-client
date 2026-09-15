// Thin server-side proxy to budget-server. Every route under app/api/*
// (except the Google OAuth pair, which links straight to the backend)
// runs through this so BUDGET_API_KEY never reaches the browser bundle -
// only this Next.js server process holds it.

const BASE_URL = process.env.BUDGET_API_URL ?? "http://localhost:3000";
const API_KEY = process.env.BUDGET_API_KEY;

export async function proxy(path: string, init: RequestInit = {}): Promise<Response> {
  if (!API_KEY) {
    return Response.json(
      { error: "Server misconfigured: BUDGET_API_KEY is not set (see .env.local)" },
      { status: 500 }
    );
  }

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${API_KEY}`);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${BASE_URL}${path}`, { ...init, headers, cache: "no-store" });
  } catch {
    return Response.json({ error: "Could not reach budget-server" }, { status: 502 });
  }

  // 204/205/304 are null-body statuses - the Response constructor throws if
  // given a body (even "") alongside one of these, so pass null explicitly.
  if (upstream.status === 204 || upstream.status === 205 || upstream.status === 304) {
    return new Response(null, { status: upstream.status });
  }

  const body = await upstream.text();
  return new Response(body, {
    status: upstream.status,
    headers: { "Content-Type": upstream.headers.get("Content-Type") ?? "application/json" },
  });
}
