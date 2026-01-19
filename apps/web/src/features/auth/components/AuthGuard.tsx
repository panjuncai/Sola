import * as React from "react"
import { Navigate } from "react-router-dom"

import { useAuthGuardView } from "../hooks/view/useAuthGuardView"

type AuthGuardProps = {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isChecking, shouldRedirect, redirectPath } = useAuthGuardView()

  if (isChecking) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-sm text-muted-foreground">
        Checking session...
      </div>
    )
  }

  if (shouldRedirect) {
    return (
      <Navigate
        to="/auth/login"
        replace
        state={{ from: redirectPath }}
      />
    )
  }

  return <>{children}</>
}
