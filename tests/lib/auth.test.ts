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

  it("clears only app-specific localStorage keys, not all keys", async () => {
    // Store app tokens
    storeTokens({
      accessToken: "test",
      refreshToken: "test",
      expiresIn: 3600,
    })
    // Store a non-app key
    localStorage.setItem("other_app_key", "should_survive")

    await clearAllData()

    // App tokens should be gone
    expect(getTokens()).toBeNull()
    // Non-app key should survive
    expect(localStorage.getItem("other_app_key")).toBe("should_survive")
  })
})
