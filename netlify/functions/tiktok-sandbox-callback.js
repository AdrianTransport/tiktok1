const { timingSafeEqual } = require("node:crypto");
const { key: sessionKey, seal, sessionCookie } = require("./tiktok-sandbox-session-lib");
const redirect = "https://createfolow.netlify.app/.netlify/functions/tiktok-sandbox-callback";
function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
function page(message, success = false, extraCookie = null) {
  return {
    statusCode: success ? 200 : 400,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "Set-Cookie": extraCookie ? undefined : "tt_sandbox_state=; HttpOnly; Secure; SameSite=Lax; Path=/.netlify/functions/tiktok-sandbox-callback; Max-Age=0"
    },
    multiValueHeaders: extraCookie ? { "Set-Cookie": ["tt_sandbox_state=; HttpOnly; Secure; SameSite=Lax; Path=/.netlify/functions/tiktok-sandbox-callback; Max-Age=0", extraCookie] } : undefined,
    body: `<!doctype html><html lang="ro"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>TikTok Sandbox</title><body style="background:#10111b;color:white;font:18px system-ui;padding:40px;max-width:650px;margin:auto"><h1>Carmonela Studio — Sandbox</h1><p>${escapeHtml(message)}</p><p><a style="color:#ff7da1" href="/">Înapoi la aplicație</a></p></body></html>`
  };
}
exports.handler = async (event) => {
  if (event.httpMethod !== "GET") return { statusCode: 405, body: "Method Not Allowed" };
  const { code, state, error } = event.queryStringParameters || {};
  if (error) return page("Autorizarea TikTok Sandbox a fost refuzată.");
  const cookies = event.headers.cookie || event.headers.Cookie || "";
  const match = cookies.match(/(?:^|;\s*)tt_sandbox_state=([a-f0-9]{48})(?:;|$)/);
  if (!code || !state || !match || !/^[a-f0-9]{48}$/.test(state) || !timingSafeEqual(Buffer.from(state), Buffer.from(match[1]))) return page("Verificarea de securitate a expirat. Reîncearcă.");
  const key = process.env.TIKTOK_SANDBOX_CLIENT_KEY;
  const secret = process.env.TIKTOK_SANDBOX_CLIENT_SECRET;
  if (!key || !secret) return page("Lipsesc credentialele Sandbox din Netlify.");
  if (!sessionKey()) return page("Lipsește TIKTOK_SANDBOX_SESSION_SECRET din Netlify (minimum 32 de caractere).");
  try {
    const res = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", "Cache-Control": "no-cache" },
      body: new URLSearchParams({ client_key: key, client_secret: secret, code, grant_type: "authorization_code", redirect_uri: redirect })
    });
    const data = await res.json();
    if (!res.ok || !data.access_token) return page("TikTok nu a acceptat autorizarea Sandbox. Verifică Redirect URI și contul de test.");
    const profile = await fetch("https://open.tiktokapis.com/v2/user/info/?fields=display_name", { headers: { Authorization: "Bearer " + data.access_token } });
    const info = await profile.json();
    const name = info?.data?.user?.display_name;
    if (!data.refresh_token || !data.expires_in) return page("TikTok nu a furnizat datele necesare sesiunii.");
    const exp = Date.now() + Math.min(Number(data.expires_in) * 1000, 3600000);
    const cookie = sessionCookie(seal({ access_token: data.access_token, refresh_token: data.refresh_token, exp, name: name || "Cont TikTok", scope: data.scope || "" }));
    return page("Conectarea Sandbox a funcționat" + (name ? " pentru " + name : "") + ". Sesiunea criptată este activă maximum o oră. Nu se publică videoclipuri.", true, cookie);
  } catch {
    return page("Eroare temporară la conectarea Sandbox.");
  }
};
