import { describe, it, expect, beforeEach, vi, afterEach } from "vitest"
import { handleCors, validateCorsOrigin } from "../../api/lib/cors"

function createMockReq(overrides: Record<string, unknown> = {}) {
  return {
    method: "GET",
    headers: { origin: "http://localhost:5173" },
    ...overrides,
  }
}

function createMockRes() {
  const headers: Record<string, string> = {}
  const res = {
    statusCode: 200,
    headers,
    setHeader: vi.fn((key: string, value: string) => {
      headers[key] = value
      return res
    }),
    status: vi.fn((code: number) => {
      res.statusCode = code
      return res
    }),
    json: vi.fn(() => res),
    end: vi.fn(() => res),
  }
  return res
}

describe("CORS helper", () => {
  const originalEnv = process.env.VITE_APP_URL

  beforeEach(() => {
    process.env.VITE_APP_URL = "http://localhost:5173"
  })

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.VITE_APP_URL = originalEnv
    } else {
      delete process.env.VITE_APP_URL
    }
  })

  describe("validateCorsOrigin", () => {
    it("returns 500 when VITE_APP_URL is not set", () => {
      delete process.env.VITE_APP_URL
      const req = createMockReq()
      const res = createMockRes()

      const result = validateCorsOrigin(req as never, res as never, "POST, OPTIONS")
      expect(result).toBe(false)
      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({ error: "Server configuration error" })
    })

    it("sets CORS headers when origin matches", () => {
      const req = createMockReq({ headers: { origin: "http://localhost:5173" } })
      const res = createMockRes()

      const result = validateCorsOrigin(req as never, res as never, "POST, OPTIONS")
      expect(result).toBe(true)
      expect(res.setHeader).toHaveBeenCalledWith("Access-Control-Allow-Origin", "http://localhost:5173")
      expect(res.setHeader).toHaveBeenCalledWith("Access-Control-Allow-Methods", "POST, OPTIONS")
    })

    it("omits CORS headers when origin does not match", () => {
      const req = createMockReq({ headers: { origin: "https://evil.com" } })
      const res = createMockRes()

      const result = validateCorsOrigin(req as never, res as never, "POST, OPTIONS")
      expect(result).toBe(true)
      expect(res.setHeader).not.toHaveBeenCalledWith(
        "Access-Control-Allow-Origin",
        expect.anything(),
      )
    })

    it("never falls back to wildcard '*' origin", () => {
      delete process.env.VITE_APP_URL
      const req = createMockReq()
      const res = createMockRes()

      validateCorsOrigin(req as never, res as never, "POST, OPTIONS")
      const setHeaderCalls = res.setHeader.mock.calls
      const originCalls = setHeaderCalls.filter(
        ([key]: [string]) => key === "Access-Control-Allow-Origin",
      )
      originCalls.forEach(([, value]: [string, string]) => {
        expect(value).not.toBe("*")
      })
    })
  })

  describe("handleCors (OPTIONS preflight)", () => {
    it("returns true and ends response for OPTIONS with matching origin", () => {
      const req = createMockReq({ method: "OPTIONS", headers: { origin: "http://localhost:5173" } })
      const res = createMockRes()

      const handled = handleCors(req as never, res as never, "POST, OPTIONS")
      expect(handled).toBe(true)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.end).toHaveBeenCalled()
    })

    it("returns true for OPTIONS even with non-matching origin (ends preflight)", () => {
      const req = createMockReq({ method: "OPTIONS", headers: { origin: "https://evil.com" } })
      const res = createMockRes()

      const handled = handleCors(req as never, res as never, "POST, OPTIONS")
      expect(handled).toBe(true)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.end).toHaveBeenCalled()
    })

    it("returns false for non-OPTIONS methods", () => {
      const req = createMockReq({ method: "POST", headers: { origin: "http://localhost:5173" } })
      const res = createMockRes()

      const handled = handleCors(req as never, res as never, "POST, OPTIONS")
      expect(handled).toBe(false)
    })

    it("returns true (halts) when VITE_APP_URL is missing even for non-OPTIONS", () => {
      delete process.env.VITE_APP_URL
      const req = createMockReq({ method: "POST" })
      const res = createMockRes()

      const handled = handleCors(req as never, res as never, "POST, OPTIONS")
      expect(handled).toBe(true)
      expect(res.status).toHaveBeenCalledWith(500)
    })
  })
})
