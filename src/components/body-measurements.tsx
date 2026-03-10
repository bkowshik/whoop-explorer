import type { BodyMeasurement } from "@/lib/types"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface BodyMeasurementsProps {
  data: BodyMeasurement | null
  isLoading: boolean
}

const DASH = "—"

export function BodyMeasurements({ data, isLoading }: BodyMeasurementsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Body Measurements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const items = [
    {
      label: "Height",
      value: data?.heightMeter != null ? `${data.heightMeter.toFixed(2)} m` : DASH,
    },
    {
      label: "Weight",
      value: data?.weightKilogram != null ? `${data.weightKilogram.toFixed(1)} kg` : DASH,
    },
    {
      label: "Max Heart Rate",
      value: data?.maxHeartRate != null ? `${data.maxHeartRate} bpm` : DASH,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Body Measurements</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.label} className="text-center">
              <div className="text-2xl font-semibold">{item.value}</div>
              <div className="text-sm text-muted-foreground">{item.label}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
