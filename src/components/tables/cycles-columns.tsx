import { type ColumnDef } from "@tanstack/react-table"
import type { Cycle } from "@/lib/types"
import "@/lib/table-types"
import {
  formatDateTime,
  formatDecimal,
  formatKjToKcal,
  formatInteger,
  formatDuration,
} from "@/lib/formatters"

export function computeCycleDurationHours(row: Cycle): number | null {
  if (!row.start || !row.end) return null
  const ms = new Date(row.end).getTime() - new Date(row.start).getTime()
  return ms / 3600000
}

export const cyclesColumns: ColumnDef<Cycle, unknown>[] = [
  {
    id: "id",
    accessorKey: "id",
    header: "ID",
    meta: { defaultVisible: false },
  },
  {
    id: "start",
    accessorKey: "start",
    header: "Start",
    cell: ({ getValue }) => formatDateTime(getValue() as string),
    meta: { defaultVisible: true },
  },
  {
    id: "end",
    accessorKey: "end",
    header: "End",
    cell: ({ getValue }) => formatDateTime(getValue() as string),
    meta: { defaultVisible: true },
  },
  {
    id: "duration",
    header: "Duration",
    accessorFn: (row) => {
      const hours = computeCycleDurationHours(row)
      if (hours === null) return null
      return hours * 3600000
    },
    cell: ({ getValue }) => formatDuration(getValue() as number | null),
    meta: { defaultVisible: true, align: "right", unit: "hrs" },
  },
  {
    id: "timezoneOffset",
    accessorKey: "timezoneOffset",
    header: "Timezone",
    meta: { defaultVisible: false },
  },
  {
    id: "scoreState",
    accessorKey: "scoreState",
    header: "Score State",
    meta: { defaultVisible: false },
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ getValue }) => formatDateTime(getValue() as string),
    meta: { defaultVisible: false },
  },
  {
    id: "updatedAt",
    accessorKey: "updatedAt",
    header: "Updated",
    cell: ({ getValue }) => formatDateTime(getValue() as string),
    meta: { defaultVisible: false },
  },
  {
    id: "strain",
    accessorKey: "strain",
    header: "Strain",
    cell: ({ getValue }) => formatDecimal(getValue() as number | null),
    meta: { defaultVisible: true, align: "right" },
  },
  {
    id: "kilojoule",
    accessorKey: "kilojoule",
    header: "Calories",
    cell: ({ getValue }) => formatKjToKcal(getValue() as number | null),
    meta: { defaultVisible: true, align: "right", unit: "kcal" },
  },
  {
    id: "averageHeartRate",
    accessorKey: "averageHeartRate",
    header: "Avg HR",
    cell: ({ getValue }) => formatInteger(getValue() as number | null),
    meta: { defaultVisible: true, align: "right", unit: "bpm" },
  },
  {
    id: "maxHeartRate",
    accessorKey: "maxHeartRate",
    header: "Max HR",
    cell: ({ getValue }) => formatInteger(getValue() as number | null),
    meta: { defaultVisible: true, align: "right", unit: "bpm" },
  },
]
