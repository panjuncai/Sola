import * as React from "react"

import { trpc } from "@/lib/trpc"
import { useSettings } from "@/hooks/useSettings"

type LanguageOption = "zh-CN" | "en-US" | "fr-FR"

type UseSettingsDialogsStateParams = {
  onDeleteAccountSuccess?: () => void
}

const useSettingsDialogsState = ({
  onDeleteAccountSuccess,
}: UseSettingsDialogsStateParams = {}) => {
  const {
    settingsQuery,
    updateTtsVoices,
    nativeLanguageSetting,
    setNativeLanguageSetting,
    targetLanguageSetting,
    setTargetLanguageSetting,
    nativeVoiceId,
    setNativeVoiceId,
    targetVoiceId,
    setTargetVoiceId,
    shadowingEnabled,
    setShadowingEnabled,
    shadowingSpeeds,
    setShadowingSpeeds,
    persistSettings,
  } = useSettings()
  const ttsInitRef = React.useRef<string>("")
  const ttsOptionsQuery = trpc.user.getTtsOptions.useQuery(
    {
      nativeLanguage: nativeLanguageSetting as LanguageOption,
      targetLanguage: targetLanguageSetting as LanguageOption,
    },
    { enabled: settingsQuery.isSuccess }
  )
  const deleteAccountMutation = trpc.user.deleteAccount.useMutation()

  const [languageDialogOpen, setLanguageDialogOpen] = React.useState(false)
  const [deleteAccountOpen, setDeleteAccountOpen] = React.useState(false)
  const [clearCacheOpen, setClearCacheOpen] = React.useState(false)
  const [shadowingDialogOpen, setShadowingDialogOpen] = React.useState(false)
  const [shadowingDraftEnabled, setShadowingDraftEnabled] = React.useState(false)
  const [shadowingDraftSpeeds, setShadowingDraftSpeeds] = React.useState<number[]>(
    []
  )

  React.useEffect(() => {
    if (!ttsOptionsQuery.data) return
    const langKey = `${nativeLanguageSetting}|${targetLanguageSetting}`
    if (ttsInitRef.current === langKey) return
    ttsInitRef.current = langKey

    const { nativeOptions, targetOptions, nativeVoiceId, targetVoiceId } =
      ttsOptionsQuery.data

    const nextNative = nativeVoiceId ?? nativeOptions[0]?.id ?? null
    const nextTarget = targetVoiceId ?? targetOptions[0]?.id ?? null

    setNativeVoiceId(nextNative)
    setTargetVoiceId(nextTarget)

    if (!nativeVoiceId && !targetVoiceId && nextNative && nextTarget) {
      updateTtsVoices.mutate({
        nativeVoiceId: nextNative,
        targetVoiceId: nextTarget,
      })
    }
  }, [
    nativeLanguageSetting,
    targetLanguageSetting,
    ttsOptionsQuery.data,
    updateTtsVoices,
    setNativeVoiceId,
    setTargetVoiceId,
  ])

  React.useEffect(() => {
    if (!shadowingDialogOpen) return
    setShadowingDraftEnabled(shadowingEnabled)
    setShadowingDraftSpeeds(shadowingSpeeds)
  }, [shadowingDialogOpen, shadowingEnabled, shadowingSpeeds])

  const handleNativeLanguageChange = React.useCallback(
    (value: LanguageOption | string) => {
      const next = value as LanguageOption
      setNativeLanguageSetting(next)
      persistSettings({ nativeLanguage: next })
    },
    [persistSettings, setNativeLanguageSetting]
  )

  const handleTargetLanguageChange = React.useCallback(
    (value: LanguageOption | string) => {
      const next = value as LanguageOption
      setTargetLanguageSetting(next)
      persistSettings({ targetLanguage: next })
    },
    [persistSettings, setTargetLanguageSetting]
  )

  const handleNativeVoiceChange = React.useCallback(
    (value: string | null) => {
      setNativeVoiceId(value)
      if (value && targetVoiceId) {
        updateTtsVoices.mutate({
          nativeVoiceId: value,
          targetVoiceId,
        })
      }
    },
    [setNativeVoiceId, targetVoiceId, updateTtsVoices]
  )

  const handleTargetVoiceChange = React.useCallback(
    (value: string | null) => {
      setTargetVoiceId(value)
      if (nativeVoiceId && value) {
        updateTtsVoices.mutate({
          nativeVoiceId,
          targetVoiceId: value,
        })
      }
    },
    [nativeVoiceId, setTargetVoiceId, updateTtsVoices]
  )

  const handleDeleteAccount = React.useCallback(() => {
    deleteAccountMutation
      .mutateAsync()
      .catch(() => {})
      .finally(() => {
        onDeleteAccountSuccess?.()
      })
    setDeleteAccountOpen(false)
  }, [deleteAccountMutation, onDeleteAccountSuccess])

  const confirmShadowingDraft = React.useCallback(() => {
    const sanitized = shadowingDraftSpeeds
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value))
    const nextSpeeds = sanitized.length > 0 ? sanitized : [0.2]
    setShadowingEnabled(shadowingDraftEnabled)
    setShadowingSpeeds(nextSpeeds)
    persistSettings({
      shadowing: {
        enabled: shadowingDraftEnabled,
        speeds: nextSpeeds,
      },
    })
  }, [
    persistSettings,
    setShadowingEnabled,
    setShadowingSpeeds,
    shadowingDraftEnabled,
    shadowingDraftSpeeds,
  ])

  return {
    ttsOptionsQuery,
    languageDialogOpen,
    setLanguageDialogOpen,
    deleteAccountOpen,
    setDeleteAccountOpen,
    clearCacheOpen,
    setClearCacheOpen,
    shadowingDialogOpen,
    setShadowingDialogOpen,
    shadowingDraftEnabled,
    setShadowingDraftEnabled,
    shadowingDraftSpeeds,
    setShadowingDraftSpeeds,
    nativeLanguageSetting,
    targetLanguageSetting,
    nativeVoiceId,
    targetVoiceId,
    nativeVoiceOptions: ttsOptionsQuery.data?.nativeOptions ?? [],
    targetVoiceOptions: ttsOptionsQuery.data?.targetOptions ?? [],
    handleNativeLanguageChange,
    handleTargetLanguageChange,
    handleNativeVoiceChange,
    handleTargetVoiceChange,
    deleteAccountMutation,
    handleDeleteAccount,
    confirmShadowingDraft,
  }
}

type SettingsDialogsContextValue = ReturnType<typeof useSettingsDialogsState>

const SettingsDialogsContext = React.createContext<SettingsDialogsContextValue | null>(
  null
)

export const SettingsDialogsProvider = ({
  value,
  children,
}: {
  value: SettingsDialogsContextValue
  children: React.ReactNode
}) => {
  return (
    <SettingsDialogsContext.Provider value={value}>
      {children}
    </SettingsDialogsContext.Provider>
  )
}

export const useSettingsDialogs = (params?: UseSettingsDialogsStateParams) => {
  const context = React.useContext(SettingsDialogsContext)
  if (context) return context
  return useSettingsDialogsState(params)
}
