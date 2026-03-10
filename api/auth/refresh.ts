import type { VercelRequest, VercelResponse } from "@vercel/node"
import { handleCors } from "../lib/cors.js"

const WHOOP_TOKEN_URL = "https://api.prod.whoop.com/oauth/oauth2/token"

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (handleCors(req, res, "POST, OPTIONS")) return
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })

  const { refresh_token } = req.body ?? {}
  if (!refresh_token || typeof refresh_token !== "string") {
    return res.status(400).json({ error: "Missing refresh token" })
  }
  if (refresh_token.length > 2048 || refresh_token.trim().length === 0) {
    return res.status(400).json({ error: "Invalid refresh token" })
  }

  try {
    const tokenRes = await fetch(WHOOP_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token,
        client_id: process.env.WHOOP_CLIENT_ID ?? "",
        client_secret: process.env.WHOOP_CLIENT_SECRET ?? "",
      }),
    })

    if (!tokenRes.ok) {
      const detail = await tokenRes.text()
      const status = tokenRes.status === 401 ? 401 : 502
      console.error("Token refresh failed:", tokenRes.status, detail)
      return res.status(status).json({ error: "Token refresh failed" })
    }

    const tokens = await tokenRes.json()
    return res.status(200).json({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expires_in,
      token_type: tokens.token_type,
    })
  } catch (err) {
    console.error("Token refresh error:", err)
    return res.status(502).json({ error: "Failed to reach token endpoint" })
  }
}
