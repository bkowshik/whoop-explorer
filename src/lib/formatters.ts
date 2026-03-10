const DASH = "—"

export function formatDuration(ms: number | null): string {
  if (ms === null) return DASH
  const totalMinutes = Math.round(ms / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${hours}h ${String(minutes).padStart(2, "0")}m`
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
  return `${km.toFixed(1)} km`
}

export function formatInteger(value: number | null): string {
  if (value === null) return DASH
  return String(Math.round(value))
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
