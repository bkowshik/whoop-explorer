import { Link, useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"

export function LandingPage() {
  const { login } = useAuth()
  const [searchParams] = useSearchParams()
  const denied = searchParams.get("error") === "access_denied"

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <div className="max-w-md text-center">
        <h1 className="text-3xl font-bold tracking-tight">WHOOP Explorer</h1>
        <p className="mt-3 text-muted-foreground">
          View and download your WHOOP data. Browse Sleep, Cycles, Recovery,
          and Workouts in a simple table format.
        </p>
      </div>

      {denied && (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Access was denied. Please try again to connect your WHOOP account.
        </div>
      )}

      <Button size="lg" onClick={login}>
        Connect WHOOP
      </Button>

      <p className="max-w-sm text-center text-xs text-muted-foreground">
        Your data never leaves your browser. We only use a secure proxy to
        authenticate with WHOOP — no health data is stored on any server.
        {" "}
        <Link to="/privacy" className="underline hover:text-foreground">
          Privacy Policy
        </Link>
      </p>
    </div>
  )
}
