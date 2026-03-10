import { useState, useCallback } from "react"
import type { SleepRecord, Cycle, Recovery, Workout, DateRange } from "@/lib/types"
import { fetchSleep, fetchCycles, fetchRecovery, fetchWorkouts } from "@/lib/whoop-api"
import { queryClient } from "@/lib/query-config"
import {
  formatDate,
  formatDuration,
  formatPercentage,
  formatDecimal,
  formatKjToKcal,
  formatInteger,
  formatMeters,
} from "@/lib/formatters"

function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function getDateParams(dateRange: DateRange): { start: string; end: string } {
  const end = startOfDay(new Date())
  end.setDate(end.getDate() + 1)
  const totalStart = new Date(end)
  totalStart.setDate(totalStart.getDate() - dateRange)
  return { start: totalStart.toISOString(), end: end.toISOString() }
}

async function fetchOrGetCached<T>(
  collection: string,
  params: { start: string; end: string },
  fetchFn: (params: { start: string; end: string }) => Promise<T[]>,
): Promise<T[]> {
  const queryKey = [collection, params.start, params.end]
  const cached = queryClient.getQueryData<T[]>(queryKey)
  if (cached) return cached

  const data = await fetchFn(params)
  queryClient.setQueryData(queryKey, data)
  return data
}

function sleepToRows(data: SleepRecord[]) {
  return data.map((d) => ({
    Date: formatDate(d.start),
    Duration: formatDuration(d.totalInBedMs),
    Efficiency: formatPercentage(d.sleepEfficiencyPct),
    Performance: formatPercentage(d.sleepPerformancePct),
    Deep: formatDuration(d.totalDeepSleepMs),
    REM: formatDuration(d.totalRemSleepMs),
    Light: formatDuration(d.totalLightSleepMs),
    Awake: formatDuration(d.totalAwakeMs),
    Disturbances: formatInteger(d.disturbanceCount),
    "Resp. Rate": formatDecimal(d.respiratoryRate),
  }))
}

function cyclesToRows(data: Cycle[]) {
  return data.map((d) => ({
    Date: formatDate(d.start),
    Strain: formatDecimal(d.strain),
    Calories: formatKjToKcal(d.kilojoule),
    "Avg HR": formatInteger(d.averageHeartRate),
    "Max HR": formatInteger(d.maxHeartRate),
  }))
}

function recoveryToRows(data: Recovery[]) {
  return data.map((d) => ({
    "Cycle ID": d.cycleId,
    Recovery: formatPercentage(d.recoveryScore),
    HRV: formatDecimal(d.hrvRmssdMs),
    "Resting HR": formatInteger(d.restingHeartRate),
    SpO2: formatPercentage(d.spo2Pct),
    "Skin Temp": d.skinTempCelsius !== null ? `${d.skinTempCelsius.toFixed(1)}°C` : "—",
  }))
}

function workoutsToRows(data: Workout[]) {
  return data.map((d) => {
    const durationMs =
      d.start && d.end
        ? new Date(d.end).getTime() - new Date(d.start).getTime()
        : null
    return {
      Date: formatDate(d.start),
      Activity: d.sportName,
      Duration: formatDuration(durationMs),
      Strain: formatDecimal(d.strain),
      "Avg HR": formatInteger(d.averageHeartRate),
      "Max HR": formatInteger(d.maxHeartRate),
      Calories: formatKjToKcal(d.kilojoule),
      Distance: formatMeters(d.distanceMeters),
    }
  })
}

export function useExcelExport() {
  const [isExporting, setIsExporting] = useState(false)

  const exportAll = useCallback(async (dateRange: DateRange) => {
    setIsExporting(true)
    try {
      const params = getDateParams(dateRange)

      const [sleep, cycles, recovery, workouts] = await Promise.all([
        fetchOrGetCached<SleepRecord>("sleep", params, fetchSleep),
        fetchOrGetCached<Cycle>("cycles", params, fetchCycles),
        fetchOrGetCached<Recovery>("recovery", params, fetchRecovery),
        fetchOrGetCached<Workout>("workouts", params, fetchWorkouts),
      ])

      const XLSX = await import("xlsx")
      const wb = XLSX.utils.book_new()

      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sleepToRows(sleep)), "Sleep")
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(cyclesToRows(cycles)), "Cycles")
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(recoveryToRows(recovery)), "Recovery")
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(workoutsToRows(workouts)), "Workouts")

      XLSX.writeFile(wb, `whoop-data-${dateRange}d.xlsx`)
    } finally {
      setIsExporting(false)
    }
  }, [])

  return { isExporting, exportAll }
}
