import * as React from "react"

import { cn } from "../lib/utils"
import { Button } from "../components/ui/button"

export type AppNavItem = {
  to: string
  label: string
  icon?: React.ReactNode
}

export type AppShellLinkComponent = React.ComponentType<{
  to: string
  className?: string
  children: React.ReactNode
  "aria-current"?: "page" | undefined
}>

export type AppShellProps = {
  brand?: React.ReactNode
  navItems: AppNavItem[]
  pathname?: string
  LinkComponent?: AppShellLinkComponent
  header?: React.ReactNode
  children: React.ReactNode
  className?: string
}

function isActivePath(pathname: string, to: string) {
  if (to === "/") return pathname === "/"
  return pathname === to || pathname.startsWith(`${to}/`)
}

export function AppShell({
  brand = "Sola",
  navItems,
  pathname,
  LinkComponent,
  header,
  children,
  className,
}: AppShellProps) {
  return (
    <div className={cn("min-h-screen bg-background text-foreground", className)}>
      <div className="md:flex">
        <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:min-h-screen md:sticky md:top-0">
          <div className="h-14 px-4 flex items-center border-b">
            <div className="font-semibold">{brand}</div>
          </div>
          <nav className="p-2">
            <div className="grid gap-1">
              {navItems.map((item) => {
                const isActive = pathname ? isActivePath(pathname, item.to) : false
                const LinkOrAnchor = LinkComponent

                return (
                  <Button
                    key={item.to}
                    asChild
                    variant={isActive ? "secondary" : "ghost"}
                    className="justify-start h-11"
                  >
                    {LinkOrAnchor ? (
                      <LinkOrAnchor
                        to={item.to}
                        className="w-full flex items-center"
                        aria-current={isActive ? "page" : undefined}
                      >
                        {item.icon ? (
                          <span className="mr-2">{item.icon}</span>
                        ) : null}
                        {item.label}
                      </LinkOrAnchor>
                    ) : (
                      <a
                        href={item.to}
                        className="w-full flex items-center"
                        aria-current={isActive ? "page" : undefined}
                      >
                        {item.icon ? (
                          <span className="mr-2">{item.icon}</span>
                        ) : null}
                        {item.label}
                      </a>
                    )}
                  </Button>
                )
              })}
            </div>
          </nav>
        </aside>

        <div className="flex-1 min-w-0">
          {header ? (
            <header className="hidden md:flex h-14 items-center border-b px-4">
              {header}
            </header>
          ) : null}

          <main className="min-h-screen md:min-h-[calc(100vh-3.5rem)] px-4 py-4 pb-24 md:pb-6">
            {children}
          </main>
        </div>
      </div>

      <nav className="md:hidden fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pb-safe">
        <div className="grid grid-flow-col auto-cols-fr h-16">
          {navItems.map((item) => {
            const isActive = pathname ? isActivePath(pathname, item.to) : false
            const LinkOrAnchor = LinkComponent

            const className = cn(
              "min-h-11 px-2 py-2 flex flex-col items-center justify-center gap-1 text-xs font-medium",
              isActive ? "text-foreground" : "text-muted-foreground"
            )

            return LinkOrAnchor ? (
              <LinkOrAnchor
                key={item.to}
                to={item.to}
                className={className}
                aria-current={isActive ? "page" : undefined}
              >
                {item.icon ? (
                  <span className="h-5 w-5 flex items-center justify-center">
                    {item.icon}
                  </span>
                ) : null}
                <span>{item.label}</span>
              </LinkOrAnchor>
            ) : (
              <a
                key={item.to}
                href={item.to}
                className={className}
                aria-current={isActive ? "page" : undefined}
              >
                {item.icon ? (
                  <span className="h-5 w-5 flex items-center justify-center">
                    {item.icon}
                  </span>
                ) : null}
                <span>{item.label}</span>
              </a>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
