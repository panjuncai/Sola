import { Outlet } from "react-router-dom"

import { AuthShell } from "@sola/ui"

export function AuthLayout() {
  return (
    <AuthShell>
      <Outlet />
    </AuthShell>
  )
}
