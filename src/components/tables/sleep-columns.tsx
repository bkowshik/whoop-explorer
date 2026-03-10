import { type ColumnDef } from "@tanstack/react-table"
import type { SleepRecord } from "@/lib/types"
import {
  formatDate,
  formatDuration,
  formatPercentage,
  formatInteger,
  formatDecimal,
} from "@/lib/formatters"

export const sleepColumns: ColumnDef<SleepRecord, unknown>[] = [
  {
    id: "date",
    accessorKey: "start",
    header: "Date",
    cell: ({ getValue }) => formatDate(getValue() as string),
  },
  {
    accessorKey: "totalInBedMs",
    header: "Duration",
    cell: ({ getValue }) => formatDuration(getValue() as number | null),
  },
  {
    accessorKey: "sleepEfficiencyPct",
    header: "Efficiency",
    cell: ({ getValue }) => formatPercentage(getValue() as number | null),
  },
  {
    accessorKey: "sleepPerformancePct",
    header: "Performance",
    cell: ({ getValue }) => formatPercentage(getValue() as number | null),
  },
  {
    accessorKey: "totalDeepSleepMs",
    header: "Deep",
    cell: ({ getValue }) => formatDuration(getValue() as number | null),
  },
  {
    accessorKey: "totalRemSleepMs",
    header: "REM",
    cell: ({ getValue }) => formatDuration(getValue() as number | null),
  },
  {
    accessorKey: "totalLightSleepMs",
    header: "Light",
    cell: ({ getValue }) => formatDuration(getValue() as number | null),
  },
  {
    accessorKey: "totalAwakeMs",
    header: "Awake",
    cell: ({ getValue }) => formatDuration(getValue() as number | null),
  },
  {
    accessorKey: "disturbanceCount",
    header: "Disturbances",
    cell: ({ getValue }) => formatInteger(getValue() as number | null),
  },
  {
    accessorKey: "respiratoryRate",
    header: "Resp. Rate",
    cell: ({ getValue }) => formatDecimal(getValue() as number | null),
  },
]
