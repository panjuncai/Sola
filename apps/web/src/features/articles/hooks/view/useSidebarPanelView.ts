import * as React from "react"
import { useTranslation } from "react-i18next"

import { trpc } from "@/lib/trpc"
import { useGlobalAuthState } from "@/features/auth"
import { useAiDialogsActions, useAiDialogsState } from "@/features/ai-management"
import { useSettingsDialogs } from "../init/useInitSettingsDialogs"
import { useSettingsPanelActions, useSettingsPanelState } from "../../atoms/settingsPanel"
import { useSettingsView } from "./useSettingsView"
import type { LanguageOption } from "@sola/shared"

const sharedSettingsPanelRef = React.createRef<HTMLDivElement>()
const sharedSettingsButtonRef = React.createRef<HTMLButtonElement>()
const sharedMobileSettingsPanelRef = React.createRef<HTMLDivElement>()
const sharedMobileSettingsButtonRef = React.createRef<HTMLButtonElement>()

export const useSidebarPanelView = () => {
  const { t } = useTranslation()
  const {
    uiLanguage,
    displayOrderSetting,
    playbackNativeRepeat,
    playbackTargetRepeat,
    playbackPauseSeconds,
    darkMode,
    handleUiLanguageChange,
    handleDisplayOrderChange,
    handlePlaybackNativeRepeatChange,
    handlePlaybackTargetRepeatChange,
    handlePlaybackPauseSecondsChange,
    handleToggleDarkMode,
  } = useSettingsView()
  const {
    languageDialogOpen,
    setLanguageDialogOpen,
    deleteAccountOpen,
    setDeleteAccountOpen,
    clearCacheOpen,
    setClearCacheOpen,
    shadowingDialogOpen,
    setShadowingDialogOpen,
  } = useSettingsDialogs()
  const {
    aiDialogOpen,
    aiInstructionDialogOpen,
    aiInstructionEditOpen,
    aiInstructionAddOpen,
    aiInstructionDeleteOpen,
  } = useAiDialogsState()
  const { setAiDialogOpen, setAiInstructionDialogOpen } = useAiDialogsActions()
  const anySettingsDialogOpen =
    aiDialogOpen ||
    aiInstructionDialogOpen ||
    aiInstructionEditOpen ||
    aiInstructionAddOpen ||
    aiInstructionDeleteOpen ||
    languageDialogOpen ||
    shadowingDialogOpen ||
    deleteAccountOpen ||
    clearCacheOpen
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
  }, [
    settingsOpen,
    anySettingsDialogOpen,
    setSettingsOpen,
    settingsPanelRef,
    settingsButtonRef,
    mobileSettingsPanelRef,
    mobileSettingsButtonRef,
  ])

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
  }, [setSettingsOpen])
  const { user } = useGlobalAuthState()
  const userEmail = user?.email ?? ""
  const settingsTriggerLabel = userEmail || t("common.settings")
  const signOutMutation = trpc.auth.signOut.useMutation()

  return {
    t,
    settingsOpen,
    toggleSettings,
    settingsPanelRef,
    settingsButtonRef,
    darkMode,
    onToggleDarkMode: handleToggleDarkMode,
    onOpenAiSettings: () => setAiDialogOpen(true),
    onOpenAiInstructions: () => setAiInstructionDialogOpen(true),
    uiLanguage,
    languages,
    onUiLanguageChange: handleUiLanguageChange,
    displayOrderSetting,
    onDisplayOrderChange: handleDisplayOrderChange,
    onOpenLanguageSettings: () => setLanguageDialogOpen(true),
    onOpenShadowing: () => setShadowingDialogOpen(true),
    playbackNativeRepeat,
    onPlaybackNativeRepeatChange: handlePlaybackNativeRepeatChange,
    playbackTargetRepeat,
    onPlaybackTargetRepeatChange: handlePlaybackTargetRepeatChange,
    playbackPauseSeconds,
    onPlaybackPauseSecondsChange: handlePlaybackPauseSecondsChange,
    onClearCache: () => setClearCacheOpen(true),
    onDeleteAccount: () => setDeleteAccountOpen(true),
    onSignOut: () => {
      signOutMutation
        .mutateAsync()
        .catch(() => {})
        .finally(() => {
          window.location.href = "/auth/login"
        })
    },
    userEmail,
    settingsTriggerLabel,
  }
}
