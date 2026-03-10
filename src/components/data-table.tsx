import { useState, useEffect, useMemo } from "react"
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  type TableMeta,
  type Header,
} from "@tanstack/react-table"
import "@/lib/table-types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { ColumnToggle } from "@/components/column-toggle"
import {
  loadColumnPreferences,
  saveColumnPreferences,
} from "@/lib/column-preferences"

interface DataTableProps<T> {
  columns: ColumnDef<T, unknown>[]
  data: T[]
  isLoading?: boolean
  emptyMessage?: string
  tableId?: string
  meta?: TableMeta<T>
}

function getDefaultVisibility<T>(columns: ColumnDef<T, unknown>[]): VisibilityState {
  const visibility: VisibilityState = {}
  for (const col of columns) {
    const id = col.id ?? (col as { accessorKey?: string }).accessorKey
    if (id) {
      const meta = col.meta as { defaultVisible?: boolean } | undefined
      visibility[id] = meta?.defaultVisible !== false
    }
  }
  return visibility
}

function getColumnIds<T>(columns: ColumnDef<T, unknown>[]): string[] {
  return columns
    .map((col) => col.id ?? (col as { accessorKey?: string }).accessorKey)
    .filter(Boolean) as string[]
}

export function DataTable<T>({
  columns,
  data,
  isLoading = false,
  emptyMessage = "No data for this period",
  tableId,
  meta: tableMeta,
}: DataTableProps<T>) {
  const getHeaderLabel = (header: Header<T, unknown>) => {
    if (header.isPlaceholder) return null
    const rendered = flexRender(header.column.columnDef.header, header.getContext())
    const unit = header.column.columnDef.meta?.unit
    if (unit) return <>{rendered} ({unit})</>
    return rendered
  }

  const defaultVisibility = useMemo(() => getDefaultVisibility(columns), [columns])
  const defaultOrder = useMemo(() => getColumnIds(columns), [columns])

  const [sorting, setSorting] = useState<SortingState>([
    { id: "start", desc: true },
  ])

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() => {
    if (!tableId) return defaultVisibility
    const prefs = loadColumnPreferences(tableId, {
      visibility: defaultVisibility,
      order: defaultOrder,
    })
    return prefs.visibility as VisibilityState
  })

  const [columnOrder, setColumnOrder] = useState<string[]>(() => {
    if (!tableId) return defaultOrder
    const prefs = loadColumnPreferences(tableId, {
      visibility: defaultVisibility,
      order: defaultOrder,
    })
    return prefs.order
  })

  useEffect(() => {
    if (!tableId) return
    saveColumnPreferences(tableId, {
      visibility: columnVisibility as Record<string, boolean>,
      order: columnOrder,
    })
  }, [tableId, columnVisibility, columnOrder])

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnVisibility, columnOrder },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    meta: tableMeta,
  })

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <ColumnToggle
          table={table}
          columnOrder={columnOrder}
          onColumnOrderChange={setColumnOrder}
        />
      </div>
      <div className="relative max-h-[70vh] overflow-auto rounded-md border">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-background">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const sorted = header.column.getIsSorted()
                  const isRight = header.column.columnDef.meta?.align === "right"
                  return (
                  <TableHead
                    key={header.id}
                    className={[
                      header.column.getCanSort()
                        ? "cursor-pointer select-none"
                        : "",
                      isRight ? "text-right" : "",
                    ].filter(Boolean).join(" ")}
                    onClick={header.column.getToggleSortingHandler()}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        header.column.getToggleSortingHandler()?.(e)
                      }
                    }}
                    tabIndex={header.column.getCanSort() ? 0 : undefined}
                    role={header.column.getCanSort() ? "button" : undefined}
                    aria-sort={
                      sorted === "asc"
                        ? "ascending"
                        : sorted === "desc"
                          ? "descending"
                          : undefined
                    }
                  >
                    <div className={`flex items-center gap-1 ${isRight ? "justify-end" : ""}`}>
                      {getHeaderLabel(header)}
                      {{
                        asc: " \u2191",
                        desc: " \u2193",
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
                  </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="even:bg-muted/30 hover:bg-muted/60">
                  {row.getVisibleCells().map((cell) => {
                    const isRight = cell.column.columnDef.meta?.align === "right"
                    return (
                    <TableCell
                      key={cell.id}
                      className={`py-2 px-3 ${isRight ? "text-right font-mono tabular-nums" : ""}`}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                    )
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
