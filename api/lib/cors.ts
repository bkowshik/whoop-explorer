import type { VercelRequest, VercelResponse } from "@vercel/node"

/**
 * Validates CORS origin and sets appropriate headers.
 * Returns false (halts request) if VITE_APP_URL is not configured.
 * Returns true (continue processing) otherwise.
 * Only sets CORS headers if the request Origin matches the allowed origin.
 */
export function validateCorsOrigin(
  req: VercelRequest,
  res: VercelResponse,
  allowedMethods: string,
): boolean {
  const allowedOrigin = process.env.VITE_APP_URL
  if (!allowedOrigin) {
    console.error("VITE_APP_URL environment variable is not configured")
    res.status(500).json({ error: "Server configuration error" })
    return false
  }

  const requestOrigin = req.headers.origin
  if (requestOrigin === allowedOrigin) {
    res.setHeader("Access-Control-Allow-Origin", allowedOrigin)
    res.setHeader("Access-Control-Allow-Methods", allowedMethods)
    res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type")
  }

  return true
}

/**
 * Handles CORS for a request. Call at the top of every handler.
 * Returns true if the request has been fully handled (caller should return).
 * Returns false if the caller should continue processing the request.
 */
export function handleCors(
  req: VercelRequest,
  res: VercelResponse,
  allowedMethods: string,
): boolean {
  const valid = validateCorsOrigin(req, res, allowedMethods)
  if (!valid) return true

  if (req.method === "OPTIONS") {
    res.status(200).end()
    return true
  }

  return false
}
