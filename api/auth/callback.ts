import type { VercelRequest, VercelResponse } from "@vercel/node"
import { handleCors } from "../lib/cors.js"

const WHOOP_TOKEN_URL = "https://api.prod.whoop.com/oauth/oauth2/token"

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (handleCors(req, res, "POST, OPTIONS")) return
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })

  const { code } = req.body ?? {}
  if (!code || typeof code !== "string") {
    return res.status(400).json({ error: "Missing authorization code" })
  }
  if (code.length > 2048 || code.trim().length === 0) {
    return res.status(400).json({ error: "Invalid authorization code" })
  }

  try {
    const tokenRes = await fetch(WHOOP_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: process.env.WHOOP_CLIENT_ID ?? "",
        client_secret: process.env.WHOOP_CLIENT_SECRET ?? "",
        redirect_uri: process.env.REDIRECT_URI ?? "",
      }),
    })

    if (!tokenRes.ok) {
      const detail = await tokenRes.text()
      console.error("Token exchange failed:", tokenRes.status, detail)
      return res.status(502).json({ error: "Token exchange failed" })
    }

    const tokens = await tokenRes.json()
    return res.status(200).json({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expires_in,
      token_type: tokens.token_type,
    })
  } catch (err) {
    console.error("Token exchange error:", err)
    return res.status(502).json({ error: "Failed to reach token endpoint" })
  }
}
