// Single-owner session: a signed cookie proving the browser completed
// Google sign-in as OWNER_EMAIL. No user accounts - this app has exactly
// one legitimate user (see PRODUCT.md), so "session" just means "this
// browser signed in as the owner's Google account, recently enough."
// Uses Web Crypto (not Node's `crypto` module) so it works whether this
// runs under the Node.js or Edge middleware runtime.

export const SESSION_COOKIE = "folio_session";
const MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

function textEncode(value: string) {
  return new TextEncoder().encode(value);
}

function toBase64Url(bytes: ArrayBuffer | Uint8Array) {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  for (const b of arr) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const pad = (4 - (padded.length % 4)) % 4;
  const binary = atob(padded + "=".repeat(pad));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function importKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET must be set");
  return crypto.subtle.importKey("raw", textEncode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export async function createSessionCookie(email: string): Promise<string> {
  const key = await importKey();
  const payload = toBase64Url(textEncode(JSON.stringify({ email, exp: Date.now() + MAX_AGE_SECONDS * 1000 })));
  const signature = toBase64Url(await crypto.subtle.sign("HMAC", key, textEncode(payload)));
  return `${SESSION_COOKIE}=${payload}.${signature}; HttpOnly; Path=/; Max-Age=${MAX_AGE_SECONDS}; SameSite=Lax`;
}

export function clearSessionCookie(): string {
  return `${SESSION_COOKIE}=; Path=/; Max-Age=0`;
}

export async function verifySessionToken(token: string): Promise<string | null> {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  try {
    const key = await importKey();
    const valid = await crypto.subtle.verify("HMAC", key, fromBase64Url(signature) as BufferSource, textEncode(payload));
    if (!valid) return null;
    const { email, exp } = JSON.parse(new TextDecoder().decode(fromBase64Url(payload)));
    if (typeof email !== "string" || typeof exp !== "number" || Date.now() > exp) return null;
    return email;
  } catch {
    return null;
  }
}
