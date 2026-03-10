import type { SummaryStatItem } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface SummaryStatsProps {
  items: SummaryStatItem[]
  isLoading?: boolean
}

export function SummaryStats({ items, isLoading = false }: SummaryStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="mb-2 h-4 w-20" />
              <Skeleton className="h-7 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">{item.label}</p>
            <p className="mt-1 text-2xl font-semibold">
              {item.value ?? "—"}
              {item.unit && (
                <span className="ml-1 text-sm font-normal text-muted-foreground">
                  {item.unit}
                </span>
              )}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
