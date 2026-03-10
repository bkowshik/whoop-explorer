import type { ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { useExcelExport } from "@/hooks/use-excel-export"
import type { DateRange } from "@/lib/types"

interface AppShellProps {
  children: ReactNode
  dateRange?: DateRange
}

export function AppShell({ children, dateRange }: AppShellProps) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const { isExporting, exportAll } = useExcelExport()

  const handleDisconnect = async () => {
    await logout()
    navigate("/", { replace: true })
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <h1 className="text-lg font-semibold">WHOOP Explorer</h1>
          <div className="flex items-center gap-2">
            {dateRange && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportAll(dateRange)}
                disabled={isExporting}
              >
                {isExporting ? "Exporting..." : "Download Excel"}
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleDisconnect}>
              Disconnect
            </Button>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
