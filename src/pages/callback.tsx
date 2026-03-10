import { useEffect, useRef } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { useAuth, verifyAndConsumeState } from "@/hooks/use-auth"

export function CallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { handleCallback } = useAuth()
  const processed = useRef(false)

  useEffect(() => {
    if (processed.current) return
    processed.current = true

    const code = searchParams.get("code")
    const error = searchParams.get("error")
    const state = searchParams.get("state")

    if (error) {
      navigate(`/?error=${error}`, { replace: true })
      return
    }

    if (!verifyAndConsumeState(state)) {
      navigate("/?error=invalid_state", { replace: true })
      return
    }

    if (!code) {
      navigate("/", { replace: true })
      return
    }

    handleCallback(code)
      .then(() => navigate("/sleep", { replace: true }))
      .catch(() => navigate("/?error=token_exchange_failed", { replace: true }))
  }, [searchParams, navigate, handleCallback])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="mt-4 text-sm text-muted-foreground">Connecting your WHOOP account...</p>
      </div>
    </div>
  )
}
