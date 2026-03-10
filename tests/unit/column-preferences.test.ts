import { describe, it, expect, beforeEach } from "vitest"
import {
  saveColumnPreferences,
  loadColumnPreferences,
} from "@/lib/column-preferences"

beforeEach(() => {
  localStorage.clear()
})

describe("saveColumnPreferences", () => {
  it("saves visibility and order to localStorage", () => {
    saveColumnPreferences("sleep", {
      visibility: { createdAt: false, id: false },
      order: ["date", "end", "duration"],
    })

    const stored = localStorage.getItem("whoop_columns_sleep")
    expect(stored).not.toBeNull()
    const parsed = JSON.parse(stored!)
    expect(parsed.visibility).toEqual({ createdAt: false, id: false })
    expect(parsed.order).toEqual(["date", "end", "duration"])
  })
})

describe("loadColumnPreferences", () => {
  it("returns defaults when no stored preferences exist", () => {
    const defaults = {
      visibility: { date: true, id: false },
      order: ["date", "id"],
    }
    const result = loadColumnPreferences("sleep", defaults)
    expect(result).toEqual(defaults)
  })

  it("loads stored preferences", () => {
    const prefs = {
      visibility: { date: true, id: true },
      order: ["id", "date"],
    }
    localStorage.setItem("whoop_columns_sleep", JSON.stringify(prefs))

    const defaults = {
      visibility: { date: true, id: false },
      order: ["date", "id"],
    }
    const result = loadColumnPreferences("sleep", defaults)
    expect(result.visibility).toEqual({ date: true, id: true })
    expect(result.order).toEqual(["id", "date"])
  })

  it("ignores unknown column IDs in stored preferences", () => {
    const prefs = {
      visibility: { date: true, unknownCol: true },
      order: ["unknownCol", "date"],
    }
    localStorage.setItem("whoop_columns_sleep", JSON.stringify(prefs))

    const defaults = {
      visibility: { date: true, id: false },
      order: ["date", "id"],
    }
    const result = loadColumnPreferences("sleep", defaults)
    // unknownCol should be stripped from visibility
    expect(result.visibility.unknownCol).toBeUndefined()
    // unknownCol should be stripped from order
    expect(result.order).not.toContain("unknownCol")
  })

  it("appends new columns not in stored order at the end", () => {
    const prefs = {
      visibility: { date: true },
      order: ["date"],
    }
    localStorage.setItem("whoop_columns_sleep", JSON.stringify(prefs))

    const defaults = {
      visibility: { date: true, id: false, newCol: true },
      order: ["date", "id", "newCol"],
    }
    const result = loadColumnPreferences("sleep", defaults)
    // new columns appended after stored ones
    expect(result.order).toEqual(["date", "id", "newCol"])
  })

  it("uses default visibility for new columns not in stored preferences", () => {
    const prefs = {
      visibility: { date: true },
      order: ["date"],
    }
    localStorage.setItem("whoop_columns_sleep", JSON.stringify(prefs))

    const defaults = {
      visibility: { date: true, newCol: false },
      order: ["date", "newCol"],
    }
    const result = loadColumnPreferences("sleep", defaults)
    expect(result.visibility.newCol).toBe(false)
  })

  it("handles corrupted localStorage gracefully", () => {
    localStorage.setItem("whoop_columns_sleep", "not valid json{{{")

    const defaults = {
      visibility: { date: true },
      order: ["date"],
    }
    const result = loadColumnPreferences("sleep", defaults)
    expect(result).toEqual(defaults)
  })
})
