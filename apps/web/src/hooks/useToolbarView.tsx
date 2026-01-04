import * as React from "react"

type UseToolbarViewParams = {
  setIsCardMode: React.Dispatch<React.SetStateAction<boolean>>
}

export const useToolbarView = ({ setIsCardMode }: UseToolbarViewParams) => {
  const [mobileToolbarOpen, setMobileToolbarOpen] = React.useState(false)

  const toggleCardMode = React.useCallback(() => {
    setIsCardMode((prev) => !prev)
  }, [setIsCardMode])

  const toggleMobileToolbar = React.useCallback(() => {
    setMobileToolbarOpen((prev) => !prev)
  }, [])

  const closeMobileToolbar = React.useCallback(() => {
    setMobileToolbarOpen(false)
  }, [])

  return {
    mobileToolbarOpen,
    toggleCardMode,
    toggleMobileToolbar,
    closeMobileToolbar,
  }
}
