import type {
  SleepRecord,
  Cycle,
  Recovery,
  Workout,
  WhoopApiResponse,
} from "@/lib/types"
import { getTokens } from "@/lib/auth"

const API_BASE = "/api/whoop"

// --- Response mappers (snake_case → camelCase) ---

export function mapSleepResponse(raw: Record<string, unknown>): SleepRecord {
  const score = raw.score as Record<string, unknown> | undefined
  const stageSummary = score?.stage_summary as Record<string, unknown> | undefined

  return {
    id: raw.id as string,
    cycleId: raw.cycle_id as number,
    start: raw.start as string,
    end: raw.end as string,
    timezoneOffset: raw.timezone_offset as string,
    isNap: raw.nap as boolean,
    scoreState: raw.score_state as SleepRecord["scoreState"],
    totalInBedMs: (stageSummary?.total_in_bed_time_milli as number) ?? null,
    totalAwakeMs: (stageSummary?.total_awake_time_milli as number) ?? null,
    totalLightSleepMs: (stageSummary?.total_light_sleep_time_milli as number) ?? null,
    totalDeepSleepMs: (stageSummary?.total_slow_wave_sleep_time_milli as number) ?? null,
    totalRemSleepMs: (stageSummary?.total_rem_sleep_time_milli as number) ?? null,
    sleepCycleCount: (stageSummary?.sleep_cycle_count as number) ?? null,
    disturbanceCount: (stageSummary?.disturbance_count as number) ?? null,
    sleepPerformancePct: (score?.sleep_performance_percentage as number) ?? null,
    sleepEfficiencyPct: (score?.sleep_efficiency_percentage as number) ?? null,
    respiratoryRate: (score?.respiratory_rate as number) ?? null,
  }
}

export function mapCycleResponse(raw: Record<string, unknown>): Cycle {
  const score = raw.score as Record<string, unknown> | undefined

  return {
    id: raw.id as number,
    start: raw.start as string,
    end: raw.end as string,
    timezoneOffset: raw.timezone_offset as string,
    scoreState: raw.score_state as Cycle["scoreState"],
    strain: (score?.strain as number) ?? null,
    kilojoule: (score?.kilojoule as number) ?? null,
    averageHeartRate: (score?.average_heart_rate as number) ?? null,
    maxHeartRate: (score?.max_heart_rate as number) ?? null,
  }
}

export function mapRecoveryResponse(raw: Record<string, unknown>): Recovery {
  const score = raw.score as Record<string, unknown> | undefined

  return {
    cycleId: raw.cycle_id as number,
    sleepId: raw.sleep_id as string,
    scoreState: raw.score_state as Recovery["scoreState"],
    recoveryScore: (score?.recovery_score as number) ?? null,
    restingHeartRate: (score?.resting_heart_rate as number) ?? null,
    hrvRmssdMs: (score?.hrv_rmssd_milli as number) ?? null,
    spo2Pct: (score?.spo2_percentage as number) ?? null,
    skinTempCelsius: (score?.skin_temp_celsius as number) ?? null,
  }
}

export function mapWorkoutResponse(raw: Record<string, unknown>): Workout {
  const score = raw.score as Record<string, unknown> | undefined

  return {
    id: raw.id as string,
    start: raw.start as string,
    end: raw.end as string,
    timezoneOffset: raw.timezone_offset as string,
    sportName: raw.sport_name as string,
    scoreState: raw.score_state as Workout["scoreState"],
    strain: (score?.strain as number) ?? null,
    averageHeartRate: (score?.average_heart_rate as number) ?? null,
    maxHeartRate: (score?.max_heart_rate as number) ?? null,
    kilojoule: (score?.kilojoule as number) ?? null,
    distanceMeters: (score?.distance_meter as number) ?? null,
  }
}

// --- API fetch functions ---

type MapperFn<T> = (raw: Record<string, unknown>) => T

async function fetchCollection<T>(
  path: string,
  mapper: MapperFn<T>,
  params: { start: string; end: string },
): Promise<T[]> {
  const tokens = getTokens()
  if (!tokens) throw new Error("Not authenticated")

  const results: T[] = []
  let nextToken: string | null = null

  do {
    const url = new URL(`${window.location.origin}${API_BASE}/${path}`)
    url.searchParams.set("start", params.start)
    url.searchParams.set("end", params.end)
    url.searchParams.set("limit", "25")
    if (nextToken) url.searchParams.set("nextToken", nextToken)

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
    })

    if (!res.ok) {
      if (res.status === 401) throw new Error("Unauthorized")
      throw new Error(`API error: ${res.status}`)
    }

    const data = (await res.json()) as WhoopApiResponse<Record<string, unknown>>
    results.push(...data.records.map(mapper))
    nextToken = data.next_token
  } while (nextToken)

  return results
}

export function fetchSleep(params: { start: string; end: string }) {
  return fetchCollection("activity/sleep", mapSleepResponse, params)
}

export function fetchCycles(params: { start: string; end: string }) {
  return fetchCollection("cycle", mapCycleResponse, params)
}

export function fetchRecovery(params: { start: string; end: string }) {
  return fetchCollection("recovery", mapRecoveryResponse, params)
}

export function fetchWorkouts(params: { start: string; end: string }) {
  return fetchCollection("activity/workout", mapWorkoutResponse, params)
}
