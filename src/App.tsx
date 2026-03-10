import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { queryClient } from "@/lib/query-config"
import { AuthProvider } from "@/hooks/use-auth"
import { AuthGuard } from "@/components/layout/auth-guard"
import { LandingPage } from "@/pages/landing"
import { CallbackPage } from "@/pages/callback"
import { SleepPage } from "@/pages/sleep"
import { CyclesPage } from "@/pages/cycles"
import { RecoveryPage } from "@/pages/recovery"
import { WorkoutsPage } from "@/pages/workouts"
import { PrivacyPage } from "@/pages/privacy"

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/callback" element={<CallbackPage />} />
            <Route
              path="/sleep"
              element={
                <AuthGuard>
                  <SleepPage />
                </AuthGuard>
              }
            />
            <Route
              path="/cycles"
              element={
                <AuthGuard>
                  <CyclesPage />
                </AuthGuard>
              }
            />
            <Route
              path="/recovery"
              element={
                <AuthGuard>
                  <RecoveryPage />
                </AuthGuard>
              }
            />
            <Route
              path="/workouts"
              element={
                <AuthGuard>
                  <WorkoutsPage />
                </AuthGuard>
              }
            />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}

export default App
