import * as React from "react"

import { useMobileMenu, useSidebarPanelView } from "@/features/articles"

export const MobileHeaderSettingsButton = () => {
  const {
    t,
    toggleSettings,
    settingsButtonRef,
  } = useSidebarPanelView()
  const { closeMobileMenu } = useMobileMenu()

  const handleToggleSettings = React.useCallback(() => {
    toggleSettings()
    closeMobileMenu()
  }, [closeMobileMenu, toggleSettings])

  return (
    <button
      ref={settingsButtonRef}
      type="button"
      className="flex h-9 w-9 items-center justify-center text-muted-foreground"
      onClick={handleToggleSettings}
      aria-label={t("common.settings")}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 21a8 8 0 0 0-16 0" />
        <circle cx="12" cy="8" r="4" />
      </svg>
    </button>
  )
}
