import * as React from "react"

import { useSettings } from "@/stores/useSettings"
import type { DisplayOrder, LanguageOption } from "@sola/shared"

export const useSettingsView = () => {
  const settings = useSettings()
  const {
    uiLanguage,
    setUiLanguage,
    displayOrderSetting,
    setDisplayOrderSetting,
    playbackNativeRepeat,
    setPlaybackNativeRepeat,
    playbackTargetRepeat,
    setPlaybackTargetRepeat,
    playbackPauseSeconds,
    setPlaybackPauseSeconds,
    blurTarget,
    setBlurTarget,
    blurNative,
    setBlurNative,
    setDarkMode,
    persistSettings,
  } = settings

  const handleUiLanguageChange = React.useCallback(
    (value: LanguageOption) => {
      setUiLanguage(value)
      persistSettings({ uiLanguage: value })
    },
    [persistSettings, setUiLanguage]
  )

  const handleDisplayOrderChange = React.useCallback(
    (value: DisplayOrder) => {
      setDisplayOrderSetting(value)
      persistSettings({ displayOrder: value })
    },
    [persistSettings, setDisplayOrderSetting]
  )

  const handlePlaybackNativeRepeatChange = React.useCallback(
    (value: number) => {
      setPlaybackNativeRepeat(value)
      persistSettings({ playbackNativeRepeat: value })
    },
    [persistSettings, setPlaybackNativeRepeat]
  )

  const handlePlaybackTargetRepeatChange = React.useCallback(
    (value: number) => {
      setPlaybackTargetRepeat(value)
      persistSettings({ playbackTargetRepeat: value })
    },
    [persistSettings, setPlaybackTargetRepeat]
  )

  const handlePlaybackPauseSecondsChange = React.useCallback(
    (value: number) => {
      setPlaybackPauseSeconds(value)
      persistSettings({ playbackPauseSeconds: value })
    },
    [persistSettings, setPlaybackPauseSeconds]
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
