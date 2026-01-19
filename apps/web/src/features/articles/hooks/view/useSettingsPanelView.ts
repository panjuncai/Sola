import * as React from "react"

import { useLanguageOptions } from "./useLanguageOptions"
import { useSettingsPanelActions, useSettingsPanelState } from "../../atoms/settingsPanel"

const sharedSettingsPanelRef = React.createRef<HTMLDivElement>()
const sharedSettingsButtonRef = React.createRef<HTMLButtonElement>()
const sharedMobileSettingsPanelRef = React.createRef<HTMLDivElement>()
const sharedMobileSettingsButtonRef = React.createRef<HTMLButtonElement>()

type UseSettingsPanelViewParams = {
  anySettingsDialogOpen: boolean
}

export const useSettingsPanelView = ({
  anySettingsDialogOpen,
}: UseSettingsPanelViewParams) => {
  const { settingsOpen } = useSettingsPanelState()
  const { setSettingsOpen } = useSettingsPanelActions()
  const settingsPanelRef = sharedSettingsPanelRef
  const settingsButtonRef = sharedSettingsButtonRef
  const mobileSettingsPanelRef = sharedMobileSettingsPanelRef
  const mobileSettingsButtonRef = sharedMobileSettingsButtonRef

  React.useEffect(() => {
    if (!settingsOpen) return
    if (anySettingsDialogOpen) return
    const handleOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (settingsPanelRef.current?.contains(target)) return
      if (settingsButtonRef.current?.contains(target)) return
      if (mobileSettingsPanelRef.current?.contains(target)) return
      if (mobileSettingsButtonRef.current?.contains(target)) return
      setSettingsOpen(false)
    }
    document.addEventListener("mousedown", handleOutside)
    return () => document.removeEventListener("mousedown", handleOutside)
  }, [settingsOpen, anySettingsDialogOpen])

  const languages = useLanguageOptions()

  const toggleSettings = React.useCallback(() => {
    setSettingsOpen((prev) => !prev)
  }, [setSettingsOpen])

  return {
    settingsOpen,
    setSettingsOpen,
    toggleSettings,
    settingsPanelRef,
    settingsButtonRef,
    mobileSettingsPanelRef,
    mobileSettingsButtonRef,
    languages,
  }
}
