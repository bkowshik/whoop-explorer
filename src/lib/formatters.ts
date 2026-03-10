const DASH = "—"

export function formatDuration(ms: number | null): string {
  if (ms === null) return DASH
  const hours = ms / 3600000
  return hours.toFixed(2)
}

export function formatPercentage(value: number | null): string {
  if (value === null) return DASH
  return `${Math.round(value)}%`
}

export function formatKjToKcal(kj: number | null): string {
  if (kj === null) return DASH
  const kcal = Math.round(kj / 4.184)
  return kcal.toLocaleString("en-US")
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return DASH
  const date = new Date(iso)
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function formatDecimal(
  value: number | null,
  places: number = 1,
): string {
  if (value === null) return DASH
  return value.toFixed(places)
}

export function formatMeters(meters: number | null): string {
  if (meters === null) return DASH
  const km = meters / 1000
  return km.toFixed(1)
}

const integerFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
})

export function formatInteger(value: number | null): string {
  if (value === null) return DASH
  return integerFormatter.format(Math.round(value))
}

export function formatNumber(
  value: number | null,
  decimalPlaces: number = 0,
): string {
  if (value === null) return DASH
  const formatter = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  })
  return formatter.format(value)
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return DASH
  const date = new Date(iso)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export function formatBoolean(value: boolean | null | undefined): string {
  if (value === null || value === undefined) return DASH
  return value ? "Yes" : "No"
}
