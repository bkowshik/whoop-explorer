import { type ColumnDef } from "@tanstack/react-table"
import type { Cycle } from "@/lib/types"
import {
  formatDateTime,
  formatDecimal,
  formatKjToKcal,
  formatInteger,
} from "@/lib/formatters"

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
    meta: { defaultVisible: true },
  },
  {
    id: "kilojoule",
    accessorKey: "kilojoule",
    header: "Calories",
    cell: ({ getValue }) => formatKjToKcal(getValue() as number | null),
    meta: { defaultVisible: true },
  },
  {
    id: "averageHeartRate",
    accessorKey: "averageHeartRate",
    header: "Avg HR",
    cell: ({ getValue }) => formatInteger(getValue() as number | null),
    meta: { defaultVisible: true },
  },
  {
    id: "maxHeartRate",
    accessorKey: "maxHeartRate",
    header: "Max HR",
    cell: ({ getValue }) => formatInteger(getValue() as number | null),
    meta: { defaultVisible: true },
  },
]
