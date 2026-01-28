import { atom } from "jotai"

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
  shadowingEnabled: boolean
  shadowingSpeeds: number[]
  useAiUserKey: boolean
}

export const getStoredUiLanguage = (): LanguageOption => {
  if (typeof window === "undefined") return "zh-CN"
  const stored = window.localStorage.getItem("sola_ui_lang")
  return (stored as LanguageOption) || "zh-CN"
}

const getStoredThemeMode = (): boolean => {
  if (typeof window === "undefined") return false
  const stored = window.localStorage.getItem("sola-theme")
  return stored === "dark"
}

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

export const uiBlurTargetAtom = atom(false)
export const uiBlurNativeAtom = atom(false)
export const uiDarkModeAtom = atom(getStoredThemeMode())
export const applyUiLanguage = applyLanguage
export const applyThemeMode = applyTheme
