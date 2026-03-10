import { type ColumnDef } from "@tanstack/react-table"
import type { Workout } from "@/lib/types"
import {
  formatDate,
  formatDuration,
  formatDecimal,
  formatInteger,
  formatKjToKcal,
  formatMeters,
} from "@/lib/formatters"

export const workoutsColumns: ColumnDef<Workout, unknown>[] = [
  {
    id: "date",
    accessorKey: "start",
    header: "Date",
    cell: ({ getValue }) => formatDate(getValue() as string),
  },
  {
    accessorKey: "sportName",
    header: "Activity",
  },
  {
    id: "duration",
    header: "Duration",
    accessorFn: (row) => {
      if (!row.start || !row.end) return null
      return new Date(row.end).getTime() - new Date(row.start).getTime()
    },
    cell: ({ getValue }) => formatDuration(getValue() as number | null),
  },
  {
    accessorKey: "strain",
    header: "Strain",
    cell: ({ getValue }) => formatDecimal(getValue() as number | null),
  },
  {
    accessorKey: "averageHeartRate",
    header: "Avg HR",
    cell: ({ getValue }) => formatInteger(getValue() as number | null),
  },
  {
    accessorKey: "maxHeartRate",
    header: "Max HR",
    cell: ({ getValue }) => formatInteger(getValue() as number | null),
  },
  {
    accessorKey: "kilojoule",
    header: "Calories",
    cell: ({ getValue }) => formatKjToKcal(getValue() as number | null),
  },
  {
    accessorKey: "distanceMeters",
    header: "Distance",
    cell: ({ getValue }) => formatMeters(getValue() as number | null),
  },
]
