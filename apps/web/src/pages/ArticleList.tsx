import * as React from "react"
import { useTranslation } from "react-i18next"

import { Button, Card, CardContent, toast, cn } from "@sola/ui"

import i18n from "@/i18n"
import { trpc } from "@/lib/trpc"
import { useAuthStore } from "@/stores/useAuthStore"
import { ArticleToolbar } from "@/components/article/ArticleToolbar"
import { SentenceItem } from "@/components/article/SentenceItem"
import { CardModeView } from "@/components/article/CardModeView"
import { SettingsPanel } from "@/components/article/SettingsPanel"
import { ArticleSidebar } from "@/components/article/layout/ArticleSidebar"
import { ArticleMain } from "@/components/article/layout/ArticleMain"
import { MobileHeader } from "@/components/article/layout/MobileHeader"
import { CreateArticlePanel } from "@/components/article/CreateArticlePanel"
import { useClozePractice } from "@/hooks/useClozePractice"
import { useCardMode } from "@/hooks/useCardMode"
import { useArticleToolbar } from "@/hooks/useArticleToolbar"
import { useArticles } from "@/hooks/useArticles"
import { useSettings } from "@/hooks/useSettings"
import { DialogsContainer } from "@/components/article/DialogsContainer"
import { usePlayback } from "@/hooks/usePlayback"

function deriveTitle(content: string) {
  return content.trim().slice(0, 10)
}

export function ArticleList() {
  const { t } = useTranslation()
  const utils = trpc.useUtils()

  const languageOptions = ["zh-CN", "en-US", "fr-FR"] as const
  type LanguageOption = (typeof languageOptions)[number]
  type AiProviderType = "volcengine" | "qwen" | "openai" | "gemini" | "aihubmix"
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [mobileToolbarOpen, setMobileToolbarOpen] = React.useState(false)
  const {
    articles,
    content,
    setContent,
    listQuery,
    detailQuery,
    activeArticleId,
    setActiveArticleId,
    setIsCreating,
    selectedIds,
    showCreate,
    deleteTargets,
    handleCreate,
    toggleSelected,
    createMutation,
    deleteMutation,
  } = useArticles({ deriveTitle })
  const {
    settingsQuery,
    updateTtsVoices,
    uiLanguage,
    setUiLanguage,
    nativeLanguageSetting,
    setNativeLanguageSetting,
    targetLanguageSetting,
    setTargetLanguageSetting,
    displayOrderSetting,
    setDisplayOrderSetting,
    playbackNativeRepeat,
    setPlaybackNativeRepeat,
    playbackTargetRepeat,
    setPlaybackTargetRepeat,
    playbackPauseSeconds,
    setPlaybackPauseSeconds,
    nativeVoiceId,
    setNativeVoiceId,
    targetVoiceId,
    setTargetVoiceId,
    shadowingEnabled,
    setShadowingEnabled,
    shadowingSpeeds,
    setShadowingSpeeds,
    shadowingDraftEnabled,
    setShadowingDraftEnabled,
    shadowingDraftSpeeds,
    setShadowingDraftSpeeds,
    useAiUserKey,
    setUseAiUserKey,
    blurTarget,
    setBlurTarget,
    blurNative,
    setBlurNative,
    darkMode,
    setDarkMode,
    persistSettings,
  } = useSettings()
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [settingsOpen, setSettingsOpen] = React.useState(false)
  const [deleteAccountOpen, setDeleteAccountOpen] = React.useState(false)
  const [languageDialogOpen, setLanguageDialogOpen] = React.useState(false)
  const [selectedSentenceId, setSelectedSentenceId] = React.useState<string | null>(
    null
  )
  const [selectedSentenceRole, setSelectedSentenceRole] = React.useState<
    "native" | "target" | null
  >(null)
  const [playingSpeed, setPlayingSpeed] = React.useState<number | null>(null)
  const [playingSentenceId, setPlayingSentenceId] = React.useState<string | null>(null)
  const [playingRole, setPlayingRole] = React.useState<"native" | "target" | null>(null)
  const apiBaseUrl = React.useMemo(() => {
    const envBase = import.meta.env.VITE_API_URL?.replace(/\/$/, "")
    if (envBase) return envBase
    if (import.meta.env.DEV) return "http://localhost:6001"
    return window.location.origin
  }, [])
  const settingsPanelRef = React.useRef<HTMLDivElement>(null)
  const settingsButtonRef = React.useRef<HTMLButtonElement>(null)
  const mobileSettingsPanelRef = React.useRef<HTMLDivElement>(null)
  const mobileSettingsButtonRef = React.useRef<HTMLButtonElement>(null)
  const [shadowingDialogOpen, setShadowingDialogOpen] = React.useState(false)
  const [clearCacheOpen, setClearCacheOpen] = React.useState(false)
  const [aiDialogOpen, setAiDialogOpen] = React.useState(false)
  const [aiInstructionDialogOpen, setAiInstructionDialogOpen] = React.useState(false)
  const [aiInstructionEditOpen, setAiInstructionEditOpen] = React.useState(false)
  const [aiInstructionAddOpen, setAiInstructionAddOpen] = React.useState(false)
  const [aiInstructionDeleteOpen, setAiInstructionDeleteOpen] = React.useState(false)
  const [aiInstructionAddModel, setAiInstructionAddModel] = React.useState<string | null>(
    null
  )
  const [aiProvidersDraft, setAiProvidersDraft] = React.useState<
    {
      id: string
      providerType: string
      apiUrl: string
      name: string | null
      apiKey: string | null
      models: string[]
      availableModels: string[]
      isDefault: boolean
      enabled: boolean
      isPublic: boolean
    }[]
  >([])
  const [aiInstructionDrafts, setAiInstructionDrafts] = React.useState<
    {
      id: string
      name: string
      instructionType: "translate" | "explain" | "custom"
      systemPrompt: string
      userPromptTemplate: string
      model: string | null
      inputSchemaJson: string | null
      outputSchemaJson: string | null
      enabled: boolean
      isDefault: boolean
      userAiProviderId: string | null
    }[]
  >([])
  const [aiInstructionEditing, setAiInstructionEditing] = React.useState<{
    id: string
    name: string
    instructionType: "translate" | "explain" | "custom"
    systemPrompt: string
    userPromptTemplate: string
    model: string | null
    inputSchemaJson: string | null
    outputSchemaJson: string | null
    enabled: boolean
    isDefault: boolean
    userAiProviderId: string | null
  } | null>(null)
  const [aiInstructionDeleteId, setAiInstructionDeleteId] = React.useState<string | null>(
    null
  )
  const [aiInstructionAddProviderId, setAiInstructionAddProviderId] = React.useState<
    string | null
  >(null)
  const [newAiProviderName, setNewAiProviderName] = React.useState("")
  const [newAiProviderType, setNewAiProviderType] =
    React.useState<AiProviderType>("openai")
  const [newAiProviderApiUrl, setNewAiProviderApiUrl] = React.useState("")
  const [newAiProviderModels, setNewAiProviderModels] = React.useState("")
  const [newAiProviderEnabled, setNewAiProviderEnabled] = React.useState(true)
  const [newAiProviderApiKey, setNewAiProviderApiKey] = React.useState("")
  const [newAiProviderKeyVisible, setNewAiProviderKeyVisible] = React.useState(false)
  const [aiProviderAddOpen, setAiProviderAddOpen] = React.useState(false)
  const [aiProviderEditOpen, setAiProviderEditOpen] = React.useState(false)
  const [aiProviderEditing, setAiProviderEditing] = React.useState<{
    id: string
    providerType: string
    name: string | null
    apiUrl: string
    apiKey: string | null
    models: string[]
    enabled: boolean
    isPublic: boolean
  } | null>(null)
  const [aiProviderDeleteId, setAiProviderDeleteId] = React.useState<string | null>(
    null
  )
  const [aiProviderEditKeyVisible, setAiProviderEditKeyVisible] = React.useState(false)
  const [sentenceEditOpen, setSentenceEditOpen] = React.useState(false)
  const [sentenceDeleteOpen, setSentenceDeleteOpen] = React.useState(false)
  const [sentenceEditing, setSentenceEditing] = React.useState<{
    id: string
    nativeText: string
    targetText: string
  } | null>(null)
  const [sentenceDeleteId, setSentenceDeleteId] = React.useState<string | null>(null)
  const [aiProviderEditModels, setAiProviderEditModels] = React.useState("")
  const [aiProviderResetOpen, setAiProviderResetOpen] = React.useState(false)
  const [aiProgress, setAiProgress] = React.useState<{
    instructionId: string
    total: number
    completed: number
    running: boolean
  } | null>(null)
  const [aiLastInstructionId, setAiLastInstructionId] = React.useState<string | null>(
    null
  )
  const aiRunIdRef = React.useRef(0)
  const [publicAiInstructions, setPublicAiInstructions] = React.useState<
    {
      id: string
      name: string
      instructionType: "translate" | "explain" | "custom"
      systemPrompt: string
      userPromptTemplate: string
      model: string | null
      inputSchemaJson: string | null
      outputSchemaJson: string | null
      enabled: boolean
      isDefault: boolean
    }[]
  >([])
  const userId = useAuthStore((state) => state.user?.id ?? null)
  const userEmail = useAuthStore((state) => state.user?.email ?? "")
  const ttsInitRef = React.useRef<string>("")
  const ttsOptionsQuery = trpc.user.getTtsOptions.useQuery(
    {
      nativeLanguage: nativeLanguageSetting as "zh-CN" | "en-US" | "fr-FR",
      targetLanguage: targetLanguageSetting as "zh-CN" | "en-US" | "fr-FR",
    },
    { enabled: settingsQuery.isSuccess }
  )
  const aiProvidersQuery = trpc.user.getAiProviders.useQuery()
  const updateAiProviderDefault = trpc.user.updateAiProviderDefault.useMutation()
  const updateAiProviderConfig = trpc.user.updateAiProviderConfig.useMutation()
  const createUserAiProvider = trpc.user.createUserAiProvider.useMutation()
  const deleteAiProvider = trpc.user.deleteAiProvider.useMutation()
  const resetAiProvidersToPublic = trpc.user.resetAiProvidersToPublic.useMutation()
  const aiInstructionQuery = trpc.user.getUserAiInstructions.useQuery()
  const publicAiInstructionQuery = trpc.user.getPublicAiInstructions.useQuery()
  const createUserAiInstructionFromPublic =
    trpc.user.createUserAiInstructionFromPublic.useMutation()
  const updateUserAiInstruction = trpc.user.updateUserAiInstruction.useMutation()
  const deleteUserAiInstruction = trpc.user.deleteUserAiInstruction.useMutation()
  const translateSentence = trpc.ai.translateSentence.useMutation()

  const aiInstructionList = React.useMemo(() => {
    const list = aiInstructionQuery.data ?? []
    return list
      .filter((instruction) => instruction.enabled)
      .slice()
      .sort((a, b) => {
        const defaultRank = Number(b.isDefault) - Number(a.isDefault)
        if (defaultRank !== 0) return defaultRank
        return a.name.localeCompare(b.name)
      })
  }, [aiInstructionQuery.data])

  const aiInstructionGroups = React.useMemo(() => {
    const groups = new Map<string, typeof aiInstructionList>()
    for (const instruction of aiInstructionList) {
      const list = groups.get(instruction.instructionType) ?? []
      list.push(instruction)
      groups.set(instruction.instructionType, list)
    }
    return Array.from(groups.entries())
  }, [aiInstructionList])

  const defaultInstructionId = React.useMemo(() => {
    return aiInstructionList.find((instruction) => instruction.isDefault)?.id ?? null
  }, [aiInstructionList])

  const resolveInstructionLabel = React.useCallback(
    (type: "translate" | "explain" | "custom") => {
      if (type === "translate") return t("ai.typeTranslate")
      if (type === "explain") return t("ai.typeExplain")
      return t("ai.typeCustom")
    },
    [t]
  )
  const resolveProvider = React.useCallback(
    (providerId: string | null) => {
      const defaultProvider =
        aiProvidersQuery.data?.find((item) => item.isDefault) ?? null
      if (providerId) {
        return aiProvidersQuery.data?.find((item) => item.id === providerId) ?? null
      }
      return defaultProvider
    },
    [aiProvidersQuery.data]
  )
  const resolveProviderModels = React.useCallback(
    (providerId: string | null) => {
      const provider = resolveProvider(providerId)
      return provider?.models ?? provider?.availableModels ?? []
    },
    [resolveProvider]
  )

  const updateSentenceMutation = trpc.article.updateSentence.useMutation()
  const deleteSentenceMutation = trpc.article.deleteSentence.useMutation()
  const deleteAccountMutation = trpc.user.deleteAccount.useMutation()
  const signOutMutation = trpc.auth.signOut.useMutation()
  const sentenceAudioMutation = trpc.tts.getSentenceAudio.useMutation()
  const missingNativeCount = React.useMemo(() => {
    if (!detailQuery.data) return 0
    return detailQuery.data.sentences.filter(
      (sentence) =>
        Boolean(sentence.targetText?.trim()) && !sentence.nativeText?.trim()
    ).length
  }, [detailQuery.data])

  const updateSentenceTranslation = React.useCallback(
    (sentenceId: string, translation: string) => {
      const articleId = detailQuery.data?.article.id
      if (!articleId) return
      utils.article.get.setData({ articleId }, (current) => {
        if (!current) return current
        return {
          ...current,
          sentences: current.sentences.map((sentence) =>
            sentence.id === sentenceId
              ? { ...sentence, nativeText: translation }
              : sentence
          ),
        }
      })
    },
    [detailQuery.data?.article.id, utils.article.get]
  )

  const updateSentenceLocal = React.useCallback(
    (sentenceId: string, nativeText: string | null, targetText: string | null) => {
      const articleId = detailQuery.data?.article.id
      if (!articleId) return
      utils.article.get.setData({ articleId }, (current) => {
        if (!current) return current
        return {
          ...current,
          sentences: current.sentences.map((sentence) =>
            sentence.id === sentenceId
              ? { ...sentence, nativeText, targetText: targetText ?? "" }
              : sentence
          ),
        }
      })
    },
    [detailQuery.data?.article.id, utils.article.get]
  )

  const deleteSentenceLocal = React.useCallback(
    (sentenceId: string) => {
      const articleId = detailQuery.data?.article.id
      if (!articleId) return
      utils.article.get.setData({ articleId }, (current) => {
        if (!current) return current
        return {
          ...current,
          sentences: current.sentences.filter((sentence) => sentence.id !== sentenceId),
        }
      })
    },
    [detailQuery.data?.article.id, utils.article.get]
  )

  const getTranslationTargets = React.useCallback(
    (missingOnly: boolean) => {
      if (!detailQuery.data) return []
      return detailQuery.data.sentences.filter((sentence) => {
        if (!sentence.targetText?.trim()) return false
        if (missingOnly) return !sentence.nativeText?.trim()
        return true
      })
    },
    [detailQuery.data]
  )

  const startAiTranslation = React.useCallback(
    async (instructionId: string, missingOnly: boolean) => {
      if (aiProgress?.running) {
        toast.error(t("ai.translationInProgress"))
        return
      }
      if (!detailQuery.data) {
        toast.error(t("ai.noArticleSelected"))
        return
      }
      const targets = getTranslationTargets(missingOnly)
      if (targets.length === 0) {
        toast.error(
          missingOnly ? t("ai.noMissingTargets") : t("ai.noTargets")
        )
        return
      }

      const runId = aiRunIdRef.current + 1
      aiRunIdRef.current = runId
      setAiLastInstructionId(instructionId)
      setAiProgress({
        instructionId,
        total: targets.length,
        completed: 0,
        running: true,
      })

      let completed = 0
      let failed = 0
      let index = 0
      const concurrency = Math.min(3, targets.length)

      const worker = async () => {
        while (true) {
          const nextIndex = index
          index += 1
          const sentence = targets[nextIndex]
          if (!sentence) return
          if (aiRunIdRef.current !== runId) return
          try {
            const result = await translateSentence.mutateAsync({
              sentenceId: sentence.id,
              instructionId,
            })
            if (aiRunIdRef.current !== runId) return
            updateSentenceTranslation(result.sentenceId, result.translation)
          } catch {
            failed += 1
          }
          if (aiRunIdRef.current !== runId) return
          completed += 1
          setAiProgress((prev) =>
            prev && prev.instructionId === instructionId
              ? { ...prev, completed }
              : prev
          )
        }
      }

      await Promise.all(Array.from({ length: concurrency }, () => worker()))

      if (aiRunIdRef.current !== runId) return
      setAiProgress((prev) => (prev ? { ...prev, running: false } : prev))
      if (failed > 0) {
        toast.error(t("ai.translationFailed", { count: failed }))
      } else {
        toast.success(t("ai.translationComplete", { count: targets.length }))
      }
    },
    [
      aiProgress?.running,
      detailQuery.data,
      getTranslationTargets,
      t,
      translateSentence,
      updateSentenceTranslation,
    ]
  )

  const cancelAiTranslation = React.useCallback(() => {
    if (!aiProgress?.running) return
    aiRunIdRef.current += 1
    setAiProgress((prev) => (prev ? { ...prev, running: false } : prev))
    toast.success(t("ai.translationCanceled"))
  }, [aiProgress?.running, t])

  const retryMissingTranslations = React.useCallback(() => {
    const instructionId = aiLastInstructionId ?? defaultInstructionId
    if (!instructionId) {
      toast.error(t("ai.noInstructionAvailable"))
      return
    }
    startAiTranslation(instructionId, true)
  }, [aiLastInstructionId, defaultInstructionId, startAiTranslation, t])

  React.useEffect(() => {
    if (settingsQuery.data) {
      setUiLanguage(settingsQuery.data.uiLanguage)
      setNativeLanguageSetting(settingsQuery.data.nativeLanguage)
      setTargetLanguageSetting(settingsQuery.data.targetLanguage)
      setDisplayOrderSetting(settingsQuery.data.displayOrder)
      setPlaybackNativeRepeat(settingsQuery.data.playbackNativeRepeat)
      setPlaybackTargetRepeat(settingsQuery.data.playbackTargetRepeat)
      setPlaybackPauseSeconds(settingsQuery.data.playbackPauseMs / 1000)
      setUseAiUserKey(settingsQuery.data.useAiUserKey)
      setShadowingEnabled(settingsQuery.data.shadowing.enabled)
      setShadowingSpeeds(settingsQuery.data.shadowing.speeds)
      i18n.changeLanguage(settingsQuery.data.uiLanguage)
      if (typeof window !== "undefined") {
        localStorage.setItem("sola_ui_lang", settingsQuery.data.uiLanguage)
      }
    }
  }, [settingsQuery.data])

  React.useEffect(() => {
    if (!shadowingDialogOpen) return
    setShadowingDraftEnabled(shadowingEnabled)
    setShadowingDraftSpeeds(shadowingSpeeds)
  }, [shadowingDialogOpen, shadowingEnabled, shadowingSpeeds])

  React.useEffect(() => {
    if (!aiDialogOpen) return
    if (!aiProvidersQuery.data) return
    setAiProvidersDraft(
      [...aiProvidersQuery.data].sort(
        (a, b) => Number(b.isDefault) - Number(a.isDefault)
      )
    )
    setNewAiProviderName("")
    setNewAiProviderType("openai")
    setNewAiProviderApiUrl("")
    setNewAiProviderModels("")
    setNewAiProviderEnabled(true)
    setNewAiProviderApiKey("")
    setNewAiProviderKeyVisible(false)
  }, [aiDialogOpen, aiProvidersQuery.data])

  React.useEffect(() => {
    if (!aiInstructionDialogOpen) return
    if (aiInstructionQuery.data) {
      setAiInstructionDrafts(
        [...aiInstructionQuery.data]
          .map((item) => ({
            ...item,
            model:
              "model" in item && item.model != null
                ? (item.model as string | null)
                : null,
            userAiProviderId:
              "userAiProviderId" in item ? (item.userAiProviderId as string | null) : null,
          }))
          .sort((a, b) => a.name.localeCompare(b.name))
      )
    }
    if (publicAiInstructionQuery.data) {
      setPublicAiInstructions(
        publicAiInstructionQuery.data.map((item) => ({
          ...item,
          model: "model" in item && item.model != null ? (item.model as string | null) : null,
        }))
      )
    }
    setAiInstructionAddProviderId(
      aiProvidersQuery.data?.find((item) => item.isDefault)?.id ?? null
    )
  }, [
    aiInstructionDialogOpen,
    aiInstructionQuery.data,
    publicAiInstructionQuery.data,
    aiProvidersQuery.data,
  ])


  React.useEffect(() => {
    if (!aiInstructionAddOpen) return
    const providerId =
      aiInstructionAddProviderId ??
      aiProvidersQuery.data?.find((item) => item.isDefault)?.id ??
      null
    const models = resolveProviderModels(providerId)
    if (!models.length) {
      setAiInstructionAddModel(null)
      return
    }
    if (!aiInstructionAddModel || !models.includes(aiInstructionAddModel)) {
      setAiInstructionAddModel(models[0] ?? null)
    }
  }, [
    aiInstructionAddOpen,
    aiInstructionAddProviderId,
    aiInstructionAddModel,
    aiProvidersQuery.data,
    resolveProviderModels,
  ])

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
  }, [ttsOptionsQuery.data, nativeLanguageSetting, targetLanguageSetting, updateTtsVoices])

  const handleSentenceEdit = React.useCallback(
    (sentence: { id: string; nativeText: string | null; targetText: string | null }) => {
      setSentenceEditing({
        id: sentence.id,
        nativeText: sentence.nativeText ?? "",
        targetText: sentence.targetText ?? "",
      })
      setSentenceEditOpen(true)
    },
    []
  )

  const handleSentenceDelete = React.useCallback((sentenceId: string) => {
    setSentenceDeleteId(sentenceId)
    setSentenceDeleteOpen(true)
  }, [])

  const handlePlayError = React.useCallback(() => {
    toast.error(t("tts.audioPlayFailed"))
  }, [t])

  React.useEffect(() => {
    const stored = window.localStorage.getItem("sola-theme")
    if (stored === "dark") {
      setDarkMode(true)
      document.documentElement.classList.add("dark")
    } else if (stored === "light") {
      setDarkMode(false)
      document.documentElement.classList.remove("dark")
    }
  }, [])

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
      window.localStorage.setItem("sola-theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      window.localStorage.setItem("sola-theme", "light")
    }
  }, [darkMode])

  const anySettingsDialogOpen =
    aiDialogOpen ||
    aiInstructionDialogOpen ||
    aiInstructionEditOpen ||
    aiInstructionAddOpen ||
    aiInstructionDeleteOpen ||
    languageDialogOpen ||
    shadowingDialogOpen ||
    deleteAccountOpen

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
  }, [settingsOpen, anySettingsDialogOpen])

  const languages = [
    { value: "zh-CN" as LanguageOption, label: t("lang.zhCN") },
    { value: "en-US" as LanguageOption, label: t("lang.enUS") },
    { value: "fr-FR" as LanguageOption, label: t("lang.frFR") },
  ]

  const clearSentenceSelection = React.useCallback(
    (sentenceId: string) => {
      if (selectedSentenceId === sentenceId) {
        setSelectedSentenceId(null)
        setSelectedSentenceRole(null)
      }
      if (playingSentenceId === sentenceId) {
        setPlayingSentenceId(null)
        setPlayingRole(null)
        setPlayingSpeed(null)
      }
    },
    [
      playingSentenceId,
      selectedSentenceId,
      setPlayingRole,
      setPlayingSentenceId,
      setPlayingSpeed,
      setSelectedSentenceId,
      setSelectedSentenceRole,
    ]
  )

  const {
    buildLocalCacheKey,
    getCachedAudioUrl,
    setCachedAudioUrl,
    playSentenceRole,
    stopAudioPlayback,
    clearTtsCache,
    clearSentenceCache,
  } = usePlayback({
    userId,
    apiBaseUrl,
    detail: detailQuery.data,
    ttsOptions: ttsOptionsQuery.data,
    nativeVoiceId,
    targetVoiceId,
    sentenceAudioMutation,
    setPlayingSentenceId,
    setPlayingRole,
    setPlayingSpeed,
    onCacheCleared: () => toast.success(t("settings.cacheCleared")),
  })

  const requestSentenceAudio = React.useCallback(
    (input: { sentenceId: string; role: "native" | "target" }) =>
      sentenceAudioMutation.mutateAsync(input),
    [sentenceAudioMutation]
  )

  const {
    isLoopingAll,
    isLoopingTarget,
    isLoopingSingle,
    isLoopingShadowing,
    isRandomMode,
    isClozeEnabled,
    stopLoopPlayback,
    startLoopAll,
    startLoopTarget,
    startLoopSingle,
    handleToggleShadowing,
    toggleRandomMode,
    toggleCloze,
    markUserSelected,
  } = useArticleToolbar({
    detail: detailQuery.data,
    activeArticleId,
    displayOrderSetting,
    playbackNativeRepeat,
    playbackTargetRepeat,
    playbackPauseSeconds,
    shadowingSpeeds,
    selectedSentenceId,
    selectedSentenceRole,
    setSelectedSentenceId,
    setSelectedSentenceRole,
    playSentenceRole,
    buildLocalCacheKey,
    getCachedAudioUrl,
    setCachedAudioUrl,
    requestSentenceAudio,
    onPlayError: handlePlayError,
    onSelectSentenceRequired: () => toast.error(t("tts.selectSentenceFirst")),
    onStopAudio: stopAudioPlayback,
  })

  const {
    isCardMode,
    setIsCardMode,
    cardIndex,
    cardCount,
    cardFlipped,
    cardDragX,
    cardDragging,
    cardFrontText,
    cardBackText,
    handleFlip: handleCardFlip,
    handlePrev: handleCardPrev,
    handleNext: handleCardNext,
    handlePlay: handleCardPlay,
    handlePointerDown: handleCardPointerDown,
    handlePointerMove: handleCardPointerMove,
    handlePointerUp: handleCardPointerUp,
    handlePointerCancel: handleCardPointerCancel,
    cancelCardPlayback,
  } = useCardMode({
    sentences: detailQuery.data?.sentences ?? [],
    displayOrderSetting,
    isRandomMode,
    playbackNativeRepeat,
    playbackTargetRepeat,
    playbackPauseSeconds,
    playSentenceRole,
    onPlayError: handlePlayError,
  })

  const {
    clozeInputs,
    setClozeInputs,
    clozeRevealed,
    setClozeRevealed,
    clozeResults,
    setClozeResults,
    handleSentenceSelect: handleClozeSentenceSelect,
    handleClozeCheck,
  } = useClozePractice({
    isClozeEnabled,
    blurTarget,
    setBlurTarget,
    activeArticleId,
    detail: detailQuery.data,
    stopLoopPlayback,
    playSentenceRole,
    setSelectedSentenceId,
    setSelectedSentenceRole,
    onPlayError: handlePlayError,
  })

  React.useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState !== "visible") {
        stopLoopPlayback()
        cancelCardPlayback()
      }
    }
    document.addEventListener("visibilitychange", handleVisibility)
    return () => document.removeEventListener("visibilitychange", handleVisibility)
  }, [cancelCardPlayback, stopLoopPlayback])

  React.useEffect(() => {
    stopLoopPlayback()
  }, [activeArticleId, showCreate, stopLoopPlayback])

  const handleSentenceSelect = React.useCallback(
    (
      sentenceId: string,
      role: "native" | "target",
      isTarget: boolean,
      clozeEnabled: boolean,
      isRevealed: boolean
  ) => {
      markUserSelected()
      return handleClozeSentenceSelect(
        sentenceId,
        role,
        isTarget,
        clozeEnabled,
        isRevealed
      )
    },
    [handleClozeSentenceSelect, markUserSelected]
  )

  const sidebarCore = (
    <>
      <div className="flex-none border-b p-4 space-y-2">
        <Button
          type="button"
          className="w-full justify-start"
          onClick={() => {
            setIsCreating(true)
            inputRef.current?.focus()
            setMobileMenuOpen(false)
          }}
        >
          + {t("article.add")}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start"
          disabled={deleteTargets.length === 0 || deleteMutation.isLoading}
          onClick={() => {
            if (deleteTargets.length === 0) return
            setConfirmOpen(true)
          }}
        >
          {t("article.bulkDelete")}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {listQuery.isLoading ? (
          <div className="text-sm text-muted-foreground">{t("common.loading")}</div>
        ) : listQuery.isError ? (
          <div className="text-sm text-muted-foreground">{t("common.loadFailed")}</div>
        ) : articles.length === 0 ? (
          <div className="text-sm text-muted-foreground">{t("article.noArticles")}</div>
        ) : (
          articles.map((article) => (
            <div
              key={article.id}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-2 py-2 text-sm",
                activeArticleId === article.id && "border-primary/60 bg-primary/5"
              )}
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(article.id)}
                onChange={() => toggleSelected(article.id)}
                aria-label="Select article"
              />
              <button
                type="button"
                className="min-w-0 flex-1 truncate text-left font-medium"
                onClick={() => {
                  setIsCreating(false)
                  setActiveArticleId(article.id)
                  setMobileMenuOpen(false)
                }}
              >
                {article.title ?? t("article.untitled")}
              </button>
            </div>
          ))
        )}
      </div>

      <div className="flex-none border-t p-4">
        <div className="relative">
          {settingsOpen ? (
            <SettingsPanel
              t={t}
              panelRef={settingsPanelRef}
              className="absolute bottom-12 left-0 right-0 z-20 rounded-xl border bg-card shadow-[0_16px_40px_rgba(15,23,42,0.18)]"
              darkMode={darkMode}
              onToggleDarkMode={() => setDarkMode((prev) => !prev)}
              onOpenAiSettings={() => setAiDialogOpen(true)}
              onOpenAiInstructions={() => setAiInstructionDialogOpen(true)}
              uiLanguage={uiLanguage}
              languages={languages}
              onUiLanguageChange={(value) => {
                const next = value as LanguageOption
                setUiLanguage(next)
                persistSettings({ uiLanguage: next })
                i18n.changeLanguage(next)
                if (typeof window !== "undefined") {
                  localStorage.setItem("sola_ui_lang", next)
                }
              }}
              displayOrderSetting={displayOrderSetting}
              onDisplayOrderChange={(value) => {
                setDisplayOrderSetting(value)
                persistSettings({ displayOrder: value })
              }}
              onOpenLanguageSettings={() => setLanguageDialogOpen(true)}
              onOpenShadowing={() => setShadowingDialogOpen(true)}
              playbackNativeRepeat={playbackNativeRepeat}
              onPlaybackNativeRepeatChange={(value) => {
                setPlaybackNativeRepeat(value)
                persistSettings({ playbackNativeRepeat: value })
              }}
              playbackTargetRepeat={playbackTargetRepeat}
              onPlaybackTargetRepeatChange={(value) => {
                setPlaybackTargetRepeat(value)
                persistSettings({ playbackTargetRepeat: value })
              }}
              playbackPauseSeconds={playbackPauseSeconds}
              onPlaybackPauseSecondsChange={(value) => {
                setPlaybackPauseSeconds(value)
                persistSettings({ playbackPauseSeconds: value })
              }}
              onClearCache={() => setClearCacheOpen(true)}
              onDeleteAccount={() => setDeleteAccountOpen(true)}
              onSignOut={() => {
                signOutMutation
                  .mutateAsync()
                  .catch(() => {})
                  .finally(() => {
                    window.location.href = "/auth/login"
                  })
              }}
            />
          ) : null}

          <button
            ref={settingsButtonRef}
            type="button"
            className="flex w-full items-center gap-2 text-sm font-medium text-muted-foreground"
            onClick={() => {
              setSettingsOpen((prev) => !prev)
              setMobileMenuOpen(false)
            }}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21a8 8 0 0 0-16 0" />
              <circle cx="12" cy="8" r="4" />
            </svg>
            <span className="truncate">{userEmail || "Settings"}</span>
          </button>
        </div>
      </div>
    </>
  )

  return (
    <div className="w-full">
      <MobileHeader
        t={t}
        settingsOpen={settingsOpen}
        onToggleSettings={() => {
          setSettingsOpen((prev) => !prev)
          setMobileMenuOpen(false)
        }}
        onOpenMenu={() => setMobileMenuOpen(true)}
        settingsButtonRef={mobileSettingsButtonRef}
        settingsPanelRef={mobileSettingsPanelRef}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((prev) => !prev)}
        onOpenAiSettings={() => setAiDialogOpen(true)}
        onOpenAiInstructions={() => setAiInstructionDialogOpen(true)}
        uiLanguage={uiLanguage}
        languages={languages}
        onUiLanguageChange={(value) => {
          const next = value as LanguageOption
          setUiLanguage(next)
          persistSettings({ uiLanguage: next })
          i18n.changeLanguage(next)
          if (typeof window !== "undefined") {
            localStorage.setItem("sola_ui_lang", next)
          }
        }}
        displayOrderSetting={displayOrderSetting}
        onDisplayOrderChange={(value) => {
          setDisplayOrderSetting(value)
          persistSettings({ displayOrder: value })
        }}
        onOpenLanguageSettings={() => setLanguageDialogOpen(true)}
        onOpenShadowing={() => setShadowingDialogOpen(true)}
        playbackNativeRepeat={playbackNativeRepeat}
        onPlaybackNativeRepeatChange={(value) => {
          setPlaybackNativeRepeat(value)
          persistSettings({ playbackNativeRepeat: value })
        }}
        playbackTargetRepeat={playbackTargetRepeat}
        onPlaybackTargetRepeatChange={(value) => {
          setPlaybackTargetRepeat(value)
          persistSettings({ playbackTargetRepeat: value })
        }}
        playbackPauseSeconds={playbackPauseSeconds}
        onPlaybackPauseSecondsChange={(value) => {
          setPlaybackPauseSeconds(value)
          persistSettings({ playbackPauseSeconds: value })
        }}
        onClearCache={() => setClearCacheOpen(true)}
        onDeleteAccount={() => setDeleteAccountOpen(true)}
        onSignOut={() => {
          signOutMutation
            .mutateAsync()
            .catch(() => {})
            .finally(() => {
              window.location.href = "/auth/login"
            })
        }}
      />

      <div className="md:flex">
        <ArticleSidebar
          sidebarCore={sidebarCore}
          mobileMenuOpen={mobileMenuOpen}
          onCloseMobileMenu={() => setMobileMenuOpen(false)}
        />

        <ArticleMain>
              {showCreate ? (
                <div className="text-center space-y-2">
                  <h1 className="text-3xl font-semibold">{t("article.heroTitle")}</h1>
                  <p className="text-sm text-muted-foreground">
                    {t("article.heroSubtitle")}
                  </p>
                </div>
              ) : detailQuery.isLoading ? (
                <div className="text-sm text-muted-foreground">
                  {t("article.loading")}
                </div>
              ) : detailQuery.data ? (
                <div className="space-y-4">
                  <ArticleToolbar
                    t={t}
                    isLoopingAll={isLoopingAll}
                    isLoopingTarget={isLoopingTarget}
                    isLoopingSingle={isLoopingSingle}
                    isLoopingShadowing={isLoopingShadowing}
                    isRandomMode={isRandomMode}
                    isCardMode={isCardMode}
                    isClozeEnabled={isClozeEnabled}
                    blurTarget={blurTarget}
                    blurNative={blurNative}
                    mobileToolbarOpen={mobileToolbarOpen}
                    aiInstructionGroups={aiInstructionGroups}
                    aiProgress={aiProgress}
                    missingNativeCount={missingNativeCount}
                    resolveInstructionLabel={resolveInstructionLabel}
                    onStartLoopAll={startLoopAll}
                    onStartLoopTarget={startLoopTarget}
                    onStartLoopSingle={startLoopSingle}
                    onStopLoopPlayback={stopLoopPlayback}
                    onToggleShadowing={handleToggleShadowing}
                    onToggleRandomMode={toggleRandomMode}
                    onToggleCardMode={() => setIsCardMode((prev) => !prev)}
                    onToggleCloze={toggleCloze}
                    onToggleBlurTarget={() => setBlurTarget((prev) => !prev)}
                    onToggleBlurNative={() => setBlurNative((prev) => !prev)}
                    onStartAiInstruction={(instructionId) =>
                      startAiTranslation(instructionId, false)
                    }
                    onCancelAi={cancelAiTranslation}
                    onRetryMissing={retryMissingTranslations}
                    onToggleMobileToolbar={() =>
                      setMobileToolbarOpen((prev) => !prev)
                    }
                    onCloseMobileToolbar={() => setMobileToolbarOpen(false)}
                  />
                  <div className="space-y-4">
                    {detailQuery.data.sentences.length === 0 ? (
                      <Card>
                        <CardContent className="py-6 text-sm text-muted-foreground">
                          {t("article.noSentences")}
                        </CardContent>
                      </Card>
                    ) : isCardMode ? (
                      <CardModeView
                        t={t}
                        isRandomMode={isRandomMode}
                        cardIndex={cardIndex}
                        cardCount={cardCount}
                        cardFlipped={cardFlipped}
                        cardDragX={cardDragX}
                        cardDragging={cardDragging}
                        cardFrontText={cardFrontText}
                        cardBackText={cardBackText}
                        onFlip={handleCardFlip}
                        onPrev={handleCardPrev}
                        onNext={handleCardNext}
                        onPlay={handleCardPlay}
                        onPointerDown={handleCardPointerDown}
                        onPointerMove={handleCardPointerMove}
                        onPointerUp={handleCardPointerUp}
                        onPointerCancel={handleCardPointerCancel}
                      />
                    ) : (
                      detailQuery.data.sentences.map((sentence) => {
                        return (
                          <SentenceItem
                            key={sentence.id}
                            sentence={sentence}
                            displayOrderSetting={displayOrderSetting}
                            playingSentenceId={playingSentenceId}
                            playingRole={playingRole}
                            playingSpeed={playingSpeed}
                            selectedSentenceId={selectedSentenceId}
                            selectedSentenceRole={selectedSentenceRole}
                            blurNative={blurNative}
                            blurTarget={blurTarget}
                            isClozeEnabled={isClozeEnabled}
                            clozeRevealed={clozeRevealed}
                            clozeInputs={clozeInputs}
                            clozeResults={clozeResults}
                            setClozeInputs={setClozeInputs}
                            setClozeResults={setClozeResults}
                            onStopPlayback={stopLoopPlayback}
                            onSelectSentence={handleSentenceSelect}
                            onPlaySentence={playSentenceRole}
                            onPlayError={handlePlayError}
                            onEdit={handleSentenceEdit}
                            onDelete={handleSentenceDelete}
                            onClozeCheck={handleClozeCheck}
                            t={t}
                          />
                        )
                      })
                    )}
                  </div>
                </div>
              ) : null}

              {showCreate ? (
                <CreateArticlePanel
                  t={t}
                  inputRef={inputRef}
                  value={content}
                  onChange={setContent}
                  onSubmit={handleCreate}
                  isSubmitting={createMutation.isLoading}
                  isError={createMutation.isError}
                />
              ) : null}
        </ArticleMain>
      </div>

      <DialogsContainer
        t={t}
        deleteConfirm={{
          open: confirmOpen,
          onOpenChange: setConfirmOpen,
          deleteCount: deleteTargets.length,
          isLoading: deleteMutation.isLoading,
          onConfirm: () => {
            if (deleteTargets.length === 0) return
            deleteMutation.mutate({ articleIds: deleteTargets })
            setConfirmOpen(false)
          },
        }}
        sentenceEdit={{
          open: sentenceEditOpen,
          onOpenChange: (open) => {
            setSentenceEditOpen(open)
            if (!open) {
              setSentenceEditing(null)
            }
          },
          nativeText: sentenceEditing?.nativeText ?? "",
          targetText: sentenceEditing?.targetText ?? "",
          onChangeNative: (value) =>
            setSentenceEditing((prev) => (prev ? { ...prev, nativeText: value } : prev)),
          onChangeTarget: (value) =>
            setSentenceEditing((prev) => (prev ? { ...prev, targetText: value } : prev)),
          isSaving: updateSentenceMutation.isLoading,
          isDisabled: !sentenceEditing,
          onSave: async () => {
            if (!sentenceEditing) return
            try {
              const result = await updateSentenceMutation.mutateAsync({
                sentenceId: sentenceEditing.id,
                nativeText: sentenceEditing.nativeText,
                targetText: sentenceEditing.targetText,
              })
              updateSentenceLocal(result.sentenceId, result.nativeText, result.targetText)
              await clearSentenceCache(result.sentenceId)
              toast.success(t("article.sentenceUpdateSuccess"))
              setSentenceEditOpen(false)
              setSentenceEditing(null)
            } catch {
              toast.error(t("common.updateFailed"))
            }
          },
        }}
        sentenceDelete={{
          open: sentenceDeleteOpen,
          onOpenChange: (open) => {
            setSentenceDeleteOpen(open)
            if (!open) {
              setSentenceDeleteId(null)
            }
          },
          isLoading: deleteSentenceMutation.isLoading,
          isDisabled: !sentenceDeleteId,
          onConfirm: async () => {
            if (!sentenceDeleteId) return
            const targetId = sentenceDeleteId
            try {
              stopLoopPlayback()
              await deleteSentenceMutation.mutateAsync({ sentenceId: targetId })
              deleteSentenceLocal(targetId)
              clearSentenceSelection(targetId)
              await clearSentenceCache(targetId)
              setClozeInputs((prev) => {
                if (!prev[targetId]) return prev
                const next = { ...prev }
                delete next[targetId]
                return next
              })
              setClozeResults((prev) => {
                if (!prev[targetId]) return prev
                const next = { ...prev }
                delete next[targetId]
                return next
              })
              setClozeRevealed((prev) => {
                if (!prev[targetId]) return prev
                const next = { ...prev }
                delete next[targetId]
                return next
              })
              toast.success(t("article.sentenceDeleteSuccess"))
              setSentenceDeleteOpen(false)
              setSentenceDeleteId(null)
            } catch {
              toast.error(t("common.deleteFailed"))
            }
          },
        }}
        accountDelete={{
          open: deleteAccountOpen,
          onOpenChange: setDeleteAccountOpen,
          isLoading: deleteAccountMutation.isLoading,
          onConfirm: () => {
            deleteAccountMutation
              .mutateAsync()
              .catch(() => {})
              .finally(() => {
                window.location.href = "/auth/login"
              })
            setDeleteAccountOpen(false)
          },
        }}
        languageSettings={{
          open: languageDialogOpen,
          onOpenChange: setLanguageDialogOpen,
          languages,
          nativeLanguageSetting,
          targetLanguageSetting,
          onNativeLanguageChange: (value) => {
            const next = value as LanguageOption
            setNativeLanguageSetting(next)
            persistSettings({ nativeLanguage: next })
          },
          onTargetLanguageChange: (value) => {
            const next = value as LanguageOption
            setTargetLanguageSetting(next)
            persistSettings({ targetLanguage: next })
          },
          nativeVoiceId,
          targetVoiceId,
          nativeVoiceOptions: ttsOptionsQuery.data?.nativeOptions ?? [],
          targetVoiceOptions: ttsOptionsQuery.data?.targetOptions ?? [],
          onNativeVoiceChange: (value) => {
            setNativeVoiceId(value)
            if (value && targetVoiceId) {
              updateTtsVoices.mutate({
                nativeVoiceId: value,
                targetVoiceId,
              })
            }
          },
          onTargetVoiceChange: (value) => {
            setTargetVoiceId(value)
            if (nativeVoiceId && value) {
              updateTtsVoices.mutate({
                nativeVoiceId,
                targetVoiceId: value,
              })
            }
          },
          voiceLabel: (voice) =>
            voice.gender === "Female"
              ? t("settings.voiceFemale")
              : voice.gender === "Male"
                ? t("settings.voiceMale")
                : t("settings.voice"),
        }}
        aiSettings={{
          open: aiDialogOpen,
          onOpenChange: setAiDialogOpen,
          useAiUserKey,
          onUsePublic: () => {
            setUseAiUserKey(false)
            persistSettings({ useAiUserKey: false })
          },
          onUsePrivate: () => {
            setUseAiUserKey(true)
            persistSettings({ useAiUserKey: true })
          },
          aiProvidersDraft,
          onSetDefault: (id) => {
            setAiProvidersDraft((prev) => {
              const next = prev.map((item) => ({
                ...item,
                isDefault: item.id === id,
              }))
              return [...next].sort((a, b) => Number(b.isDefault) - Number(a.isDefault))
            })
          },
          onEdit: (provider) => {
            setAiProviderEditing({ ...provider })
            setAiProviderEditModels(provider.models.join(", "))
            setAiProviderEditKeyVisible(false)
            setAiProviderEditOpen(true)
          },
          onDelete: (id) => setAiProviderDeleteId(id),
          onReset: () => setAiProviderResetOpen(true),
          onAddCustom: () => setAiProviderAddOpen(true),
          onSave: async () => {
            if (aiProvidersDraft.length === 0) return
            const defaultProvider = aiProvidersDraft.find((item) => item.isDefault)
            if (defaultProvider) {
              await updateAiProviderDefault.mutateAsync({
                id: defaultProvider.id,
              })
            }
            for (const provider of aiProvidersDraft) {
              const models = provider.models.map((value) => value.trim()).filter(Boolean)
              await updateAiProviderConfig.mutateAsync({
                id: provider.id,
                apiUrl: provider.apiUrl.trim(),
                enabled: provider.enabled,
                models,
                apiKey: useAiUserKey ? provider.apiKey ?? "" : null,
              })
            }
            await aiProvidersQuery.refetch()
          },
        }}
        aiProviderAdd={{
          open: aiProviderAddOpen,
          onOpenChange: setAiProviderAddOpen,
          useAiUserKey,
          name: newAiProviderName,
          onNameChange: setNewAiProviderName,
          providerType: newAiProviderType,
          onProviderTypeChange: setNewAiProviderType,
          apiUrl: newAiProviderApiUrl,
          onApiUrlChange: setNewAiProviderApiUrl,
          apiKey: newAiProviderApiKey,
          onApiKeyChange: setNewAiProviderApiKey,
          apiKeyVisible: newAiProviderKeyVisible,
          onToggleApiKeyVisible: () => setNewAiProviderKeyVisible((prev) => !prev),
          models: newAiProviderModels,
          onModelsChange: setNewAiProviderModels,
          enabled: newAiProviderEnabled,
          onEnabledChange: setNewAiProviderEnabled,
          onSave: async () => {
            const name = newAiProviderName.trim()
            const apiUrl = newAiProviderApiUrl.trim()
            const models = newAiProviderModels
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
            if (!name || !apiUrl || models.length === 0) {
              toast.error(t("ai.addCustomError"))
              return
            }
            try {
              await createUserAiProvider.mutateAsync({
                name,
                providerType: newAiProviderType,
                apiUrl,
                models,
                enabled: newAiProviderEnabled,
                apiKey: useAiUserKey ? newAiProviderApiKey.trim() || null : null,
              })
              await aiProvidersQuery.refetch()
              setNewAiProviderName("")
              setNewAiProviderType("openai")
              setNewAiProviderApiUrl("")
              setNewAiProviderModels("")
              setNewAiProviderEnabled(true)
              setNewAiProviderApiKey("")
              setNewAiProviderKeyVisible(false)
              setAiProviderAddOpen(false)
              toast.success(t("ai.addCustomSuccess"))
            } catch (error) {
              const message = error instanceof Error ? error.message : t("ai.addCustomFailed")
              toast.error(message)
            }
          },
        }}
        aiProviderEdit={{
          open: aiProviderEditOpen,
          onOpenChange: setAiProviderEditOpen,
          useAiUserKey,
          provider: aiProviderEditing,
          apiKeyVisible: aiProviderEditKeyVisible,
          onToggleApiKeyVisible: () => setAiProviderEditKeyVisible((prev) => !prev),
          modelsValue: aiProviderEditModels,
          onModelsChange: setAiProviderEditModels,
          onChangeProvider: (provider) => setAiProviderEditing(provider),
          onSave: async () => {
            if (!aiProviderEditing) return
            const models = aiProviderEditModels
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
            if (!aiProviderEditing.apiUrl.trim()) {
              toast.error(t("ai.baseUrlRequired"))
              return
            }
            try {
              await updateAiProviderConfig.mutateAsync({
                id: aiProviderEditing.id,
                apiUrl: aiProviderEditing.apiUrl.trim(),
                name: aiProviderEditing.isPublic ? undefined : aiProviderEditing.name ?? "",
                models,
                enabled: aiProviderEditing.enabled,
                apiKey: useAiUserKey ? aiProviderEditing.apiKey ?? "" : null,
              })
              await aiProvidersQuery.refetch()
              setAiProviderEditOpen(false)
              setAiProviderEditing(null)
              toast.success(t("ai.editProviderSuccess"))
            } catch (error) {
              const message = error instanceof Error ? error.message : t("common.updateFailed")
              toast.error(message)
            }
          },
        }}
        aiProviderDelete={{
          open: Boolean(aiProviderDeleteId),
          onOpenChange: () => setAiProviderDeleteId(null),
          onConfirm: async () => {
            if (!aiProviderDeleteId) return
            try {
              await deleteAiProvider.mutateAsync({ id: aiProviderDeleteId })
              await aiProvidersQuery.refetch()
              setAiProviderDeleteId(null)
              toast.success(t("ai.deleteProviderSuccess"))
            } catch (error) {
              const message = error instanceof Error ? error.message : t("common.deleteFailed")
              toast.error(message)
            }
          },
        }}
        aiProviderReset={{
          open: aiProviderResetOpen,
          onOpenChange: setAiProviderResetOpen,
          onConfirm: async () => {
            try {
              await resetAiProvidersToPublic.mutateAsync({ confirm: true })
              await aiProvidersQuery.refetch()
              setAiProviderResetOpen(false)
              toast.success(t("ai.resetSuccess"))
            } catch (error) {
              const message = error instanceof Error ? error.message : t("ai.resetFailed")
              toast.error(message)
            }
          },
        }}
        aiInstructionPanel={{
          aiInstructionDialogOpen,
          setAiInstructionDialogOpen,
          aiInstructionDrafts,
          setAiInstructionEditOpen,
          setAiInstructionEditing,
          setAiInstructionDeleteId,
          setAiInstructionDeleteOpen,
          setAiInstructionAddOpen,
          aiInstructionEditOpen,
          aiInstructionEditing,
          updateInstruction: (payload) => updateUserAiInstruction.mutateAsync(payload),
          refetchInstructions: aiInstructionQuery.refetch,
          aiInstructionAddOpen,
          publicAiInstructions,
          aiInstructionAddProviderId,
          setAiInstructionAddProviderId,
          aiInstructionAddModel,
          setAiInstructionAddModel,
          aiProviders: aiProvidersQuery.data ?? [],
          resolveProviderModels,
          createFromPublic: (payload) => createUserAiInstructionFromPublic.mutateAsync(payload),
          aiInstructionDeleteOpen,
          aiInstructionDeleteId,
          deleteInstruction: (payload) => deleteUserAiInstruction.mutateAsync(payload),
        }}
        shadowing={{
          open: shadowingDialogOpen,
          onOpenChange: setShadowingDialogOpen,
          shadowingDraftEnabled,
          setShadowingDraftEnabled,
          shadowingDraftSpeeds,
          setShadowingDraftSpeeds,
          onConfirm: () => {
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
          },
        }}
        clearCache={{
          open: clearCacheOpen,
          onOpenChange: setClearCacheOpen,
          onConfirm: () => {
            clearTtsCache().catch(() => {})
          },
        }}
      />
    </div>
  )
}
