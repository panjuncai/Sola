import * as React from "react"
import { useAtomValue } from "jotai"

import { trpc } from "@/lib/trpc"
import { trpcAtom } from "@/lib/trpcAtom"
import { trpcClient } from "@/lib/trpcClient"
import { useSettings } from "@/stores/useSettings"
import type { LanguageOption } from "@sola/shared"
import {
  useSettingsDialogsActions,
  useSettingsDialogsState as useSettingsDialogsAtomState,
  useShadowingDraftState,
} from "../../atoms/settingsDialogs"

type UseSettingsDialogsStateParams = {
  onDeleteAccountSuccess?: () => void
}

const useSettingsDialogsLogic = ({
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
  const ttsOptionsAtom = React.useMemo(
    () =>
      trpcAtom(
        "user.getTtsOptions",
        trpcClient.user.getTtsOptions,
        {
          nativeLanguage: nativeLanguageSetting as LanguageOption,
          targetLanguage: targetLanguageSetting as LanguageOption,
        },
        { enabled: settingsQuery.isSuccess }
      ),
    [nativeLanguageSetting, settingsQuery.isSuccess, targetLanguageSetting]
  )
  const ttsOptionsResult = useAtomValue(ttsOptionsAtom)
  const ttsOptionsQuery = ttsOptionsResult
  const ttsOptions = ttsOptionsResult.data ?? null
  const deleteAccountMutation = trpc.user.deleteAccount.useMutation()
  const {
    languageDialogOpen,
    deleteAccountOpen,
    clearCacheOpen,
    shadowingDialogOpen,
  } = useSettingsDialogsAtomState()
  const {
    setLanguageDialogOpen,
    setDeleteAccountOpen,
    setClearCacheOpen,
    setShadowingDialogOpen,
  } = useSettingsDialogsActions()
  const {
    shadowingDraftEnabled,
    setShadowingDraftEnabled,
    shadowingDraftSpeeds,
    setShadowingDraftSpeeds,
  } = useShadowingDraftState()

  React.useEffect(() => {
    if (!ttsOptions) return
    const langKey = `${nativeLanguageSetting}|${targetLanguageSetting}`
    if (ttsInitRef.current === langKey) return
    ttsInitRef.current = langKey

    const { nativeOptions, targetOptions, nativeVoiceId, targetVoiceId } =
      ttsOptions

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
    ttsOptions,
    updateTtsVoices,
    setNativeVoiceId,
    setTargetVoiceId,
  ])

  React.useEffect(() => {
    if (!shadowingDialogOpen) return
    setShadowingDraftEnabled(shadowingEnabled)
    setShadowingDraftSpeeds(shadowingSpeeds)
  }, [
    shadowingDialogOpen,
    shadowingEnabled,
    shadowingSpeeds,
    setShadowingDraftEnabled,
    setShadowingDraftSpeeds,
  ])

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
  }, [deleteAccountMutation, onDeleteAccountSuccess, setDeleteAccountOpen])

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

export const useInitSettingsDialogs = (params: UseSettingsDialogsStateParams) => {
  const api = useSettingsDialogsLogic(params)
  // eslint-disable-next-line react-hooks/globals
  latestSettingsDialogsApi = api
  return api
}

export const useSettingsDialogs = () => {
  if (latestSettingsDialogsApi) return latestSettingsDialogsApi
  throw new Error("SettingsDialogs API is not initialized.")
}

type SettingsDialogsApi = ReturnType<typeof useSettingsDialogsLogic>

let latestSettingsDialogsApi: SettingsDialogsApi | null = null
