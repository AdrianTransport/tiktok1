const { createCipheriv, createDecipheriv, randomBytes, createHash } = require("node:crypto");
const COOKIE = "tt_sandbox_session";
const MAX_AGE = 3600;
function key() {
  const secret = process.env.TIKTOK_SANDBOX_SESSION_SECRET;
  if (!secret || secret.length < 32) return null;
  return createHash("sha256").update(secret, "utf8").digest();
}
function seal(payload) {
  const k = key();
  if (!k) throw new Error("session_not_configured");
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", k, iv);
  const body = Buffer.concat([cipher.update(JSON.stringify(payload), "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), body]).toString("base64url");
}
function unseal(value) {
  try {
    const k = key();
    if (!k || !value || value.length > 3500) return null;
    const b = Buffer.from(value, "base64url");
    if (b.length < 29) return null;
    const decipher = createDecipheriv("aes-256-gcm", k, b.subarray(0, 12));
    decipher.setAuthTag(b.subarray(12, 28));
    const data = JSON.parse(Buffer.concat([decipher.update(b.subarray(28)), decipher.final()]).toString("utf8"));
    if (!data || !Number.isFinite(data.exp) || Date.now() >= data.exp || typeof data.access_token !== "string") return null;
    return data;
  } catch { return null; }
}
function getSession(event) {
  const cookie = event.headers.cookie || event.headers.Cookie || "";
  const match = cookie.match(/(?:^|;\s*)tt_sandbox_session=([^;]+)/);
  return unseal(match && match[1]);
}
function sessionCookie(value) {
  return COOKIE + "=" + value + "; HttpOnly; Secure; SameSite=Lax; Path=/.netlify/functions/; Max-Age=" + MAX_AGE;
}
function clearCookie() {
  return COOKIE + "=; HttpOnly; Secure; SameSite=Lax; Path=/.netlify/functions/; Max-Age=0";
}
module.exports = { key, seal, getSession, sessionCookie, clearCookie, MAX_AGE };
