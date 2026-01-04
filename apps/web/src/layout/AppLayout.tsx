import { Link, Outlet, useLocation } from "react-router-dom"

import { AppShell } from "@sola/ui"


const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/articles", label: "Articles" },
  { to: "/settings", label: "Settings" },
]

export function AppLayout() {
  const { pathname } = useLocation()

  return (
    <AppShell
      brand="Sola"
      navItems={navItems}
      pathname={pathname}
      LinkComponent={Link}
      header={<div className="text-sm text-muted-foreground">Mobile-first UI</div>}
    >
      <Outlet />
    </AppShell>
  )
}
