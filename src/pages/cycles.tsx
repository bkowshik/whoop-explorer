import { useState } from "react"
import type { DateRange, Cycle, SummaryStatItem } from "@/lib/types"
import { useWhoopData } from "@/hooks/use-whoop-data"
import { formatDecimal, formatKjToKcal, formatInteger } from "@/lib/formatters"
import { DataTable } from "@/components/data-table"
import { SummaryStats } from "@/components/summary-stats"
import { cyclesColumns } from "@/components/tables/cycles-columns"
import { AppShell } from "@/components/layout/app-shell"
import { NavTabs } from "@/components/layout/nav-tabs"
import { DateRangeSelector } from "@/components/date-range-selector"
import { Button } from "@/components/ui/button"

function avg(values: (number | null)[]): number | null {
  const valid = values.filter((v): v is number => v !== null)
  if (valid.length === 0) return null
  return valid.reduce((a, b) => a + b, 0) / valid.length
}

function getSummary(data: Cycle[]): SummaryStatItem[] {
  const scored = data.filter((d) => d.scoreState === "SCORED")
  return [
    {
      label: "Avg Strain",
      value: formatDecimal(avg(scored.map((d) => d.strain))),
    },
    {
      label: "Avg Calories",
      value: formatKjToKcal(avg(scored.map((d) => d.kilojoule))),
      unit: "kcal",
    },
    {
      label: "Avg Heart Rate",
      value: formatInteger(avg(scored.map((d) => d.averageHeartRate))),
      unit: "bpm",
    },
  ]
}

export function CyclesPage() {
  const [dateRange, setDateRange] = useState<DateRange>(7)
  const { data, isLoading, isError, error } = useWhoopData<Cycle>(
    "cycles",
    dateRange,
  )

  return (
    <AppShell dateRange={dateRange}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <NavTabs />
          <DateRangeSelector value={dateRange} onChange={setDateRange} />
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
          <>
            <SummaryStats items={getSummary(data)} isLoading={isLoading} />
            <DataTable columns={cyclesColumns} data={data} isLoading={isLoading} />
          </>
        )}
      </div>
    </AppShell>
  )
}
