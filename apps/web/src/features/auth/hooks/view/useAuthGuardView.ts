import * as React from "react"
import { useLocation } from "react-router-dom"

import { trpc } from "@/lib/trpc"
import { useAuthStore } from "@/stores/useAuthStore"

export const useAuthGuardView = () => {
  const location = useLocation()
  const setUser = useAuthStore((s) => s.setUser)
  const isLoading = useAuthStore((s) => s.isLoading)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  const sessionQuery = trpc.auth.getSession.useQuery(undefined, {
    retry: false,
  })

  React.useEffect(() => {
    if (sessionQuery.status === "success") {
      setUser(sessionQuery.data?.user ?? null)
      useAuthStore.setState({ isLoading: false })
      return
    }
    if (sessionQuery.status === "error") {
      setUser(null)
      useAuthStore.setState({ isLoading: false })
    }
  }, [sessionQuery.status, sessionQuery.data, setUser])

  const isChecking = isLoading || sessionQuery.isLoading
  const shouldRedirect = !isChecking && !isAuthenticated

  return {
    redirectPath: location.pathname,
    isChecking,
    shouldRedirect,
  }
}
