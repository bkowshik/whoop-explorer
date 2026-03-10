import { useState, useMemo } from "react"
import type { DateRange, SleepRecord, Cycle, SummaryStatItem } from "@/lib/types"
import { useWhoopData } from "@/hooks/use-whoop-data"
import { formatDuration, formatPercentage, formatDateTime } from "@/lib/formatters"
import { DataTable } from "@/components/data-table"
import { SummaryStats } from "@/components/summary-stats"
import { sleepColumns } from "@/components/tables/sleep-columns"
import { AppShell } from "@/components/layout/app-shell"
import { NavTabs } from "@/components/layout/nav-tabs"
import { DateRangeSelector } from "@/components/date-range-selector"
import { Button } from "@/components/ui/button"

function avg(values: (number | null)[]): number | null {
  const valid = values.filter((v): v is number => v !== null)
  if (valid.length === 0) return null
  return valid.reduce((a, b) => a + b, 0) / valid.length
}

function getSummary(data: SleepRecord[]): SummaryStatItem[] {
  const scored = data.filter((d) => d.scoreState === "SCORED")
  return [
    {
      label: "Avg Duration",
      value: formatDuration(avg(scored.map((d) => d.totalInBedMs))),
    },
    {
      label: "Avg Efficiency",
      value: formatPercentage(avg(scored.map((d) => d.sleepEfficiencyPct))),
    },
    {
      label: "Avg Performance",
      value: formatPercentage(avg(scored.map((d) => d.sleepPerformancePct))),
    },
  ]
}

export function SleepPage() {
  const [dateRange, setDateRange] = useState<DateRange>(7)
  const { data, isLoading, isError, error } = useWhoopData<SleepRecord>(
    "sleep",
    dateRange,
  )
  const { data: cycles } = useWhoopData<Cycle>("cycles", dateRange)

  const cycleLookup = useMemo(() => {
    const map = new Map<number, string>()
    for (const c of cycles) {
      map.set(c.id, formatDateTime(c.start))
    }
    return map
  }, [cycles])

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
            <DataTable columns={sleepColumns} data={data} isLoading={isLoading} tableId="sleep" meta={{ cycleLookup }} />
          </>
        )}
      </div>
    </AppShell>
  )
}
