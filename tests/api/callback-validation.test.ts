import { describe, it, expect, beforeEach, vi, afterEach } from "vitest"

function createMockReq(overrides: Record<string, unknown> = {}) {
  return {
    method: "POST",
    headers: { origin: "http://localhost:5173" },
    body: { code: "valid-auth-code" },
    ...overrides,
  }
}

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

describe("callback input validation", () => {
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
    vi.resetModules()
  })

  it("rejects missing body with 400", async () => {
    const { default: handler } = await import("../../api/auth/callback")
    const req = createMockReq({ body: undefined })
    const res = createMockRes()

    await handler(req as never, res as never)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it("rejects non-string code with 400", async () => {
    const { default: handler } = await import("../../api/auth/callback")
    const req = createMockReq({ body: { code: 12345 } })
    const res = createMockRes()

    await handler(req as never, res as never)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining("authorization code") }),
    )
  })

  it("rejects code longer than 2048 chars with 400", async () => {
    const { default: handler } = await import("../../api/auth/callback")
    const req = createMockReq({ body: { code: "x".repeat(2049) } })
    const res = createMockRes()

    await handler(req as never, res as never)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining("authorization code") }),
    )
  })

  it("rejects whitespace-only code with 400", async () => {
    const { default: handler } = await import("../../api/auth/callback")
    const req = createMockReq({ body: { code: "   " } })
    const res = createMockRes()

    await handler(req as never, res as never)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it("does not call upstream API for invalid input", async () => {
    const mockFetch = vi.fn()
    vi.stubGlobal("fetch", mockFetch)

    const { default: handler } = await import("../../api/auth/callback")
    const req = createMockReq({ body: { code: 12345 } })
    const res = createMockRes()

    await handler(req as never, res as never)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it("accepts valid string code and calls upstream API", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          access_token: "at",
          refresh_token: "rt",
          expires_in: 3600,
          token_type: "bearer",
        }),
    })
    vi.stubGlobal("fetch", mockFetch)

    const { default: handler } = await import("../../api/auth/callback")
    const req = createMockReq({ body: { code: "valid-code-123" } })
    const res = createMockRes()

    await handler(req as never, res as never)
    expect(mockFetch).toHaveBeenCalled()
    expect(res.statusCode).toBe(200)
  })
})
