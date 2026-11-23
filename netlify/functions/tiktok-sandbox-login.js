const { randomBytes } = require("node:crypto");
exports.handler = async (event) => {
  if (event.httpMethod !== "GET") return { statusCode: 405, body: "Method Not Allowed" };
  const key = process.env.TIKTOK_SANDBOX_CLIENT_KEY;
  const secret = process.env.TIKTOK_SANDBOX_CLIENT_SECRET;
  const redirect = "https://createfolow.netlify.app/.netlify/functions/tiktok-sandbox-callback";
  if (!key || !secret) return { statusCode: 503, body: "Lipsesc credentialele TikTok Sandbox." };
  const state = randomBytes(24).toString("hex");
  const params = new URLSearchParams({ client_key: key, response_type: "code", scope: "user.info.basic,video.upload", redirect_uri: redirect, state });
  return {
    statusCode: 302,
    headers: {
      "Set-Cookie": `tt_sandbox_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/.netlify/functions/tiktok-sandbox-callback; Max-Age=600`,
      Location: "https://www.tiktok.com/v2/auth/authorize/?" + params.toString(),
      "Cache-Control": "no-store"
    },
    body: ""
  };
};
