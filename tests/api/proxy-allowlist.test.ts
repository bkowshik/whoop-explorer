import { describe, it, expect, beforeEach, vi, afterEach } from "vitest"

// We test the allowlist logic by importing the handler and mocking fetch
// The handler will be updated to include allowlist checking
const ALLOWED_PATHS = [
  "activity/sleep",
  "activity/workout",
  "activity/recovery",
  "cycle",
  "recovery",
]

function createMockReq(overrides: Record<string, unknown> = {}) {
  return {
    method: "GET",
    headers: {
      origin: "http://localhost:5173",
      authorization: "Bearer test-token",
    },
    query: { path: "activity/sleep" },
    ...overrides,
  }
}

function createMockRes() {
  const headers: Record<string, string> = {}
  const res = {
    statusCode: 200,
    headers,
    body: null as unknown,
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

describe("proxy path allowlist", () => {
  const originalEnv = process.env.VITE_APP_URL

  beforeEach(() => {
    process.env.VITE_APP_URL = "http://localhost:5173"
    vi.stubGlobal("fetch", vi.fn())
  })

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.VITE_APP_URL = originalEnv
    } else {
      delete process.env.VITE_APP_URL
    }
    vi.restoreAllMocks()
  })

  describe("allowed paths", () => {
    it.each(ALLOWED_PATHS)("allows path '%s'", async (path) => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: [] }),
        headers: new Map(),
      })
      vi.stubGlobal("fetch", mockFetch)

      const { default: handler } = await import("../../api/whoop/index")
      const req = createMockReq({ query: { path } })
      const res = createMockRes()

      await handler(req as never, res as never)
      expect(res.statusCode).not.toBe(403)
      expect(mockFetch).toHaveBeenCalled()
    })
  })

  describe("rejected paths", () => {
    it("rejects 'user/profile' with 403", async () => {
      vi.resetModules()
      const { default: handler } = await import("../../api/whoop/index")
      const req = createMockReq({ query: { path: "user/profile" } })
      const res = createMockRes()

      await handler(req as never, res as never)
      expect(res.status).toHaveBeenCalledWith(403)
      expect(res.json).toHaveBeenCalledWith({ error: "Forbidden" })
    })

    it("rejects arbitrary path 'admin/settings' with 403", async () => {
      vi.resetModules()
      const { default: handler } = await import("../../api/whoop/index")
      const req = createMockReq({ query: { path: "admin/settings" } })
      const res = createMockRes()

      await handler(req as never, res as never)
      expect(res.status).toHaveBeenCalledWith(403)
      expect(res.json).toHaveBeenCalledWith({ error: "Forbidden" })
    })

    it("rejects path with traversal sequences '../'", async () => {
      vi.resetModules()
      const { default: handler } = await import("../../api/whoop/index")
      const req = createMockReq({ query: { path: "../../../etc/passwd" } })
      const res = createMockRes()

      await handler(req as never, res as never)
      expect(res.statusCode).toBeLessThan(500)
      expect(res.statusCode).toBeGreaterThanOrEqual(400)
    })

    it("rejects URL-encoded traversal '%2e%2e%2f'", async () => {
      vi.resetModules()
      const { default: handler } = await import("../../api/whoop/index")
      const req = createMockReq({ query: { path: "%2e%2e%2factivity/sleep" } })
      const res = createMockRes()

      await handler(req as never, res as never)
      expect(res.statusCode).toBeGreaterThanOrEqual(400)
      expect(res.statusCode).toBeLessThan(500)
    })
  })
})
