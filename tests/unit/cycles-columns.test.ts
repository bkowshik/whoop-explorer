import { describe, it, expect } from "vitest"
import { computeCycleDurationHours } from "@/components/tables/cycles-columns"
import type { Cycle } from "@/lib/types"

function makeCycle(start: string, end: string): Cycle {
  return {
    id: 1,
    start,
    end,
    timezoneOffset: "+00:00",
    scoreState: "SCORED",
    createdAt: start,
    updatedAt: start,
    strain: null,
    kilojoule: null,
    averageHeartRate: null,
    maxHeartRate: null,
  }
}

describe("computeCycleDurationHours", () => {
  it("computes duration from start and end", () => {
    const cycle = makeCycle("2026-03-01T22:00:00Z", "2026-03-02T06:30:00Z")
    expect(computeCycleDurationHours(cycle)).toBeCloseTo(8.5, 2)
  })

  it("returns null when end is missing", () => {
    const cycle = makeCycle("2026-03-01T22:00:00Z", "")
    // empty string end — should return a number (0 diff), but let's test null end
    const cycleNoEnd = { ...cycle, end: "" } as unknown as Cycle
    // With empty end, new Date("").getTime() is NaN
    const result = computeCycleDurationHours(cycleNoEnd)
    expect(result).toBeNull()
  })

  it("handles same start and end (zero duration)", () => {
    const cycle = makeCycle("2026-03-01T22:00:00Z", "2026-03-01T22:00:00Z")
    expect(computeCycleDurationHours(cycle)).toBe(0)
  })
})
