import { describe, it, expect, beforeEach, vi, afterEach } from "vitest"

function createMockReq(overrides: Record<string, unknown> = {}) {
  return {
    method: "GET",
    headers: {
      origin: "http://localhost:5173",
      authorization: "Bearer test-token",
    },
    query: { path: "user/measurement/body" },
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

describe("body_measurement proxy", () => {
  const originalEnv = process.env.VITE_APP_URL

  beforeEach(() => {
    process.env.VITE_APP_URL = "http://localhost:5173"
    vi.resetModules()
  })

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.VITE_APP_URL = originalEnv
    } else {
      delete process.env.VITE_APP_URL
    }
    vi.restoreAllMocks()
  })

  it("proxies user/measurement/body successfully", async () => {
    const mockBody = {
      height_meter: 1.83,
      weight_kilogram: 84.5,
      max_heart_rate: 195,
    }
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockBody),
      headers: new Map(),
    })
    vi.stubGlobal("fetch", mockFetch)

    const { default: handler } = await import("../../api/whoop/index")
    const req = createMockReq()
    const res = createMockRes()

    await handler(req as never, res as never)

    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual(mockBody)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("user/measurement/body"),
      expect.objectContaining({
        headers: { Authorization: "Bearer test-token" },
      }),
    )
  })

  it("uses decoded path in upstream URL", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
      headers: new Map(),
    })
    vi.stubGlobal("fetch", mockFetch)

    const { default: handler } = await import("../../api/whoop/index")
    // Simulate URL-encoded path from Vercel rewrite
    const req = createMockReq({ query: { path: "user%2Fmeasurement%2Fbody" } })
    const res = createMockRes()

    await handler(req as never, res as never)

    // Should decode the path and use it correctly
    const calledUrl = mockFetch.mock.calls[0][0] as string
    expect(calledUrl).toContain("user/measurement/body")
    expect(calledUrl).not.toContain("%2F")
  })

  it("returns 502 when upstream fails", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve("Internal Server Error"),
      headers: new Map(),
    })
    vi.stubGlobal("fetch", mockFetch)

    const { default: handler } = await import("../../api/whoop/index")
    const req = createMockReq()
    const res = createMockRes()

    await handler(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(502)
  })
})
