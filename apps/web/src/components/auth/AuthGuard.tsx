import * as React from "react"
import { Navigate, useLocation } from "react-router-dom"

import { trpc } from "@/lib/trpc"
import { useAuthStore } from "@/stores/useAuthStore"

type AuthGuardProps = {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
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
    }
    if (sessionQuery.status === "error") {
      setUser(null)
      useAuthStore.setState({ isLoading: false })
    }
  }, [sessionQuery.status, sessionQuery.data, setUser])

  if (isLoading || sessionQuery.isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-sm text-muted-foreground">
        Checking session...
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/auth/login"
        replace
        state={{ from: location.pathname }}
      />
    )
  }

  return <>{children}</>
}

