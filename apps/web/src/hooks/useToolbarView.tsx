import * as React from "react"

export const useToolbarView = () => {
  const [mobileToolbarOpen, setMobileToolbarOpen] = React.useState(false)

  const toggleMobileToolbar = React.useCallback(() => {
    setMobileToolbarOpen((prev) => !prev)
  }, [])

  const closeMobileToolbar = React.useCallback(() => {
    setMobileToolbarOpen(false)
  }, [])

  return {
    mobileToolbarOpen,
    toggleMobileToolbar,
    closeMobileToolbar,
  }
}
