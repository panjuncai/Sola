import { useTranslation } from "react-i18next"

import { trpc } from "@/lib/trpc"
import { useAuthStore } from "@/stores/useAuthStore"
import { useAiDialogsActions, useAiDialogsState } from "@/features/ai-management"
import { useSettingsDialogs } from "@/features/articles"
import { useSettingsPanelView } from "@/features/articles"
import { useSettingsView } from "@/features/articles"

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
  const {
    settingsOpen,
    toggleSettings,
    settingsPanelRef,
    settingsButtonRef,
    languages,
  } = useSettingsPanelView({ anySettingsDialogOpen })
  const userEmail = useAuthStore((state) => state.user?.email ?? "")
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
