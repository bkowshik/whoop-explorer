import { type ColumnDef } from "@tanstack/react-table"
import type { Workout } from "@/lib/types"
import "@/lib/table-types"
import {
  formatDateTime,
  formatDuration,
  formatDecimal,
  formatInteger,
  formatPercentage,
  formatKjToKcal,
  formatMeters,
} from "@/lib/formatters"

export const workoutsColumns: ColumnDef<Workout, unknown>[] = [
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
    id: "sportName",
    accessorKey: "sportName",
    header: "Activity",
    meta: { defaultVisible: true },
  },
  {
    id: "duration",
    header: "Duration",
    accessorFn: (row) => {
      if (!row.start || !row.end) return null
      return new Date(row.end).getTime() - new Date(row.start).getTime()
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
  {
    id: "kilojoule",
    accessorKey: "kilojoule",
    header: "Calories",
    cell: ({ getValue }) => formatKjToKcal(getValue() as number | null),
    meta: { defaultVisible: true, align: "right", unit: "kcal" },
  },
  {
    id: "percentRecorded",
    accessorKey: "percentRecorded",
    header: "% Recorded",
    cell: ({ getValue }) => formatPercentage(getValue() as number | null),
    meta: { defaultVisible: true, align: "right" },
  },
  {
    id: "distanceMeters",
    accessorKey: "distanceMeters",
    header: "Distance",
    cell: ({ getValue }) => formatMeters(getValue() as number | null),
    meta: { defaultVisible: true, align: "right", unit: "km" },
  },
  {
    id: "altitudeGainMeters",
    accessorKey: "altitudeGainMeters",
    header: "Alt. Gain",
    cell: ({ getValue }) => formatMeters(getValue() as number | null),
    meta: { defaultVisible: true, align: "right", unit: "km" },
  },
  {
    id: "altitudeChangeMeters",
    accessorKey: "altitudeChangeMeters",
    header: "Alt. Change",
    cell: ({ getValue }) => formatMeters(getValue() as number | null),
    meta: { defaultVisible: true, align: "right", unit: "km" },
  },
  {
    id: "zoneZeroMs",
    accessorKey: "zoneZeroMs",
    header: "Zone 0",
    cell: ({ getValue }) => formatDuration(getValue() as number | null),
    meta: { defaultVisible: true, align: "right", unit: "hrs" },
  },
  {
    id: "zoneOneMs",
    accessorKey: "zoneOneMs",
    header: "Zone 1",
    cell: ({ getValue }) => formatDuration(getValue() as number | null),
    meta: { defaultVisible: true, align: "right", unit: "hrs" },
  },
  {
    id: "zoneTwoMs",
    accessorKey: "zoneTwoMs",
    header: "Zone 2",
    cell: ({ getValue }) => formatDuration(getValue() as number | null),
    meta: { defaultVisible: true, align: "right", unit: "hrs" },
  },
  {
    id: "zoneThreeMs",
    accessorKey: "zoneThreeMs",
    header: "Zone 3",
    cell: ({ getValue }) => formatDuration(getValue() as number | null),
    meta: { defaultVisible: true, align: "right", unit: "hrs" },
  },
  {
    id: "zoneFourMs",
    accessorKey: "zoneFourMs",
    header: "Zone 4",
    cell: ({ getValue }) => formatDuration(getValue() as number | null),
    meta: { defaultVisible: true, align: "right", unit: "hrs" },
  },
  {
    id: "zoneFiveMs",
    accessorKey: "zoneFiveMs",
    header: "Zone 5",
    cell: ({ getValue }) => formatDuration(getValue() as number | null),
    meta: { defaultVisible: true, align: "right", unit: "hrs" },
  },
]
