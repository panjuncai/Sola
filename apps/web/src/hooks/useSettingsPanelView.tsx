import * as React from "react"
import type { TFunction } from "i18next"

type UseSettingsPanelViewParams = {
  t: TFunction<"translation">
  anySettingsDialogOpen: boolean
}

type LanguageOption = "zh-CN" | "en-US" | "fr-FR"

export const useSettingsPanelView = ({
  t,
  anySettingsDialogOpen,
}: UseSettingsPanelViewParams) => {
  const [settingsOpen, setSettingsOpen] = React.useState(false)
  const settingsPanelRef = React.useRef<HTMLDivElement | null>(null)
  const settingsButtonRef = React.useRef<HTMLButtonElement | null>(null)
  const mobileSettingsPanelRef = React.useRef<HTMLDivElement | null>(null)
  const mobileSettingsButtonRef = React.useRef<HTMLButtonElement | null>(null)

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

  const languages = React.useMemo(
    () =>
      [
        { value: "zh-CN", label: t("lang.zhCN") },
        { value: "en-US", label: t("lang.enUS") },
        { value: "fr-FR", label: t("lang.frFR") },
      ] as { value: LanguageOption; label: string }[],
    [t]
  )

  const toggleSettings = React.useCallback(() => {
    setSettingsOpen((prev) => !prev)
  }, [])

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
