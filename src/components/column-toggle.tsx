import { useState, useRef, useEffect } from "react"
import type { Table } from "@tanstack/react-table"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Button } from "@/components/ui/button"

interface ColumnToggleProps<T> {
  table: Table<T>
  columnOrder: string[]
  onColumnOrderChange: (order: string[]) => void
}

function SortableItem({
  id,
  label,
  checked,
  onToggle,
}: {
  id: string
  label: string
  checked: boolean
  onToggle: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-muted/50 rounded"
    >
      <span
        className="cursor-grab text-muted-foreground"
        {...attributes}
        {...listeners}
      >
        ⠿
      </span>
      <label className="flex items-center gap-2 flex-1 cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          className="accent-primary"
        />
        {label}
      </label>
    </div>
  )
}

export function ColumnToggle<T>({
  table,
  columnOrder,
  onColumnOrderChange,
}: ColumnToggleProps<T>) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  const allColumns = table.getAllColumns()
  const orderedColumns = columnOrder
    .map((id) => allColumns.find((c) => c.id === id))
    .filter(Boolean) as typeof allColumns

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = columnOrder.indexOf(active.id as string)
      const newIndex = columnOrder.indexOf(over.id as string)
      onColumnOrderChange(arrayMove(columnOrder, oldIndex, newIndex))
    }
  }

  return (
    <div ref={ref} className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(!open)}
      >
        Columns
      </Button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-md border bg-background shadow-lg">
          <div className="max-h-80 overflow-y-auto p-1">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={columnOrder}
                strategy={verticalListSortingStrategy}
              >
                {orderedColumns.map((column) => (
                  <SortableItem
                    key={column.id}
                    id={column.id}
                    label={typeof column.columnDef.header === "string" ? column.columnDef.header : column.id}
                    checked={column.getIsVisible()}
                    onToggle={() => column.toggleVisibility()}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        </div>
      )}
    </div>
  )
}
