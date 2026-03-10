import { describe, it, expect, beforeEach, vi, afterEach } from "vitest"

function createMockRes() {
  const headers: Record<string, string> = {}
  const res = {
    statusCode: 200,
    body: null as unknown,
    headers,
    setHeader: vi.fn((key: string, value: string) => {
      headers[key] = value
      return res
    }),
    status: vi.fn((code: number) => {
      res.statusCode = code
      return res
    }),
    json: vi.fn((data: unknown) => {
      res.body = data
      return res
    }),
    end: vi.fn(() => res),
  }
  return res
}

describe("error response suppression", () => {
  const originalEnv = process.env.VITE_APP_URL

  beforeEach(() => {
    process.env.VITE_APP_URL = "http://localhost:5173"
    vi.spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.VITE_APP_URL = originalEnv
    } else {
      delete process.env.VITE_APP_URL
    }
    vi.restoreAllMocks()
    vi.resetModules()
  })

  describe("callback error responses", () => {
    it("does not include detail field on upstream failure", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: false,
          status: 500,
          text: () => Promise.resolve("Internal WHOOP error details here"),
        }),
      )

      const { default: handler } = await import("../../api/auth/callback")
      const req = {
        method: "POST",
        headers: { origin: "http://localhost:5173" },
        body: { code: "valid-code" },
      }
      const res = createMockRes()

      await handler(req as never, res as never)
      expect(res.status).toHaveBeenCalledWith(502)
      const responseBody = res.json.mock.calls[0]?.[0] as Record<string, unknown>
      expect(responseBody).toHaveProperty("error", "Token exchange failed")
      expect(responseBody).not.toHaveProperty("detail")
    })
  })

  describe("refresh error responses", () => {
    it("does not include detail field on upstream failure", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: false,
          status: 500,
          text: () => Promise.resolve("Internal WHOOP error details here"),
        }),
      )

      const { default: handler } = await import("../../api/auth/refresh")
      const req = {
        method: "POST",
        headers: { origin: "http://localhost:5173" },
        body: { refresh_token: "valid-token" },
      }
      const res = createMockRes()

      await handler(req as never, res as never)
      expect(res.statusCode).toBeGreaterThanOrEqual(400)
      const responseBody = res.json.mock.calls[0]?.[0] as Record<string, unknown>
      expect(responseBody).toHaveProperty("error", "Token refresh failed")
      expect(responseBody).not.toHaveProperty("detail")
    })
  })

  describe("proxy error responses", () => {
    it("does not include detail field on upstream failure", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: false,
          status: 500,
          text: () => Promise.resolve("Internal WHOOP error details here"),
          headers: new Map(),
        }),
      )

      const { default: handler } = await import("../../api/whoop/index")
      const req = {
        method: "GET",
        headers: {
          origin: "http://localhost:5173",
          authorization: "Bearer test-token",
        },
        query: { path: "activity/sleep" },
      }
      const res = createMockRes()

      await handler(req as never, res as never)
      expect(res.status).toHaveBeenCalledWith(502)
      const responseBody = res.json.mock.calls[0]?.[0] as Record<string, unknown>
      expect(responseBody).toHaveProperty("error", "Upstream API error")
      expect(responseBody).not.toHaveProperty("detail")
    })
  })
})
