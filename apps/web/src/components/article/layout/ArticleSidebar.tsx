import * as React from "react"

import { cn } from "@sola/ui"

type ArticleSidebarProps = {
  sidebarCore: React.ReactNode
  mobileMenuOpen: boolean
  onCloseMobileMenu: () => void
}

export const ArticleSidebar: React.FC<ArticleSidebarProps> = ({
  sidebarCore,
  mobileMenuOpen,
  onCloseMobileMenu,
}) => {
  return (
    <>
      <div
        className={cn(
          "md:hidden fixed inset-0 z-50 transition",
          mobileMenuOpen ? "visible" : "invisible"
        )}
      >
        <div
          className={cn(
            "absolute inset-0 bg-black/40 transition-opacity",
            mobileMenuOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={onCloseMobileMenu}
        />
        <div
          className={cn(
            "absolute inset-y-0 left-0 w-72 bg-card shadow-xl transition-transform",
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="text-sm font-semibold">Sola</div>
            <button
              type="button"
              className="text-sm text-muted-foreground"
              onClick={onCloseMobileMenu}
            >
              Close
            </button>
          </div>
          <div className="flex h-full min-h-0 flex-col">{sidebarCore}</div>
        </div>
      </div>

      <aside className="hidden md:flex md:w-72 md:flex-col md:border-r md:bg-muted/30 md:sticky md:top-0 md:h-screen md:overflow-hidden">
        <div className="h-16 px-5 flex items-center border-b">
          <div className="text-sm font-semibold tracking-wide">Sola</div>
        </div>
        <div className="flex min-h-0 flex-1 flex-col">{sidebarCore}</div>
      </aside>
    </>
  )
}
