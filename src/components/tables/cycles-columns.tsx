import { type ColumnDef } from "@tanstack/react-table"
import type { Cycle } from "@/lib/types"
import {
  formatDate,
  formatDecimal,
  formatKjToKcal,
  formatInteger,
} from "@/lib/formatters"

export const cyclesColumns: ColumnDef<Cycle, unknown>[] = [
  {
    id: "date",
    accessorKey: "start",
    header: "Date",
    cell: ({ getValue }) => formatDate(getValue() as string),
  },
  {
    accessorKey: "strain",
    header: "Strain",
    cell: ({ getValue }) => formatDecimal(getValue() as number | null),
  },
  {
    accessorKey: "kilojoule",
    header: "Calories",
    cell: ({ getValue }) => formatKjToKcal(getValue() as number | null),
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
]
