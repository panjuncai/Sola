import * as React from "react"

import { trpc } from "@/lib/trpc"

import { useSettingsStore, type SettingsState } from "./settingsStore"

type LanguageOption = "zh-CN" | "en-US" | "fr-FR"

export const useSettings = () => {
  const settingsQuery = trpc.user.getSettings.useQuery()
  const updateSettings = trpc.user.updateSettings.useMutation()
  const updateTtsVoices = trpc.user.updateTtsVoices.useMutation()

  const settings = useSettingsStore()
  const updateSetting = useSettingsStore((state) => state.updateSetting)
  const syncFromServer = useSettingsStore((state) => state.syncFromServer)

  React.useEffect(() => {
    if (settingsQuery.data) {
      syncFromServer(settingsQuery.data)
    }
  }, [settingsQuery.data, syncFromServer])

  const persistSettings = (
    next?: Partial<SettingsState> & { shadowing?: { enabled: boolean; speeds: number[] } }
  ) => {
    if (!settingsQuery.data) return
    const current = useSettingsStore.getState()
    const payload = {
      uiLanguage: next?.uiLanguage ?? current.uiLanguage,
      nativeLanguage: next?.nativeLanguage ?? current.nativeLanguage,
      targetLanguage: next?.targetLanguage ?? current.targetLanguage,
      displayOrder: next?.displayOrder ?? current.displayOrder,
      playbackNativeRepeat: next?.playbackNativeRepeat ?? current.playbackNativeRepeat,
      playbackTargetRepeat: next?.playbackTargetRepeat ?? current.playbackTargetRepeat,
      playbackPauseMs: Math.round(
        ((next?.playbackPauseSeconds ?? current.playbackPauseSeconds) || 0) * 1000
      ),
      useAiUserKey: next?.useAiUserKey ?? current.useAiUserKey,
      shadowing: {
        enabled:
          next?.shadowing?.enabled ??
          next?.shadowingEnabled ??
          current.shadowingEnabled,
        speeds:
          next?.shadowing?.speeds ?? next?.shadowingSpeeds ?? current.shadowingSpeeds,
      },
    }
    updateSettings.mutate(payload)
  }

  const setUiLanguage = (lang: LanguageOption) => updateSetting({ uiLanguage: lang })

  const setWithAction = <T,>(
    key: keyof SettingsState,
    value: React.SetStateAction<T>
  ) => {
    const prev = useSettingsStore.getState()[key] as T
    const next = typeof value === "function" ? (value as (val: T) => T)(prev) : value
    updateSetting({ [key]: next } as Partial<SettingsState>)
  }

  return {
    settingsQuery,
    updateTtsVoices,
    updateSetting,
    setUiLanguage,
    setNativeLanguageSetting: (lang: LanguageOption) => updateSetting({ nativeLanguage: lang }),
    setTargetLanguageSetting: (lang: LanguageOption) => updateSetting({ targetLanguage: lang }),
    setDisplayOrderSetting: (order: "native_first" | "target_first") =>
      updateSetting({ displayOrder: order }),
    setPlaybackNativeRepeat: (value: React.SetStateAction<number>) =>
      setWithAction<number>("playbackNativeRepeat", value),
    setPlaybackTargetRepeat: (value: React.SetStateAction<number>) =>
      setWithAction<number>("playbackTargetRepeat", value),
    setPlaybackPauseSeconds: (value: React.SetStateAction<number>) =>
      setWithAction<number>("playbackPauseSeconds", value),
    setNativeVoiceId: (id: React.SetStateAction<string | null>) =>
      setWithAction<string | null>("nativeVoiceId", id),
    setTargetVoiceId: (id: React.SetStateAction<string | null>) =>
      setWithAction<string | null>("targetVoiceId", id),
    setShadowingEnabled: (value: React.SetStateAction<boolean>) =>
      setWithAction<boolean>("shadowingEnabled", value),
    setShadowingSpeeds: (value: React.SetStateAction<number[]>) =>
      setWithAction<number[]>("shadowingSpeeds", value),
    setShadowingDraftEnabled: (value: React.SetStateAction<boolean>) =>
      setWithAction<boolean>("shadowingDraftEnabled", value),
    setShadowingDraftSpeeds: (value: React.SetStateAction<number[]>) =>
      setWithAction<number[]>("shadowingDraftSpeeds", value),
    setUseAiUserKey: (value: React.SetStateAction<boolean>) =>
      setWithAction<boolean>("useAiUserKey", value),
    setBlurTarget: (value: React.SetStateAction<boolean>) =>
      setWithAction<boolean>("blurTarget", value),
    setBlurNative: (value: React.SetStateAction<boolean>) =>
      setWithAction<boolean>("blurNative", value),
    setDarkMode: (value: React.SetStateAction<boolean>) =>
      setWithAction<boolean>("darkMode", value),
    uiLanguage: settings.uiLanguage,
    nativeLanguage: settings.nativeLanguage,
    targetLanguage: settings.targetLanguage,
    displayOrder: settings.displayOrder,
    playbackNativeRepeat: settings.playbackNativeRepeat,
    playbackTargetRepeat: settings.playbackTargetRepeat,
    playbackPauseSeconds: settings.playbackPauseSeconds,
    nativeVoiceId: settings.nativeVoiceId,
    targetVoiceId: settings.targetVoiceId,
    shadowingEnabled: settings.shadowingEnabled,
    shadowingSpeeds: settings.shadowingSpeeds,
    shadowingDraftEnabled: settings.shadowingDraftEnabled,
    shadowingDraftSpeeds: settings.shadowingDraftSpeeds,
    useAiUserKey: settings.useAiUserKey,
    blurTarget: settings.blurTarget,
    blurNative: settings.blurNative,
    darkMode: settings.darkMode,
    displayOrderSetting: settings.displayOrder,
    nativeLanguageSetting: settings.nativeLanguage,
    targetLanguageSetting: settings.targetLanguage,
    persistSettings,
  }
}
