import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { createElement } from "react"
import { storeTokens, getTokens, isTokenExpired, clearAllData } from "@/lib/auth"
import { queryClient } from "@/lib/query-config"

const WHOOP_AUTH_URL = "https://api.prod.whoop.com/oauth/oauth2/auth"
const SCOPES = "offline read:profile read:body_measurement read:cycles read:sleep read:recovery read:workout"
const STATE_KEY = "whoop_oauth_state"

function generateState(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("")
}

export function verifyAndConsumeState(returnedState: string | null): boolean {
  const stored = sessionStorage.getItem(STATE_KEY)
  sessionStorage.removeItem(STATE_KEY)
  if (!stored || !returnedState) return false
  return stored === returnedState
}

interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
}

interface AuthContextValue extends AuthState {
  login: () => void
  handleCallback: (code: string) => Promise<void>
  logout: () => Promise<void>
  refreshAccessToken: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function getAppUrl(): string {
  return import.meta.env.VITE_APP_URL ?? window.location.origin
}

function getClientId(): string {
  return import.meta.env.VITE_WHOOP_CLIENT_ID ?? ""
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
  })

  useEffect(() => {
    const tokens = getTokens()
    setState({
      isAuthenticated: tokens !== null && !isTokenExpired(),
      isLoading: false,
    })
  }, [])

  // Auto-refresh token ~5 minutes before expiry
  useEffect(() => {
    if (!state.isAuthenticated) return

    const tokens = getTokens()
    if (!tokens) return

    const msUntilExpiry = tokens.expiresAt - Date.now()
    const refreshBuffer = 5 * 60 * 1000 // 5 minutes
    const delay = Math.max(msUntilExpiry - refreshBuffer, 0)

    const timer = setTimeout(async () => {
      const tokens = getTokens()
      if (!tokens) return

      const res = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: tokens.refreshToken }),
      })

      if (res.ok) {
        const data = await res.json()
        storeTokens({
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          expiresIn: data.expires_in,
        })
      }
    }, delay)

    return () => clearTimeout(timer)
  }, [state.isAuthenticated])

  const login = useCallback(() => {
    const state = generateState()
    sessionStorage.setItem(STATE_KEY, state)
    const params = new URLSearchParams({
      client_id: getClientId(),
      redirect_uri: `${getAppUrl()}/callback`,
      response_type: "code",
      scope: SCOPES,
      state,
    })
    window.location.href = `${WHOOP_AUTH_URL}?${params.toString()}`
  }, [])

  const handleCallback = useCallback(async (code: string) => {
    const res = await fetch("/api/auth/callback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error ?? "Token exchange failed")
    }

    const data = await res.json()
    storeTokens({
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    })

    setState({ isAuthenticated: true, isLoading: false })
  }, [])

  const refreshAccessToken = useCallback(async (): Promise<boolean> => {
    const tokens = getTokens()
    if (!tokens) return false

    const res = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: tokens.refreshToken }),
    })

    if (!res.ok) {
      setState({ isAuthenticated: false, isLoading: false })
      return false
    }

    const data = await res.json()
    storeTokens({
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    })

    return true
  }, [])

  const logout = useCallback(async () => {
    await clearAllData()
    queryClient.clear()
    setState({ isAuthenticated: false, isLoading: false })
  }, [])

  return createElement(
    AuthContext.Provider,
    { value: { ...state, login, handleCallback, logout, refreshAccessToken } },
    children,
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
