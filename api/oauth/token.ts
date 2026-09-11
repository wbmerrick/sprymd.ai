import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * Server-side OEM token exchange.
 * Live mode uses OEM client secrets from env.
 * Sandbox mode issues SpryMD tokens so the full OAuth path works without vendor apps.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  const provider = String(body.provider || "");
  const code = String(body.code || "");
  const codeVerifier = String(body.code_verifier || "");
  const redirectUri = String(body.redirect_uri || "");
  const sandbox = Boolean(body.sandbox);

  if (!provider || !code) {
    res.status(400).json({ error: "missing_provider_or_code" });
    return;
  }

  if (sandbox || !process.env[`${provider.toUpperCase()}_CLIENT_SECRET`]) {
    res.status(200).json({
      access_token: `sandbox_access_${provider}_${Date.now()}`,
      refresh_token: `sandbox_refresh_${Date.now()}`,
      token_type: "Bearer",
      expires_in: 3600,
      scope: "read:vitals",
      user_id: `sandbox_${provider}_user`,
      sandbox: true,
    });
    return;
  }

  // Live exchange — provider-specific token URLs can be expanded per OEM.
  const tokenUrls: Record<string, string> = {
    fitbit: "https://api.fitbit.com/oauth2/token",
    oura: "https://api.ouraring.com/oauth/token",
    whoop: "https://api.prod.whoop.com/oauth/oauth2/token",
    withings: "https://wbsapi.withings.net/v2/oauth2",
    garmin: "https://diauth.garmin.com/di-oauth2-token",
    dexcom: "https://sandbox-api.dexcom.com/v2/oauth2/token",
    google_fit: "https://oauth2.googleapis.com/token",
    polar: "https://polarremote.com/v2/oauth2/token",
  };
  const tokenUrl = tokenUrls[provider];
  if (!tokenUrl) {
    res.status(400).json({ error: "unsupported_provider_for_live_exchange" });
    return;
  }

  const clientId = process.env[`${provider.toUpperCase()}_CLIENT_ID`] || process.env[`VITE_${provider.toUpperCase()}_CLIENT_ID`];
  const clientSecret = process.env[`${provider.toUpperCase()}_CLIENT_SECRET`];
  const form = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: clientId || "",
    code_verifier: codeVerifier,
  });

  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded",
    Accept: "application/json",
  };
  if (clientSecret) {
    headers.Authorization = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`;
  }

  const upstream = await fetch(tokenUrl, { method: "POST", headers, body: form.toString() });
  const text = await upstream.text();
  res.status(upstream.status).send(text);
}
