import { clear } from "idb-keyval"

const TOKEN_KEY = "whoop_tokens"

interface StoredTokens {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

export function storeTokens({
  accessToken,
  refreshToken,
  expiresIn,
}: {
  accessToken: string
  refreshToken: string
  expiresIn: number
}) {
  const data: StoredTokens = {
    accessToken,
    refreshToken,
    expiresAt: Date.now() + expiresIn * 1000,
  }
  localStorage.setItem(TOKEN_KEY, JSON.stringify(data))
}

export function getTokens(): StoredTokens | null {
  const raw = localStorage.getItem(TOKEN_KEY)
  if (!raw) return null
  return JSON.parse(raw) as StoredTokens
}

export function isTokenExpired(): boolean {
  const tokens = getTokens()
  if (!tokens) return true
  return Date.now() >= tokens.expiresAt
}

export async function clearAllData(): Promise<void> {
  localStorage.removeItem(TOKEN_KEY)
  await clear()
}
