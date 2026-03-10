import { describe, it, expect } from "vitest"
import {
  formatDuration,
  formatPercentage,
  formatKjToKcal,
  formatDate,
  formatDecimal,
  formatMeters,
} from "@/lib/formatters"

describe("formatDuration", () => {
  it("converts milliseconds to hours:minutes", () => {
    expect(formatDuration(28800000)).toBe("8h 00m")
  })

  it("handles minutes correctly", () => {
    expect(formatDuration(5400000)).toBe("1h 30m")
  })

  it("handles zero", () => {
    expect(formatDuration(0)).toBe("0h 00m")
  })

  it("returns dash for null", () => {
    expect(formatDuration(null)).toBe("—")
  })

  it("handles minutes-only durations", () => {
    expect(formatDuration(2700000)).toBe("0h 45m")
  })
})

describe("formatPercentage", () => {
  it("formats a percentage value", () => {
    expect(formatPercentage(94.1)).toBe("94%")
  })

  it("rounds to nearest integer", () => {
    expect(formatPercentage(78.6)).toBe("79%")
  })

  it("returns dash for null", () => {
    expect(formatPercentage(null)).toBe("—")
  })
})

describe("formatKjToKcal", () => {
  it("converts kilojoules to kilocalories", () => {
    expect(formatKjToKcal(8288)).toBe("1,981")
  })

  it("returns dash for null", () => {
    expect(formatKjToKcal(null)).toBe("—")
  })
})

describe("formatDate", () => {
  it("formats ISO date to short local format", () => {
    const result = formatDate("2026-03-01T09:00:00.000Z")
    expect(result).toMatch(/Mar \d{1,2}/)
  })

  it("returns dash for null/undefined", () => {
    expect(formatDate(null)).toBe("—")
  })
})

describe("formatDecimal", () => {
  it("formats to one decimal place", () => {
    expect(formatDecimal(15.23)).toBe("15.2")
  })

  it("returns dash for null", () => {
    expect(formatDecimal(null)).toBe("—")
  })
})

describe("formatMeters", () => {
  it("converts meters to km", () => {
    expect(formatMeters(8045)).toBe("8.0 km")
  })

  it("returns dash for null", () => {
    expect(formatMeters(null)).toBe("—")
  })

  it("handles zero", () => {
    expect(formatMeters(0)).toBe("0.0 km")
  })
})
