import { useQuery } from "@tanstack/react-query"
import { fetchBodyMeasurement } from "@/lib/whoop-api"
import { BodyMeasurements } from "@/components/body-measurements"
import { AppShell } from "@/components/layout/app-shell"
import { NavTabs } from "@/components/layout/nav-tabs"
import { Button } from "@/components/ui/button"

export function BodyPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["body_measurement"],
    queryFn: fetchBodyMeasurement,
  })

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <NavTabs />
        </div>
        {isError ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-sm text-destructive">
              {error?.message ?? "Failed to load data"}
            </p>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        ) : (
          <BodyMeasurements data={data ?? null} isLoading={isLoading} />
        )}
      </div>
    </AppShell>
  )
}
