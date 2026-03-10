import { useLocation, useNavigate } from "react-router-dom"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const tabs = [
  { value: "/sleep", label: "Sleep" },
  { value: "/cycles", label: "Cycles" },
  { value: "/recovery", label: "Recovery" },
  { value: "/workouts", label: "Workouts" },
] as const

export function NavTabs() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <Tabs value={location.pathname} onValueChange={(v) => navigate(v)}>
      <TabsList>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
