import { type ColumnDef } from "@tanstack/react-table"
import type { Recovery } from "@/lib/types"
import {
  formatPercentage,
  formatDecimal,
  formatInteger,
} from "@/lib/formatters"

export const recoveryColumns: ColumnDef<Recovery, unknown>[] = [
  {
    id: "date",
    accessorKey: "cycleId",
    header: "Cycle ID",
    cell: ({ getValue }) => String(getValue()),
  },
  {
    accessorKey: "recoveryScore",
    header: "Recovery",
    cell: ({ getValue }) => formatPercentage(getValue() as number | null),
  },
  {
    accessorKey: "hrvRmssdMs",
    header: "HRV",
    cell: ({ getValue }) => formatDecimal(getValue() as number | null),
  },
  {
    accessorKey: "restingHeartRate",
    header: "Resting HR",
    cell: ({ getValue }) => formatInteger(getValue() as number | null),
  },
  {
    accessorKey: "spo2Pct",
    header: "SpO2",
    cell: ({ getValue }) => formatPercentage(getValue() as number | null),
  },
  {
    accessorKey: "skinTempCelsius",
    header: "Skin Temp",
    cell: ({ getValue }) => {
      const v = getValue() as number | null
      return v !== null ? `${v.toFixed(1)}°C` : "—"
    },
  },
]
