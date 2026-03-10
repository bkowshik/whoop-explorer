import { type ColumnDef } from "@tanstack/react-table"
import type { Recovery } from "@/lib/types"
import {
  formatDateTime,
  formatPercentage,
  formatBoolean,
  formatDecimal,
  formatInteger,
} from "@/lib/formatters"

export const recoveryColumns: ColumnDef<Recovery, unknown>[] = [
  {
    id: "cycleId",
    accessorKey: "cycleId",
    header: "Cycle ID",
    meta: { defaultVisible: false },
  },
  {
    id: "cycleDate",
    header: "Cycle",
    accessorKey: "cycleId",
    cell: ({ getValue, table }) => {
      const cycleId = getValue() as number
      const cycleLookup = (table.options.meta as Record<string, unknown> | undefined)?.cycleLookup as Map<number, string> | undefined
      return cycleLookup?.get(cycleId) ?? String(cycleId)
    },
    meta: { defaultVisible: true },
  },
  {
    id: "sleepId",
    accessorKey: "sleepId",
    header: "Sleep ID",
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
    id: "userCalibrating",
    accessorKey: "userCalibrating",
    header: "Calibrating",
    cell: ({ getValue }) => formatBoolean(getValue() as boolean | null),
    meta: { defaultVisible: true },
  },
  {
    id: "recoveryScore",
    accessorKey: "recoveryScore",
    header: "Recovery",
    cell: ({ getValue }) => formatPercentage(getValue() as number | null),
    meta: { defaultVisible: true },
  },
  {
    id: "restingHeartRate",
    accessorKey: "restingHeartRate",
    header: "Resting HR",
    cell: ({ getValue }) => formatInteger(getValue() as number | null),
    meta: { defaultVisible: true },
  },
  {
    id: "hrvRmssdMs",
    accessorKey: "hrvRmssdMs",
    header: "HRV",
    cell: ({ getValue }) => formatDecimal(getValue() as number | null),
    meta: { defaultVisible: true },
  },
  {
    id: "spo2Pct",
    accessorKey: "spo2Pct",
    header: "SpO2",
    cell: ({ getValue }) => formatPercentage(getValue() as number | null),
    meta: { defaultVisible: true },
  },
  {
    id: "skinTempCelsius",
    accessorKey: "skinTempCelsius",
    header: "Skin Temp",
    cell: ({ getValue }) => {
      const v = getValue() as number | null
      return v !== null ? `${v.toFixed(1)}°C` : "—"
    },
    meta: { defaultVisible: true },
  },
]
