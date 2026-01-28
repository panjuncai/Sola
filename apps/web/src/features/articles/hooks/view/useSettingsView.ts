import * as React from "react"

import { useGlobalSettings } from "@/features/settings"
import type { DisplayOrder, LanguageOption } from "@sola/shared"

export const useSettingsView = () => {
  const settings = useGlobalSettings()
  const {
    uiLanguage,
    displayOrderSetting,
    playbackNativeRepeat,
    playbackTargetRepeat,
    playbackPauseSeconds,
    blurTarget,
    setBlurTarget,
    blurNative,
    setBlurNative,
    setDarkMode,
    persistSettings,
  } = settings

  const handleUiLanguageChange = React.useCallback(
    (value: LanguageOption) => {
      persistSettings({ uiLanguage: value })
    },
    [persistSettings]
  )

  const handleDisplayOrderChange = React.useCallback(
    (value: DisplayOrder) => {
      persistSettings({ displayOrder: value })
    },
    [persistSettings]
  )

  const handlePlaybackNativeRepeatChange = React.useCallback(
    (value: number) => {
      persistSettings({ playbackNativeRepeat: value })
    },
    [persistSettings]
  )

  const handlePlaybackTargetRepeatChange = React.useCallback(
    (value: number) => {
      persistSettings({ playbackTargetRepeat: value })
    },
    [persistSettings]
  )

  const handlePlaybackPauseSecondsChange = React.useCallback(
    (value: number) => {
      persistSettings({ playbackPauseSeconds: value })
    },
    [persistSettings]
  )

  const handleToggleDarkMode = React.useCallback(() => {
    setDarkMode((prev) => !prev)
  }, [setDarkMode])

  const handleToggleBlurTarget = React.useCallback(() => {
    setBlurTarget((prev) => !prev)
  }, [setBlurTarget])

  const handleToggleBlurNative = React.useCallback(() => {
    setBlurNative((prev) => !prev)
  }, [setBlurNative])

  const handleSetBlurTarget = React.useCallback(
    (value: boolean) => {
      setBlurTarget(value)
    },
    [setBlurTarget]
  )

  const handleSetBlurNative = React.useCallback(
    (value: boolean) => {
      setBlurNative(value)
    },
    [setBlurNative]
  )

  return {
    ...settings,
    uiLanguage,
    displayOrderSetting,
    playbackNativeRepeat,
    playbackTargetRepeat,
    playbackPauseSeconds,
    blurTarget,
    blurNative,
    handleUiLanguageChange,
    handleDisplayOrderChange,
    handlePlaybackNativeRepeatChange,
    handlePlaybackTargetRepeatChange,
    handlePlaybackPauseSecondsChange,
    handleToggleDarkMode,
    handleToggleBlurTarget,
    handleToggleBlurNative,
    handleSetBlurTarget,
    handleSetBlurNative,
  }
}
