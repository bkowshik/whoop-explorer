import type { VercelRequest, VercelResponse } from "@vercel/node"
import { handleCors } from "../lib/cors.js"

const WHOOP_BASE_URL = "https://api.prod.whoop.com/developer/v2"

const ALLOWED_PATHS = [
  "activity/sleep",
  "activity/workout",
  "activity/recovery",
  "cycle",
  "recovery",
]

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (handleCors(req, res, "GET, OPTIONS")) return
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" })

  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing Authorization header" })
  }

  const pathSegments = req.query.path
  const apiPath = Array.isArray(pathSegments) ? pathSegments.join("/") : pathSegments ?? ""

  // Validate path presence and length
  if (!apiPath || apiPath.length > 256) {
    return res.status(400).json({ error: "Invalid API path" })
  }

  // Decode and validate path for traversal sequences
  const decodedPath = decodeURIComponent(apiPath)
  if (decodedPath.includes("..")) {
    return res.status(400).json({ error: "Invalid API path" })
  }

  // Enforce path allowlist
  const isAllowed = ALLOWED_PATHS.some((allowed) => decodedPath.startsWith(allowed))
  if (!isAllowed) {
    return res.status(403).json({ error: "Forbidden" })
  }

  const url = new URL(`${WHOOP_BASE_URL}/${apiPath}`)
  for (const [key, value] of Object.entries(req.query)) {
    if (key === "path") continue
    if (Array.isArray(value)) {
      value.forEach((v) => url.searchParams.append(key, v))
    } else if (value !== undefined) {
      url.searchParams.append(key, value)
    }
  }

  try {
    const whoopRes = await fetch(url.toString(), {
      headers: { Authorization: authHeader },
    })

    if (!whoopRes.ok) {
      const rateLimitRemaining = whoopRes.headers.get("x-ratelimit-remaining")
      const rateLimitReset = whoopRes.headers.get("x-ratelimit-reset")
      if (rateLimitRemaining) res.setHeader("x-ratelimit-remaining", rateLimitRemaining)
      if (rateLimitReset) res.setHeader("x-ratelimit-reset", rateLimitReset)

      if (whoopRes.status === 401) return res.status(401).json({ error: "Unauthorized" })
      if (whoopRes.status === 429) return res.status(429).json({ error: "Rate limit exceeded" })
      const detail = await whoopRes.text()
      console.error("Upstream API error:", whoopRes.status, detail)
      return res.status(502).json({ error: "Upstream API error" })
    }

    const data = await whoopRes.json()
    return res.status(200).json(data)
  } catch (err) {
    console.error("Fetch error:", err)
    return res.status(502).json({ error: "Failed to reach upstream API" })
  }
}
