const { getSession, clearCookie } = require("./tiktok-sandbox-session-lib");
exports.handler = async (event) => {
  if (event.httpMethod !== "GET" && event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };
  const headers = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" };
  if (event.httpMethod === "POST") {
    const origin = event.headers.origin || event.headers.Origin;
    if (origin !== "https://createfolow.netlify.app") return { statusCode: 403, headers, body: JSON.stringify({ error: "Origin nepermis" }) };
    headers["Set-Cookie"] = clearCookie();
    return { statusCode: 200, headers, body: JSON.stringify({ connected: false }) };
  }
  const session = getSession(event);
  return { statusCode: 200, headers, body: JSON.stringify({ connected: !!session, name: session ? session.name : null, expires_at: session ? new Date(session.exp).toISOString() : null }) };
};
