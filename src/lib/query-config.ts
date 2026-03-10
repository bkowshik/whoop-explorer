import { QueryClient } from "@tanstack/react-query"
import { experimental_createQueryPersister } from "@tanstack/react-query-persist-client"
import { get, set, del } from "idb-keyval"

export const queryPersister = experimental_createQueryPersister({
  storage: {
    getItem: (key: string) => get(key),
    setItem: (key: string, value: unknown) => set(key, value),
    removeItem: (key: string) => del(key),
  },
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
})

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes for current data
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export function getStaleTime(weekEnd: Date): number {
  const now = new Date()
  const isCurrentWeek = weekEnd > now
  return isCurrentWeek ? 1000 * 60 * 5 : Infinity
}
