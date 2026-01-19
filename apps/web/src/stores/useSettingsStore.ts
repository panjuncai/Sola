import { create } from "zustand"
import { persist } from "zustand/middleware"

import i18n from "@/i18n"
import type { DisplayOrder, LanguageOption } from "@sola/shared"

export type SettingsState = {
  uiLanguage: LanguageOption
  nativeLanguage: LanguageOption
  targetLanguage: LanguageOption
  displayOrder: DisplayOrder
  playbackNativeRepeat: number
  playbackTargetRepeat: number
  playbackPauseSeconds: number
  nativeVoiceId: string | null
  targetVoiceId: string | null
  shadowingEnabled: boolean
  shadowingSpeeds: number[]
  shadowingDraftEnabled: boolean
  shadowingDraftSpeeds: number[]
  useAiUserKey: boolean
  blurTarget: boolean
  blurNative: boolean
  darkMode: boolean
}

type ServerSettings = {
  uiLanguage: LanguageOption
  nativeLanguage: LanguageOption
  targetLanguage: LanguageOption
  displayOrder: DisplayOrder
  playbackNativeRepeat: number
  playbackTargetRepeat: number
  playbackPauseMs: number
  useAiUserKey: boolean
  shadowing: { enabled: boolean; speeds: number[] }
}

type SettingsActions = {
  updateSetting: (patch: Partial<SettingsState>) => void
  syncFromServer: (data: ServerSettings) => void
}

const defaultState: SettingsState = {
  uiLanguage: "zh-CN",
  nativeLanguage: "zh-CN",
  targetLanguage: "en-US",
  displayOrder: "native_first",
  playbackNativeRepeat: 1,
  playbackTargetRepeat: 1,
  playbackPauseSeconds: 0,
  nativeVoiceId: null,
  targetVoiceId: null,
  shadowingEnabled: false,
  shadowingSpeeds: [0.2, 0.4, 0.6, 0.8],
  shadowingDraftEnabled: false,
  shadowingDraftSpeeds: [0.2, 0.4, 0.6, 0.8],
  useAiUserKey: false,
  blurTarget: false,
  blurNative: false,
  darkMode: false,
}

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set) => ({
      ...defaultState,
      updateSetting: (patch) => set((state) => ({ ...state, ...patch })),
      syncFromServer: (data) =>
        set((state) => ({
          ...state,
          uiLanguage: data.uiLanguage,
          nativeLanguage: data.nativeLanguage,
          targetLanguage: data.targetLanguage,
          displayOrder: data.displayOrder,
          playbackNativeRepeat: data.playbackNativeRepeat,
          playbackTargetRepeat: data.playbackTargetRepeat,
          playbackPauseSeconds: (data.playbackPauseMs || 0) / 1000,
          useAiUserKey: data.useAiUserKey,
          shadowingEnabled: data.shadowing.enabled,
          shadowingSpeeds: data.shadowing.speeds,
          shadowingDraftEnabled: data.shadowing.enabled,
          shadowingDraftSpeeds: data.shadowing.speeds,
        })),
    }),
    {
      name: "sola-settings",
      partialize: (state) => ({
        uiLanguage: state.uiLanguage,
        darkMode: state.darkMode,
      }),
    }
  )
)

const applyLanguage = (lang: LanguageOption) => {
  i18n.changeLanguage(lang)
  if (typeof window !== "undefined") {
    window.localStorage.setItem("sola_ui_lang", lang)
  }
}

const applyTheme = (dark: boolean) => {
  if (typeof document === "undefined") return
  const root = document.documentElement
  if (dark) {
    root.classList.add("dark")
    window.localStorage.setItem("sola-theme", "dark")
  } else {
    root.classList.remove("dark")
    window.localStorage.setItem("sola-theme", "light")
  }
}

if (typeof window !== "undefined") {
  applyLanguage(useSettingsStore.getState().uiLanguage)
  applyTheme(useSettingsStore.getState().darkMode)

  useSettingsStore.subscribe((state, prev) => {
    if (state.uiLanguage !== prev.uiLanguage) {
      applyLanguage(state.uiLanguage)
    }
    if (state.darkMode !== prev.darkMode) {
      applyTheme(state.darkMode)
    }
  })
}
