import { cn } from "@sola/ui"

import { ArticleSidebarPanel } from "../shared/ArticleSidebarPanel"
import { useMobileMenu } from "../../hooks/view/useMobileMenu"
import { useSidebarView } from "../../hooks/view/useSidebarView"

export const ArticleSidebarMobile = () => {
  const { mobileMenuOpen, closeMobileMenu } = useMobileMenu()
  const { closeLabel } = useSidebarView()

  return (
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
        onClick={closeMobileMenu}
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
            onClick={closeMobileMenu}
          >
            {closeLabel}
          </button>
        </div>
        <div className="flex h-full min-h-0 flex-col">
          <ArticleSidebarPanel />
        </div>
      </div>
    </div>
  )
}
