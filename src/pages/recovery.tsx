import { useState, useMemo } from "react"
import type { DateRange, Recovery, Cycle, SummaryStatItem } from "@/lib/types"
import { useWhoopData } from "@/hooks/use-whoop-data"
import { formatPercentage, formatDecimal, formatInteger, formatDateTime } from "@/lib/formatters"
import { DataTable } from "@/components/data-table"
import { SummaryStats } from "@/components/summary-stats"
import { recoveryColumns } from "@/components/tables/recovery-columns"
import { AppShell } from "@/components/layout/app-shell"
import { NavTabs } from "@/components/layout/nav-tabs"
import { DateRangeSelector } from "@/components/date-range-selector"
import { Button } from "@/components/ui/button"

function avg(values: (number | null)[]): number | null {
  const valid = values.filter((v): v is number => v !== null)
  if (valid.length === 0) return null
  return valid.reduce((a, b) => a + b, 0) / valid.length
}

function getSummary(data: Recovery[]): SummaryStatItem[] {
  const scored = data.filter((d) => d.scoreState === "SCORED")
  return [
    {
      label: "Avg Recovery",
      value: formatPercentage(avg(scored.map((d) => d.recoveryScore))),
    },
    {
      label: "Avg HRV",
      value: formatDecimal(avg(scored.map((d) => d.hrvRmssdMs))),
      unit: "ms",
    },
    {
      label: "Avg Resting HR",
      value: formatInteger(avg(scored.map((d) => d.restingHeartRate))),
      unit: "bpm",
    },
  ]
}

export function RecoveryPage() {
  const [dateRange, setDateRange] = useState<DateRange>(7)
  const { data, isLoading, isError, error } = useWhoopData<Recovery>(
    "recovery",
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
            <DataTable columns={recoveryColumns} data={data} isLoading={isLoading} tableId="recovery" meta={{ cycleLookup }} />
          </>
        )}
      </div>
    </AppShell>
  )
}
