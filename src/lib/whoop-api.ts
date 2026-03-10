import type {
  SleepRecord,
  Cycle,
  Recovery,
  Workout,
  BodyMeasurement,
  WhoopApiResponse,
} from "@/lib/types"
import { getTokens } from "@/lib/auth"

const API_BASE = "/api/whoop"

// --- Response mappers (snake_case → camelCase) ---

export function mapSleepResponse(raw: Record<string, unknown>): SleepRecord {
  const score = raw.score as Record<string, unknown> | undefined
  const stageSummary = score?.stage_summary as Record<string, unknown> | undefined
  const sleepNeeded = score?.sleep_needed as Record<string, unknown> | undefined

  return {
    id: raw.id as string,
    cycleId: raw.cycle_id as number,
    start: raw.start as string,
    end: raw.end as string,
    timezoneOffset: raw.timezone_offset as string,
    isNap: raw.nap as boolean,
    scoreState: raw.score_state as SleepRecord["scoreState"],
    createdAt: raw.created_at as string,
    updatedAt: raw.updated_at as string,
    totalInBedMs: (stageSummary?.total_in_bed_time_milli as number) ?? null,
    totalAwakeMs: (stageSummary?.total_awake_time_milli as number) ?? null,
    totalNoDataMs: (stageSummary?.total_no_data_time_milli as number) ?? null,
    totalLightSleepMs: (stageSummary?.total_light_sleep_time_milli as number) ?? null,
    totalDeepSleepMs: (stageSummary?.total_slow_wave_sleep_time_milli as number) ?? null,
    totalRemSleepMs: (stageSummary?.total_rem_sleep_time_milli as number) ?? null,
    sleepCycleCount: (stageSummary?.sleep_cycle_count as number) ?? null,
    disturbanceCount: (stageSummary?.disturbance_count as number) ?? null,
    sleepConsistencyPct: (score?.sleep_consistency_percentage as number) ?? null,
    sleepPerformancePct: (score?.sleep_performance_percentage as number) ?? null,
    sleepEfficiencyPct: (score?.sleep_efficiency_percentage as number) ?? null,
    respiratoryRate: (score?.respiratory_rate as number) ?? null,
    sleepNeededBaselineMs: (sleepNeeded?.baseline_milli as number) ?? null,
    sleepNeededDebtMs: (sleepNeeded?.need_from_sleep_debt_milli as number) ?? null,
    sleepNeededStrainMs: (sleepNeeded?.need_from_recent_strain_milli as number) ?? null,
    sleepNeededNapMs: (sleepNeeded?.need_from_recent_nap_milli as number) ?? null,
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
    createdAt: raw.created_at as string,
    updatedAt: raw.updated_at as string,
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
    createdAt: raw.created_at as string,
    updatedAt: raw.updated_at as string,
    userCalibrating: (score?.user_calibrating as boolean) ?? false,
    recoveryScore: (score?.recovery_score as number) ?? null,
    restingHeartRate: (score?.resting_heart_rate as number) ?? null,
    hrvRmssdMs: (score?.hrv_rmssd_milli as number) ?? null,
    spo2Pct: (score?.spo2_percentage as number) ?? null,
    skinTempCelsius: (score?.skin_temp_celsius as number) ?? null,
  }
}

export function mapWorkoutResponse(raw: Record<string, unknown>): Workout {
  const score = raw.score as Record<string, unknown> | undefined
  const zoneDurations = score?.zone_durations as Record<string, unknown> | undefined

  return {
    id: raw.id as string,
    start: raw.start as string,
    end: raw.end as string,
    timezoneOffset: raw.timezone_offset as string,
    sportName: raw.sport_name as string,
    scoreState: raw.score_state as Workout["scoreState"],
    createdAt: raw.created_at as string,
    updatedAt: raw.updated_at as string,
    strain: (score?.strain as number) ?? null,
    averageHeartRate: (score?.average_heart_rate as number) ?? null,
    maxHeartRate: (score?.max_heart_rate as number) ?? null,
    kilojoule: (score?.kilojoule as number) ?? null,
    percentRecorded: (score?.percent_recorded as number) ?? null,
    distanceMeters: (score?.distance_meter as number) ?? null,
    altitudeGainMeters: (score?.altitude_gain_meter as number) ?? null,
    altitudeChangeMeters: (score?.altitude_change_meter as number) ?? null,
    zoneZeroMs: (zoneDurations?.zone_zero_milli as number) ?? null,
    zoneOneMs: (zoneDurations?.zone_one_milli as number) ?? null,
    zoneTwoMs: (zoneDurations?.zone_two_milli as number) ?? null,
    zoneThreeMs: (zoneDurations?.zone_three_milli as number) ?? null,
    zoneFourMs: (zoneDurations?.zone_four_milli as number) ?? null,
    zoneFiveMs: (zoneDurations?.zone_five_milli as number) ?? null,
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

export function mapBodyMeasurementResponse(raw: Record<string, unknown>): BodyMeasurement {
  return {
    heightMeter: raw.height_meter as number,
    weightKilogram: raw.weight_kilogram as number,
    maxHeartRate: raw.max_heart_rate as number,
  }
}

export async function fetchBodyMeasurement(): Promise<BodyMeasurement> {
  const tokens = getTokens()
  if (!tokens) throw new Error("Not authenticated")

  const res = await fetch(`${API_BASE}/user/measurement/body`, {
    headers: { Authorization: `Bearer ${tokens.accessToken}` },
  })

  if (!res.ok) {
    if (res.status === 401) throw new Error("Unauthorized")
    throw new Error(`API error: ${res.status}`)
  }

  const data = (await res.json()) as Record<string, unknown>
  return mapBodyMeasurementResponse(data)
}
