import * as React from "react"
import { useLocation } from "react-router-dom"

import { trpc } from "@/lib/trpc"
import {
  useGlobalAuthActions,
  useGlobalAuthState,
} from "../../hooks/state/useGlobalAuthState"

export const useAuthGuardView = () => {
  const location = useLocation()
  const { setUser, setLoading } = useGlobalAuthActions()
  const { isLoading, isAuthenticated } = useGlobalAuthState()

  const sessionQuery = trpc.auth.getSession.useQuery(undefined, {
    retry: false,
  })

  React.useEffect(() => {
    if (sessionQuery.status === "success") {
      setUser(sessionQuery.data?.user ?? null)
      setLoading(false)
      return
    }
    if (sessionQuery.status === "error") {
      setUser(null)
      setLoading(false)
    }
  }, [sessionQuery.status, sessionQuery.data, setLoading, setUser])

  const isChecking = isLoading || sessionQuery.isLoading
  const shouldRedirect = !isChecking && !isAuthenticated

  return {
    redirectPath: location.pathname,
    isChecking,
    shouldRedirect,
  }
}
