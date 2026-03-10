import { describe, it, expect, beforeEach, vi } from "vitest"
import {
  storeTokens,
  getTokens,
  isTokenExpired,
  clearAllData,
} from "@/lib/auth"

describe("auth token management", () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it("stores and retrieves tokens from localStorage", () => {
    storeTokens({
      accessToken: "test-access",
      refreshToken: "test-refresh",
      expiresIn: 3600,
    })
    const tokens = getTokens()
    expect(tokens).not.toBeNull()
    expect(tokens!.accessToken).toBe("test-access")
    expect(tokens!.refreshToken).toBe("test-refresh")
  })

  it("returns null when no tokens stored", () => {
    expect(getTokens()).toBeNull()
  })

  it("detects expired tokens", () => {
    storeTokens({
      accessToken: "test",
      refreshToken: "test",
      expiresIn: -1, // already expired
    })
    expect(isTokenExpired()).toBe(true)
  })

  it("detects valid tokens", () => {
    storeTokens({
      accessToken: "test",
      refreshToken: "test",
      expiresIn: 3600,
    })
    expect(isTokenExpired()).toBe(false)
  })

  it("clears all local data on disconnect", async () => {
    storeTokens({
      accessToken: "test",
      refreshToken: "test",
      expiresIn: 3600,
    })
    await clearAllData()
    expect(getTokens()).toBeNull()
    expect(localStorage.length).toBe(0)
  })
})
