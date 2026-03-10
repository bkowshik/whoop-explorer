export type ScoreState = "SCORED" | "PENDING_SCORE" | "UNSCORABLE"

export interface SleepRecord {
  id: string
  cycleId: number
  start: string
  end: string
  timezoneOffset: string
  isNap: boolean
  scoreState: ScoreState
  totalInBedMs: number | null
  totalAwakeMs: number | null
  totalLightSleepMs: number | null
  totalDeepSleepMs: number | null
  totalRemSleepMs: number | null
  sleepCycleCount: number | null
  disturbanceCount: number | null
  sleepPerformancePct: number | null
  sleepEfficiencyPct: number | null
  respiratoryRate: number | null
}

export interface Cycle {
  id: number
  start: string
  end: string
  timezoneOffset: string
  scoreState: ScoreState
  strain: number | null
  kilojoule: number | null
  averageHeartRate: number | null
  maxHeartRate: number | null
}

export interface Recovery {
  cycleId: number
  sleepId: string
  scoreState: ScoreState
  recoveryScore: number | null
  restingHeartRate: number | null
  hrvRmssdMs: number | null
  spo2Pct: number | null
  skinTempCelsius: number | null
}

export interface Workout {
  id: string
  start: string
  end: string
  timezoneOffset: string
  sportName: string
  scoreState: ScoreState
  strain: number | null
  averageHeartRate: number | null
  maxHeartRate: number | null
  kilojoule: number | null
  distanceMeters: number | null
}

export interface UserSession {
  accessToken: string
  refreshToken: string
  expiresAt: number
  userId: number
  firstName: string
  email: string
}

export interface WhoopApiResponse<T> {
  records: T[]
  next_token: string | null
}

export type CollectionType = "sleep" | "cycles" | "recovery" | "workouts"

export type DateRange = 7 | 30 | 90

export interface SummaryStatItem {
  label: string
  value: string | number | null
  unit?: string
}
