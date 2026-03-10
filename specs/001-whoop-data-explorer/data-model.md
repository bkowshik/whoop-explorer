# Data Model: WHOOP Data Explorer

**Date**: 2026-03-03
**Source**: WHOOP API v2 response schemas + feature spec entities

## Entities

### SleepRecord

Represents a single night's sleep (or nap) as returned by
`/activity/sleep`.

| Field | Type | Description |
|-------|------|-------------|
| id | string (UUID) | Unique sleep record identifier |
| cycleId | number | Associated physiological cycle |
| start | string (ISO 8601) | Sleep start timestamp |
| end | string (ISO 8601) | Sleep end timestamp |
| timezoneOffset | string | UTC offset (e.g., "-05:00") |
| isNap | boolean | True if this is a nap, not overnight |
| scoreState | ScoreState | SCORED, PENDING_SCORE, or UNSCORABLE |
| totalInBedMs | number | null | Total time in bed (ms) |
| totalAwakeMs | number | null | Time awake in bed (ms) |
| totalLightSleepMs | number | null | Light sleep duration (ms) |
| totalDeepSleepMs | number | null | Slow wave sleep (ms) |
| totalRemSleepMs | number | null | REM sleep duration (ms) |
| sleepCycleCount | number | null | Number of sleep cycles |
| disturbanceCount | number | null | Number of disturbances |
| sleepPerformancePct | number | null | Sleep performance (0-100%) |
| sleepEfficiencyPct | number | null | Sleep efficiency (0-100%) |
| respiratoryRate | number | null | Breaths per minute |

**Null rule**: Score-derived fields are null when
`scoreState !== "SCORED"`.

**Identity**: Unique by `id` (UUID). One record per sleep/nap.

### Cycle

Represents a single physiological day as returned by `/cycle`.

| Field | Type | Description |
|-------|------|-------------|
| id | number | Unique cycle identifier |
| start | string (ISO 8601) | Cycle start timestamp |
| end | string (ISO 8601) | Cycle end timestamp |
| timezoneOffset | string | UTC offset |
| scoreState | ScoreState | Scoring status |
| strain | number | null | Strain score (0-21 scale) |
| kilojoule | number | null | Energy burned (kJ) |
| averageHeartRate | number | null | Avg HR (bpm) |
| maxHeartRate | number | null | Max HR (bpm) |

**Identity**: Unique by `id` (integer).

### Recovery

Represents a single day's recovery measurement as returned by
`/activity/recovery`.

| Field | Type | Description |
|-------|------|-------------|
| cycleId | number | Associated cycle (primary key) |
| sleepId | string (UUID) | Associated sleep record |
| scoreState | ScoreState | Scoring status |
| recoveryScore | number | null | Recovery (0-100%) |
| restingHeartRate | number | null | Resting HR (bpm) |
| hrvRmssdMs | number | null | HRV RMSSD (ms) |
| spo2Pct | number | null | Blood oxygen (%) |
| skinTempCelsius | number | null | Skin temperature (°C) |

**Identity**: Unique by `cycleId`. One recovery per cycle.

**Note**: `spo2Pct` and `skinTempCelsius` are only available
for WHOOP 4.0+ devices. May be null for older hardware.

### Workout

Represents a single workout session as returned by
`/activity/workout`.

| Field | Type | Description |
|-------|------|-------------|
| id | string (UUID) | Unique workout identifier |
| start | string (ISO 8601) | Workout start timestamp |
| end | string (ISO 8601) | Workout end timestamp |
| timezoneOffset | string | UTC offset |
| sportName | string | Activity type (e.g., "Running") |
| scoreState | ScoreState | Scoring status |
| strain | number | null | Workout strain (0-21) |
| averageHeartRate | number | null | Avg HR (bpm) |
| maxHeartRate | number | null | Max HR (bpm) |
| kilojoule | number | null | Energy burned (kJ) |
| distanceMeters | number | null | Distance (meters) |

**Identity**: Unique by `id` (UUID). Multiple workouts per day.

### UserSession

Client-side only. Not stored on any server.

| Field | Type | Description |
|-------|------|-------------|
| accessToken | string | OAuth2 bearer token |
| refreshToken | string | OAuth2 refresh token |
| expiresAt | number | Token expiry (Unix timestamp ms) |
| userId | number | WHOOP user ID |
| firstName | string | User's first name |
| email | string | User's email |

**Storage**: Browser localStorage (persisted across sessions).
Cleared entirely on disconnect (FR-016).

## Enums

### ScoreState

```
SCORED          — Full score data available
PENDING_SCORE   — Data exists but not yet scored
UNSCORABLE      — Cannot be scored (insufficient data)
```

## Relationships

```
Cycle 1───1 Recovery     (via cycleId)
Cycle 1───* SleepRecord  (via cycleId; usually 1, but naps add more)
Cycle 1───* Workout      (via date overlap; no direct FK in API)
```

Recovery is always linked to a Cycle. Sleep records reference a
Cycle via `cycleId`. Workouts have no direct cycle reference in
the API; they are associated by overlapping date ranges.

## Table Column Definitions

### Sleep Table Columns

| Column | Source Field | Display Format |
|--------|-------------|----------------|
| Date | start | Local date (MMM DD) |
| Duration | totalInBedMs | Hours:minutes |
| Efficiency | sleepEfficiencyPct | Percentage |
| Performance | sleepPerformancePct | Percentage |
| Deep | totalDeepSleepMs | Hours:minutes |
| REM | totalRemSleepMs | Hours:minutes |
| Light | totalLightSleepMs | Hours:minutes |
| Awake | totalAwakeMs | Minutes |
| Disturbances | disturbanceCount | Integer |
| Resp. Rate | respiratoryRate | Decimal (1 place) |

### Cycle Table Columns

| Column | Source Field | Display Format |
|--------|-------------|----------------|
| Date | start | Local date (MMM DD) |
| Strain | strain | Decimal (1 place, 0-21) |
| Calories | kilojoule | Converted to kcal |
| Avg HR | averageHeartRate | Integer (bpm) |
| Max HR | maxHeartRate | Integer (bpm) |

### Recovery Table Columns

| Column | Source Field | Display Format |
|--------|-------------|----------------|
| Date | cycleId → cycle.start | Local date (MMM DD) |
| Recovery | recoveryScore | Percentage with color |
| HRV | hrvRmssdMs | Decimal (1 place, ms) |
| Resting HR | restingHeartRate | Integer (bpm) |
| SpO2 | spo2Pct | Percentage |
| Skin Temp | skinTempCelsius | Decimal (1 place, °C) |

### Workout Table Columns

| Column | Source Field | Display Format |
|--------|-------------|----------------|
| Date | start | Local date (MMM DD) |
| Activity | sportName | Text |
| Duration | end - start | Hours:minutes |
| Strain | strain | Decimal (1 place, 0-21) |
| Avg HR | averageHeartRate | Integer (bpm) |
| Max HR | maxHeartRate | Integer (bpm) |
| Calories | kilojoule | Converted to kcal |
| Distance | distanceMeters | Converted to km/mi |

## Summary Statistics (per collection, above table)

### Sleep Summary
- Average sleep duration (last N days)
- Average sleep efficiency
- Average sleep performance

### Cycle Summary
- Average daily strain
- Average daily calories (kcal)
- Average heart rate

### Recovery Summary
- Average recovery score
- Average HRV
- Average resting heart rate

### Workout Summary
- Total workouts in range
- Average workout strain
- Total calories burned (kcal)
