import { useMemo } from "react"
import { useQueries, keepPreviousData } from "@tanstack/react-query"
import type { DateRange, CollectionType } from "@/lib/types"
import { fetchSleep, fetchCycles, fetchRecovery, fetchWorkouts } from "@/lib/whoop-api"
import { getStaleTime } from "@/lib/query-config"

function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function getWeekBuckets(days: DateRange): { start: Date; end: Date }[] {
  const end = startOfDay(new Date())
  end.setDate(end.getDate() + 1) // end of today (exclusive)
  const totalStart = new Date(end)
  totalStart.setDate(totalStart.getDate() - days)

  const buckets: { start: Date; end: Date }[] = []
  let cursor = new Date(end)

  while (cursor > totalStart) {
    const weekStart = new Date(cursor)
    weekStart.setDate(weekStart.getDate() - 7)
    const bucketStart = weekStart < totalStart ? totalStart : weekStart
    buckets.push({ start: bucketStart, end: new Date(cursor) })
    cursor = bucketStart
  }

  return buckets
}

const fetchFns: Record<CollectionType, (params: { start: string; end: string }) => Promise<unknown[]>> = {
  sleep: fetchSleep,
  cycles: fetchCycles,
  recovery: fetchRecovery,
  workouts: fetchWorkouts,
}

export function useWhoopData<T>(collection: CollectionType, dateRange: DateRange) {
  const buckets = useMemo(() => getWeekBuckets(dateRange), [dateRange])
  const fetchFn = fetchFns[collection] as (params: { start: string; end: string }) => Promise<T[]>

  const queries = useQueries({
    queries: buckets.map((bucket) => ({
      queryKey: [collection, bucket.start.toISOString(), bucket.end.toISOString()],
      queryFn: () =>
        fetchFn({
          start: bucket.start.toISOString(),
          end: bucket.end.toISOString(),
        }),
      staleTime: getStaleTime(bucket.end),
      placeholderData: keepPreviousData,
    })),
  })

  const data = queries.flatMap((q) => (q.data as T[]) ?? [])
  const isLoading = queries.some((q) => q.isLoading)
  const isFetching = queries.some((q) => q.isFetching)
  const isError = queries.some((q) => q.isError)
  const error = queries.find((q) => q.error)?.error ?? null

  return { data, isLoading, isFetching, isError, error }
}
