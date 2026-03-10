# Data Model: Complete API Columns in Data Tables

**Feature**: 004-complete-api-columns | **Date**: 2026-03-10

## Entity Changes

### SleepRecord (UPDATED)

Existing fields retained. New fields marked with `+`.

| Field | Type | Source (API) | Display Default | Column Header |
|-------|------|-------------|-----------------|---------------|
| id | string | `id` | hidden | ID |
| cycleId | number | `cycle_id` | hidden | Cycle ID |
| + cycleDate | string \| null | **computed at render time** via `meta.cycleLookup` (not stored on interface) | visible | Cycle |
| start | string | `start` | visible | Start |
| end | string | `end` | visible | End |
| timezoneOffset | string | `timezone_offset` | hidden | Timezone |
| isNap | boolean | `nap` | visible | Nap |
| scoreState | ScoreState | `score_state` | hidden | Score State |
| + createdAt | string | `created_at` | hidden | Created |
| + updatedAt | string | `updated_at` | hidden | Updated |
| totalInBedMs | number \| null | `score.stage_summary.total_in_bed_time_milli` | visible | Duration |
| totalAwakeMs | number \| null | `score.stage_summary.total_awake_time_milli` | visible | Awake |
| + totalNoDataMs | number \| null | `score.stage_summary.total_no_data_time_milli` | visible | No Data |
| totalLightSleepMs | number \| null | `score.stage_summary.total_light_sleep_time_milli` | visible | Light |
| totalDeepSleepMs | number \| null | `score.stage_summary.total_slow_wave_sleep_time_milli` | visible | Deep |
| totalRemSleepMs | number \| null | `score.stage_summary.total_rem_sleep_time_milli` | visible | REM |
| sleepCycleCount | number \| null | `score.stage_summary.sleep_cycle_count` | visible | Sleep Cycles |
| disturbanceCount | number \| null | `score.stage_summary.disturbance_count` | visible | Disturbances |
| + sleepConsistencyPct | number \| null | `score.sleep_consistency_percentage` | visible | Consistency |
| sleepPerformancePct | number \| null | `score.sleep_performance_percentage` | visible | Performance |
| sleepEfficiencyPct | number \| null | `score.sleep_efficiency_percentage` | visible | Efficiency |
| respiratoryRate | number \| null | `score.respiratory_rate` | visible | Resp. Rate |
| + sleepNeededBaselineMs | number \| null | `score.sleep_needed.baseline_milli` | visible | Baseline Need |
| + sleepNeededDebtMs | number \| null | `score.sleep_needed.need_from_sleep_debt_milli` | visible | Sleep Debt |
| + sleepNeededStrainMs | number \| null | `score.sleep_needed.need_from_recent_strain_milli` | visible | Strain Need |
| + sleepNeededNapMs | number \| null | `score.sleep_needed.need_from_recent_nap_milli` | visible | Nap Reduction |

**New fields: 9** (cycleDate, createdAt, updatedAt, totalNoDataMs, sleepConsistencyPct, sleepNeededBaselineMs, sleepNeededDebtMs, sleepNeededStrainMs, sleepNeededNapMs)

---

### Cycle (UPDATED)

Existing fields retained. New fields marked with `+`.

| Field | Type | Source (API) | Display Default | Column Header |
|-------|------|-------------|-----------------|---------------|
| id | number | `id` | hidden | ID |
| start | string | `start` | visible | Start |
| end | string | `end` | visible | End |
| timezoneOffset | string | `timezone_offset` | hidden | Timezone |
| scoreState | ScoreState | `score_state` | hidden | Score State |
| + createdAt | string | `created_at` | hidden | Created |
| + updatedAt | string | `updated_at` | hidden | Updated |
| strain | number \| null | `score.strain` | visible | Strain |
| kilojoule | number \| null | `score.kilojoule` | visible | Calories |
| averageHeartRate | number \| null | `score.average_heart_rate` | visible | Avg HR |
| maxHeartRate | number \| null | `score.max_heart_rate` | visible | Max HR |

**New fields: 2** (createdAt, updatedAt)

---

### Recovery (UPDATED)

Existing fields retained. New fields marked with `+`.

| Field | Type | Source (API) | Display Default | Column Header |
|-------|------|-------------|-----------------|---------------|
| cycleId | number | `cycle_id` | hidden | Cycle ID |
| + cycleDate | string \| null | **computed at render time** via `meta.cycleLookup` (not stored on interface) | visible | Cycle |
| sleepId | string | `sleep_id` | hidden | Sleep ID |
| scoreState | ScoreState | `score_state` | hidden | Score State |
| + createdAt | string | `created_at` | hidden | Created |
| + updatedAt | string | `updated_at` | hidden | Updated |
| + userCalibrating | boolean | `score.user_calibrating` | visible | Calibrating |
| recoveryScore | number \| null | `score.recovery_score` | visible | Recovery |
| restingHeartRate | number \| null | `score.resting_heart_rate` | visible | Resting HR |
| hrvRmssdMs | number \| null | `score.hrv_rmssd_milli` | visible | HRV |
| spo2Pct | number \| null | `score.spo2_percentage` | visible | SpO2 |
| skinTempCelsius | number \| null | `score.skin_temp_celsius` | visible | Skin Temp |

**New fields: 4** (cycleDate, createdAt, updatedAt, userCalibrating)

---

### Workout (UPDATED)

Existing fields retained. New fields marked with `+`.

| Field | Type | Source (API) | Display Default | Column Header |
|-------|------|-------------|-----------------|---------------|
| id | string | `id` | hidden | ID |
| start | string | `start` | visible | Start |
| end | string | `end` | visible (as Duration) | End |
| timezoneOffset | string | `timezone_offset` | hidden | Timezone |
| sportName | string | `sport_name` | visible | Activity |
| scoreState | ScoreState | `score_state` | hidden | Score State |
| + createdAt | string | `created_at` | hidden | Created |
| + updatedAt | string | `updated_at` | hidden | Updated |
| strain | number \| null | `score.strain` | visible | Strain |
| averageHeartRate | number \| null | `score.average_heart_rate` | visible | Avg HR |
| maxHeartRate | number \| null | `score.max_heart_rate` | visible | Max HR |
| kilojoule | number \| null | `score.kilojoule` | visible | Calories |
| + percentRecorded | number \| null | `score.percent_recorded` | visible | % Recorded |
| distanceMeters | number \| null | `score.distance_meter` | visible | Distance |
| + altitudeGainMeters | number \| null | `score.altitude_gain_meter` | visible | Alt. Gain |
| + altitudeChangeMeters | number \| null | `score.altitude_change_meter` | visible | Alt. Change |
| + zoneZeroMs | number \| null | `score.zone_durations.zone_zero_milli` | visible | Zone 0 |
| + zoneOneMs | number \| null | `score.zone_durations.zone_one_milli` | visible | Zone 1 |
| + zoneTwoMs | number \| null | `score.zone_durations.zone_two_milli` | visible | Zone 2 |
| + zoneThreeMs | number \| null | `score.zone_durations.zone_three_milli` | visible | Zone 3 |
| + zoneFourMs | number \| null | `score.zone_durations.zone_four_milli` | visible | Zone 4 |
| + zoneFiveMs | number \| null | `score.zone_durations.zone_five_milli` | visible | Zone 5 |

**New fields: 10** (createdAt, updatedAt, percentRecorded, altitudeGainMeters, altitudeChangeMeters, zoneZeroMs through zoneFiveMs)

---

### BodyMeasurement (NEW)

| Field | Type | Source (API) | Column Header |
|-------|------|-------------|---------------|
| heightMeter | number | `height_meter` | Height |
| weightKilogram | number | `weight_kilogram` | Weight |
| maxHeartRate | number | `max_heart_rate` | Max HR |

**Note**: Single-record entity, not a table. Displayed as a card with 3 values.

---

### ColumnPreferences (NEW — localStorage model)

| Field | Type | Description |
|-------|------|-------------|
| visibility | Record<string, boolean> | Map of columnId → visible (only stores overrides from defaults) |
| order | string[] | Ordered array of column IDs |

**Storage key pattern**: `whoop_columns_{tableName}` (e.g., `whoop_columns_sleep`)

**Migration rules**:
- Unknown column IDs in stored preferences are ignored on load.
- New columns not in stored `order` array are appended at the end in their default position.
- New columns not in stored `visibility` map use their default visibility.

## Relationships

```text
Cycle (1) ─────< (many) SleepRecord     via cycleId
Cycle (1) ─────< (1)    Recovery         via cycleId
Recovery (1) ──< (1)    SleepRecord      via sleepId
Cycle (1) ─────< (many) Workout          via time overlap (no explicit FK)
```

- Sleep and Recovery tables resolve `cycleId` to a human-readable cycle date using a `Map<number, string>` built from loaded cycle data.
- Fallback: raw cycleId displayed if cycle data not available.
