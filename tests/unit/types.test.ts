import { describe, it, expect } from "vitest"
import { mapSleepResponse, mapCycleResponse, mapRecoveryResponse, mapWorkoutResponse } from "@/lib/whoop-api"

describe("WHOOP API response mapping", () => {
  it("maps sleep response from snake_case to camelCase", () => {
    const apiResponse = {
      id: "abc-123",
      cycle_id: 100,
      user_id: 1,
      created_at: "2026-03-01T09:00:00.000Z",
      updated_at: "2026-03-01T10:00:00.000Z",
      start: "2026-02-28T23:00:00.000Z",
      end: "2026-03-01T07:00:00.000Z",
      timezone_offset: "-05:00",
      nap: false,
      score_state: "SCORED",
      score: {
        stage_summary: {
          total_in_bed_time_milli: 28800000,
          total_awake_time_milli: 1800000,
          total_light_sleep_time_milli: 9000000,
          total_slow_wave_sleep_time_milli: 7200000,
          total_rem_sleep_time_milli: 6300000,
          sleep_cycle_count: 4,
          disturbance_count: 2,
          total_no_data_time_milli: 300000,
        },
        sleep_performance_percentage: 89,
        sleep_efficiency_percentage: 94.1,
        sleep_consistency_percentage: 82,
        respiratory_rate: 15.2,
        sleep_needed: {
          baseline_milli: 27000000,
          need_from_sleep_debt_milli: 1800000,
          need_from_recent_strain_milli: 900000,
          need_from_recent_nap_milli: -600000,
        },
      },
    }

    const result = mapSleepResponse(apiResponse)
    expect(result.id).toBe("abc-123")
    expect(result.cycleId).toBe(100)
    expect(result.createdAt).toBe("2026-03-01T09:00:00.000Z")
    expect(result.updatedAt).toBe("2026-03-01T10:00:00.000Z")
    expect(result.isNap).toBe(false)
    expect(result.scoreState).toBe("SCORED")
    expect(result.totalInBedMs).toBe(28800000)
    expect(result.totalDeepSleepMs).toBe(7200000)
    expect(result.totalNoDataMs).toBe(300000)
    expect(result.sleepPerformancePct).toBe(89)
    expect(result.sleepEfficiencyPct).toBe(94.1)
    expect(result.sleepConsistencyPct).toBe(82)
    expect(result.respiratoryRate).toBe(15.2)
    expect(result.sleepNeededBaselineMs).toBe(27000000)
    expect(result.sleepNeededDebtMs).toBe(1800000)
    expect(result.sleepNeededStrainMs).toBe(900000)
    expect(result.sleepNeededNapMs).toBe(-600000)
  })

  it("returns null score fields for PENDING_SCORE", () => {
    const apiResponse = {
      id: "abc-456",
      cycle_id: 101,
      user_id: 1,
      created_at: "2026-03-01T09:00:00.000Z",
      updated_at: "2026-03-01T09:00:00.000Z",
      start: "2026-03-01T23:00:00.000Z",
      end: "2026-03-02T07:00:00.000Z",
      timezone_offset: "-05:00",
      nap: false,
      score_state: "PENDING_SCORE",
    }

    const result = mapSleepResponse(apiResponse)
    expect(result.scoreState).toBe("PENDING_SCORE")
    expect(result.totalInBedMs).toBeNull()
    expect(result.sleepEfficiencyPct).toBeNull()
    expect(result.sleepConsistencyPct).toBeNull()
    expect(result.totalNoDataMs).toBeNull()
    expect(result.sleepNeededBaselineMs).toBeNull()
    expect(result.sleepNeededDebtMs).toBeNull()
    expect(result.sleepNeededStrainMs).toBeNull()
    expect(result.sleepNeededNapMs).toBeNull()
  })

  it("maps cycle response correctly", () => {
    const apiResponse = {
      id: 93845,
      user_id: 1,
      created_at: "2026-03-01T00:00:00.000Z",
      updated_at: "2026-03-01T12:00:00.000Z",
      start: "2026-03-01T00:00:00.000Z",
      end: "2026-03-01T23:59:00.000Z",
      timezone_offset: "-05:00",
      score_state: "SCORED",
      score: {
        strain: 12.5,
        kilojoule: 8000,
        average_heart_rate: 68,
        max_heart_rate: 141,
      },
    }

    const result = mapCycleResponse(apiResponse)
    expect(result.id).toBe(93845)
    expect(result.createdAt).toBe("2026-03-01T00:00:00.000Z")
    expect(result.updatedAt).toBe("2026-03-01T12:00:00.000Z")
    expect(result.strain).toBe(12.5)
    expect(result.kilojoule).toBe(8000)
    expect(result.averageHeartRate).toBe(68)
  })

  it("maps recovery response correctly", () => {
    const apiResponse = {
      cycle_id: 93845,
      sleep_id: "abc-123",
      user_id: 1,
      created_at: "2026-03-01T09:00:00.000Z",
      updated_at: "2026-03-01T10:00:00.000Z",
      score_state: "SCORED",
      score: {
        user_calibrating: false,
        recovery_score: 78,
        resting_heart_rate: 52,
        hrv_rmssd_milli: 68.4,
        spo2_percentage: 97.2,
        skin_temp_celsius: 33.1,
      },
    }

    const result = mapRecoveryResponse(apiResponse)
    expect(result.cycleId).toBe(93845)
    expect(result.createdAt).toBe("2026-03-01T09:00:00.000Z")
    expect(result.updatedAt).toBe("2026-03-01T10:00:00.000Z")
    expect(result.userCalibrating).toBe(false)
    expect(result.recoveryScore).toBe(78)
    expect(result.hrvRmssdMs).toBe(68.4)
    expect(result.spo2Pct).toBe(97.2)
  })

  it("maps workout response with all new fields", () => {
    const apiResponse = {
      id: "wkt-789",
      user_id: 1,
      created_at: "2026-03-01T14:00:00.000Z",
      updated_at: "2026-03-01T15:00:00.000Z",
      start: "2026-03-01T13:00:00.000Z",
      end: "2026-03-01T14:00:00.000Z",
      timezone_offset: "-05:00",
      sport_name: "Running",
      score_state: "SCORED",
      score: {
        strain: 12.7,
        average_heart_rate: 155,
        max_heart_rate: 182,
        kilojoule: 1850.4,
        distance_meter: 8045.0,
        percent_recorded: 100,
        altitude_gain_meter: 45.3,
        altitude_change_meter: -2.1,
        zone_durations: {
          zone_zero_milli: 60000,
          zone_one_milli: 120000,
          zone_two_milli: 300000,
          zone_three_milli: 600000,
          zone_four_milli: 480000,
          zone_five_milli: 240000,
        },
      },
    }

    const result = mapWorkoutResponse(apiResponse)
    expect(result.sportName).toBe("Running")
    expect(result.createdAt).toBe("2026-03-01T14:00:00.000Z")
    expect(result.updatedAt).toBe("2026-03-01T15:00:00.000Z")
    expect(result.strain).toBe(12.7)
    expect(result.distanceMeters).toBe(8045.0)
    expect(result.percentRecorded).toBe(100)
    expect(result.altitudeGainMeters).toBe(45.3)
    expect(result.altitudeChangeMeters).toBe(-2.1)
    expect(result.zoneZeroMs).toBe(60000)
    expect(result.zoneOneMs).toBe(120000)
    expect(result.zoneTwoMs).toBe(300000)
    expect(result.zoneThreeMs).toBe(600000)
    expect(result.zoneFourMs).toBe(480000)
    expect(result.zoneFiveMs).toBe(240000)
  })

  it("maps workout response with null zones when absent", () => {
    const apiResponse = {
      id: "wkt-indoor",
      user_id: 1,
      created_at: "2026-03-01T14:00:00.000Z",
      updated_at: "2026-03-01T15:00:00.000Z",
      start: "2026-03-01T13:00:00.000Z",
      end: "2026-03-01T14:00:00.000Z",
      timezone_offset: "-05:00",
      sport_name: "Cycling",
      score_state: "SCORED",
      score: {
        strain: 8.0,
        average_heart_rate: 140,
        max_heart_rate: 165,
        kilojoule: 1200,
        distance_meter: null,
      },
    }

    const result = mapWorkoutResponse(apiResponse)
    expect(result.percentRecorded).toBeNull()
    expect(result.altitudeGainMeters).toBeNull()
    expect(result.altitudeChangeMeters).toBeNull()
    expect(result.zoneZeroMs).toBeNull()
    expect(result.zoneFiveMs).toBeNull()
  })
})
