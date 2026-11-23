const { timingSafeEqual } = require("node:crypto");
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function page(message,success=false){return {statusCode:success?200:400,headers:{"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-store","Set-Cookie":"tt_oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/.netlify/functions/tiktok-callback; Max-Age=0"},body:`<!doctype html><html lang="ro"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Carmonela Studio — TikTok</title><body style="background:#10111b;color:white;font:18px system-ui;padding:40px;max-width:650px;margin:auto"><h1>Carmonela Studio</h1><p>${escapeHtml(message)}</p><p><a style="color:#ff7da1" href="/">Înapoi la aplicație</a></p></body></html>`};}
exports.handler=async event=>{
  if(event.httpMethod!=="GET")return {statusCode:405,body:"Method Not Allowed"};
  const {code,state,error}=event.queryStringParameters||{};
  if(error)return page("Autorizarea TikTok a fost anulată sau refuzată.");
  const cookies=event.headers.cookie||event.headers.Cookie||"";
  const match=cookies.match(/(?:^|;\s*)tt_oauth_state=([a-f0-9]{48})(?:;|$)/);
  if(!code||!state||!match||! /^[a-f0-9]{48}$/.test(state)||!timingSafeEqual(Buffer.from(state),Buffer.from(match[1])))return page("Verificarea de securitate a expirat. Reîncearcă conectarea.");
  const key=process.env.TIKTOK_CLIENT_KEY,secret=process.env.TIKTOK_CLIENT_SECRET,redirect=process.env.TIKTOK_REDIRECT_URI;
  if(!key||!secret||!redirect)return page("Variabilele TikTok lipsesc din Netlify.");
  try{
    const res=await fetch("https://open.tiktokapis.com/v2/oauth/token/",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded","Cache-Control":"no-cache"},body:new URLSearchParams({client_key:key,client_secret:secret,code,grant_type:"authorization_code",redirect_uri:redirect})});
    const data=await res.json();
    if(!res.ok||!data.access_token)return page("TikTok nu a acceptat autorizarea. Verifică aplicația și adresa Redirect URI.");
    const profile=await fetch("https://open.tiktokapis.com/v2/user/info/?fields=display_name",{headers:{Authorization:"Bearer "+data.access_token}});
    const info=await profile.json();
    const name=info?.data?.user?.display_name;
    // Tokens are intentionally not saved. This is a connection test, not a posting integration.
    return page("Autorizarea TikTok a funcționat"+(name?" pentru "+name:"")+". Aceasta este doar o verificare; aplicația nu poate publica automat încă.",true);
  }catch{return page("A apărut o eroare temporară la conectarea TikTok.");}
};
