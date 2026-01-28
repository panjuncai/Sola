import * as React from "react"

import { useAtom } from "jotai"

import { useQueryClient } from "@tanstack/react-query"

import { trpc } from "@/lib/trpc"
import { refreshSettings } from "@/lib/queryRefresh"
import {
  applyThemeMode,
  applyUiLanguage,
  uiBlurNativeAtom,
  uiBlurTargetAtom,
  uiDarkModeAtom,
  getStoredUiLanguage,
  type SettingsState,
} from "../atoms/globalSettingsAtoms"
import type { DisplayOrder, LanguageOption } from "@sola/shared"

export const useGlobalSettings = () => {
  const queryClient = useQueryClient()
  const settingsQuery = trpc.user.getSettings.useQuery()
  const updateSettings = trpc.user.updateSettings.useMutation({
    onSuccess: () => refreshSettings(queryClient),
  })
  const updateTtsVoices = trpc.user.updateTtsVoices.useMutation({
    onSuccess: () => refreshSettings(queryClient),
  })

  const fallbackUiLanguage = getStoredUiLanguage()
  const fallbackNativeLanguage: LanguageOption = "zh-CN"
  const fallbackTargetLanguage: LanguageOption = "en-US"
  const fallbackDisplayOrder: DisplayOrder = "native_first"
  const fallbackPlaybackRepeat = 1
  const fallbackPlaybackPauseSeconds = 1
  const fallbackUseAiUserKey = false
  const fallbackShadowing = { enabled: false, speeds: [0.2, 0.4, 0.6, 0.8] }

  const uiLanguage = settingsQuery.data?.uiLanguage ?? fallbackUiLanguage
  const nativeLanguage =
    settingsQuery.data?.nativeLanguage ?? fallbackNativeLanguage
  const targetLanguage =
    settingsQuery.data?.targetLanguage ?? fallbackTargetLanguage
  const displayOrder =
    settingsQuery.data?.displayOrder ?? fallbackDisplayOrder
  const playbackNativeRepeat =
    settingsQuery.data?.playbackNativeRepeat ?? fallbackPlaybackRepeat
  const playbackTargetRepeat =
    settingsQuery.data?.playbackTargetRepeat ?? fallbackPlaybackRepeat
  const playbackPauseSeconds = Math.max(
    0,
    (settingsQuery.data?.playbackPauseMs ?? fallbackPlaybackPauseSeconds * 1000) /
      1000
  )
  const useAiUserKey = settingsQuery.data?.useAiUserKey ?? fallbackUseAiUserKey
  const shadowingEnabled =
    settingsQuery.data?.shadowing?.enabled ?? fallbackShadowing.enabled
  const shadowingSpeeds =
    settingsQuery.data?.shadowing?.speeds ?? fallbackShadowing.speeds
  const [blurTarget, setBlurTarget] = useAtom(uiBlurTargetAtom)
  const [blurNative, setBlurNative] = useAtom(uiBlurNativeAtom)
  const [darkMode, setDarkMode] = useAtom(uiDarkModeAtom)

  React.useEffect(() => {
    applyUiLanguage(uiLanguage)
  }, [uiLanguage])

  React.useEffect(() => {
    applyThemeMode(darkMode)
  }, [darkMode])

  const persistSettings = (
    next?: Partial<SettingsState> & { shadowing?: { enabled: boolean; speeds: number[] } }
  ) => {
    const payload = {
      uiLanguage: next?.uiLanguage ?? uiLanguage,
      nativeLanguage: next?.nativeLanguage ?? nativeLanguage,
      targetLanguage: next?.targetLanguage ?? targetLanguage,
      displayOrder: next?.displayOrder ?? displayOrder,
      playbackNativeRepeat: next?.playbackNativeRepeat ?? playbackNativeRepeat,
      playbackTargetRepeat: next?.playbackTargetRepeat ?? playbackTargetRepeat,
      playbackPauseMs: Math.round(
        ((next?.playbackPauseSeconds ?? playbackPauseSeconds) || 0) * 1000
      ),
      useAiUserKey: next?.useAiUserKey ?? useAiUserKey,
      shadowing: {
        enabled:
          next?.shadowing?.enabled ?? next?.shadowingEnabled ?? shadowingEnabled,
        speeds:
          next?.shadowing?.speeds ?? next?.shadowingSpeeds ?? shadowingSpeeds,
      },
    }
    updateSettings.mutate(payload)
  }

  return {
    settingsQuery,
    updateTtsVoices,
    setBlurTarget,
    setBlurNative,
    setDarkMode,
    uiLanguage,
    nativeLanguage,
    targetLanguage,
    displayOrder,
    playbackNativeRepeat,
    playbackTargetRepeat,
    playbackPauseSeconds,
    shadowingEnabled,
    shadowingSpeeds,
    useAiUserKey,
    blurTarget,
    blurNative,
    darkMode,
    displayOrderSetting: displayOrder,
    nativeLanguageSetting: nativeLanguage,
    targetLanguageSetting: targetLanguage,
    persistSettings,
  }
}
