const { randomBytes } = require("node:crypto");
exports.handler = async () => {
  const key = process.env.TIKTOK_CLIENT_KEY;
  const secret = process.env.TIKTOK_CLIENT_SECRET;
  const redirect = process.env.TIKTOK_REDIRECT_URI;
  if (!key || !secret || !redirect) return {statusCode:503,headers:{"Content-Type":"text/plain; charset=utf-8"},body:"TikTok nu este configurat pe server."};
  const state = randomBytes(24).toString("hex");
  const params = new URLSearchParams({client_key:key,response_type:"code",scope:"user.info.basic",redirect_uri:redirect,state});
  return {statusCode:302,multiValueHeaders:{"Set-Cookie":[`tt_oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/.netlify/functions/tiktok-callback; Max-Age=600`]},headers:{Location:"https://www.tiktok.com/v2/auth/authorize/?"+params.toString(),"Cache-Control":"no-store"},body:""};
};
