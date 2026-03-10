export type ScoreState = "SCORED" | "PENDING_SCORE" | "UNSCORABLE"

export interface SleepRecord {
  id: string
  cycleId: number
  start: string
  end: string
  timezoneOffset: string
  isNap: boolean
  scoreState: ScoreState
  createdAt: string
  updatedAt: string
  totalInBedMs: number | null
  totalAwakeMs: number | null
  totalNoDataMs: number | null
  totalLightSleepMs: number | null
  totalDeepSleepMs: number | null
  totalRemSleepMs: number | null
  sleepCycleCount: number | null
  disturbanceCount: number | null
  sleepConsistencyPct: number | null
  sleepPerformancePct: number | null
  sleepEfficiencyPct: number | null
  respiratoryRate: number | null
  sleepNeededBaselineMs: number | null
  sleepNeededDebtMs: number | null
  sleepNeededStrainMs: number | null
  sleepNeededNapMs: number | null
}

export interface Cycle {
  id: number
  start: string
  end: string
  timezoneOffset: string
  scoreState: ScoreState
  createdAt: string
  updatedAt: string
  strain: number | null
  kilojoule: number | null
  averageHeartRate: number | null
  maxHeartRate: number | null
}

export interface Recovery {
  cycleId: number
  sleepId: string
  scoreState: ScoreState
  createdAt: string
  updatedAt: string
  userCalibrating: boolean
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
  createdAt: string
  updatedAt: string
  strain: number | null
  averageHeartRate: number | null
  maxHeartRate: number | null
  kilojoule: number | null
  percentRecorded: number | null
  distanceMeters: number | null
  altitudeGainMeters: number | null
  altitudeChangeMeters: number | null
  zoneZeroMs: number | null
  zoneOneMs: number | null
  zoneTwoMs: number | null
  zoneThreeMs: number | null
  zoneFourMs: number | null
  zoneFiveMs: number | null
}

export interface BodyMeasurement {
  heightMeter: number
  weightKilogram: number
  maxHeartRate: number
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
