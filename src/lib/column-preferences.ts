export interface ColumnPreferences {
  visibility: Record<string, boolean>
  order: string[]
}

const STORAGE_PREFIX = "whoop_columns_"

export function saveColumnPreferences(
  tableName: string,
  prefs: ColumnPreferences,
): void {
  localStorage.setItem(
    `${STORAGE_PREFIX}${tableName}`,
    JSON.stringify(prefs),
  )
}

export function loadColumnPreferences(
  tableName: string,
  defaults: ColumnPreferences,
): ColumnPreferences {
  const raw = localStorage.getItem(`${STORAGE_PREFIX}${tableName}`)
  if (!raw) return defaults

  let stored: ColumnPreferences
  try {
    stored = JSON.parse(raw) as ColumnPreferences
  } catch {
    return defaults
  }

  const knownColumns = new Set(defaults.order)

  // Filter visibility to only known columns, merge with defaults
  const visibility: Record<string, boolean> = { ...defaults.visibility }
  for (const [col, visible] of Object.entries(stored.visibility)) {
    if (knownColumns.has(col)) {
      visibility[col] = visible
    }
  }

  // Filter stored order to only known columns, then append new ones
  const storedKnown = stored.order.filter((col) => knownColumns.has(col))
  const storedSet = new Set(storedKnown)
  const newColumns = defaults.order.filter((col) => !storedSet.has(col))
  const order = [...storedKnown, ...newColumns]

  return { visibility, order }
}
