import { describe, it, expect } from "vitest"
import {
  formatDuration,
  formatPercentage,
  formatKjToKcal,
  formatDate,
  formatDateTime,
  formatBoolean,
  formatDecimal,
  formatMeters,
  formatInteger,
  formatNumber,
} from "@/lib/formatters"

describe("formatDuration", () => {
  it("converts milliseconds to decimal hours", () => {
    expect(formatDuration(28800000)).toBe("8.00")
  })

  it("handles minutes correctly", () => {
    expect(formatDuration(5400000)).toBe("1.50")
  })

  it("handles zero", () => {
    expect(formatDuration(0)).toBe("0.00")
  })

  it("returns dash for null", () => {
    expect(formatDuration(null)).toBe("—")
  })

  it("handles minutes-only durations", () => {
    expect(formatDuration(2700000)).toBe("0.75")
  })

  it("handles 8h 15m as 8.25", () => {
    expect(formatDuration(29700000)).toBe("8.25")
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
  it("converts meters to km without unit suffix", () => {
    expect(formatMeters(8045)).toBe("8.0")
  })

  it("returns dash for null", () => {
    expect(formatMeters(null)).toBe("—")
  })

  it("handles zero", () => {
    expect(formatMeters(0)).toBe("0.0")
  })
})

describe("formatDateTime", () => {
  it("formats ISO string to date and time", () => {
    const result = formatDateTime("2026-03-10T22:30:00.000Z")
    // Should include month, day, and time components
    expect(result).toContain("Mar")
    expect(result).toMatch(/\d{1,2}/)
  })

  it("returns dash for null", () => {
    expect(formatDateTime(null)).toBe("—")
  })

  it("returns dash for undefined", () => {
    expect(formatDateTime(undefined)).toBe("—")
  })

  it("returns dash for empty string", () => {
    expect(formatDateTime("")).toBe("—")
  })
})

describe("formatBoolean", () => {
  it("returns Yes for true", () => {
    expect(formatBoolean(true)).toBe("Yes")
  })

  it("returns No for false", () => {
    expect(formatBoolean(false)).toBe("No")
  })

  it("returns dash for null", () => {
    expect(formatBoolean(null)).toBe("—")
  })

  it("returns dash for undefined", () => {
    expect(formatBoolean(undefined)).toBe("—")
  })
})

describe("formatInteger", () => {
  it("formats integer value", () => {
    expect(formatInteger(42)).toBe("42")
  })

  it("rounds decimal value", () => {
    expect(formatInteger(42.7)).toBe("43")
  })

  it("returns dash for null", () => {
    expect(formatInteger(null)).toBe("—")
  })

  it("formats large numbers with commas", () => {
    expect(formatInteger(1234)).toBe("1,234")
  })

  it("formats very large numbers with commas", () => {
    expect(formatInteger(12345678)).toBe("12,345,678")
  })
})

describe("formatNumber", () => {
  it("formats with comma separators and decimal places", () => {
    expect(formatNumber(1234.5, 2)).toBe("1,234.50")
  })

  it("formats small numbers without commas", () => {
    expect(formatNumber(500, 0)).toBe("500")
  })

  it("returns dash for null", () => {
    expect(formatNumber(null, 2)).toBe("—")
  })

  it("handles zero", () => {
    expect(formatNumber(0, 2)).toBe("0.00")
  })

  it("defaults to 0 decimal places", () => {
    expect(formatNumber(1234)).toBe("1,234")
  })
})
