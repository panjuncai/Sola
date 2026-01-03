import * as React from "react"
import { useTranslation } from "react-i18next"

import {
  Button,
  Card,
  CardContent,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  toast,
  cn,
} from "@sola/ui"
import { buildTtsCacheKey } from "@sola/shared"

import i18n from "@/i18n"
import { trpc } from "@/lib/trpc"
import { useArticleStore } from "@/stores/useArticleStore"
import { useAuthStore } from "@/stores/useAuthStore"

function deriveTitle(content: string) {
  return content.trim().slice(0, 10)
}

export function ArticleList() {
  const { t } = useTranslation()
  const articles = useArticleStore((state) => state.articles)
  const setArticles = useArticleStore((state) => state.setArticles)
  const listQuery = trpc.article.list.useQuery()
  const utils = trpc.useUtils()

  const languageOptions = ["zh-CN", "en-US", "fr-FR"] as const
  type LanguageOption = (typeof languageOptions)[number]
  type DisplayOrder = "native_first" | "target_first"
  type AiProviderType = "volcengine" | "qwen" | "openai" | "gemini" | "aihubmix"
  type ClozeSegment =
    | { kind: "same"; text: string }
    | { kind: "extra"; text: string }
    | { kind: "missing"; text: string }
    | { kind: "mismatch"; parts: { type: "same" | "extra" | "missing"; text: string }[] }

  const [content, setContent] = React.useState("")
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [activeArticleId, setActiveArticleId] = React.useState<string | null>(null)
  const [isCreating, setIsCreating] = React.useState(false)
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [settingsOpen, setSettingsOpen] = React.useState(false)
  const [deleteAccountOpen, setDeleteAccountOpen] = React.useState(false)
  const [languageDialogOpen, setLanguageDialogOpen] = React.useState(false)
  const [isLoopingAll, setIsLoopingAll] = React.useState(false)
  const [isLoopingTarget, setIsLoopingTarget] = React.useState(false)
  const [isLoopingSingle, setIsLoopingSingle] = React.useState(false)
  const [isLoopingShadowing, setIsLoopingShadowing] = React.useState(false)
  const [isClozeEnabled, setIsClozeEnabled] = React.useState(false)
  const [isRandomMode, setIsRandomMode] = React.useState(false)
  const [isCardMode, setIsCardMode] = React.useState(false)
  const [cardIndex, setCardIndex] = React.useState(0)
  const [cardFlipped, setCardFlipped] = React.useState(false)
  const [cardDragX, setCardDragX] = React.useState(0)
  const [cardDragging, setCardDragging] = React.useState(false)
  const cardPointerRef = React.useRef<{ id: number | null; x: number }>({
    id: null,
    x: 0,
  })
  const cardDragMovedRef = React.useRef(false)
  const cardPlayTokenRef = React.useRef(0)
  const [selectedSentenceId, setSelectedSentenceId] = React.useState<string | null>(
    null
  )
  const [selectedSentenceRole, setSelectedSentenceRole] = React.useState<
    "native" | "target" | null
  >(null)
  const [playingSpeed, setPlayingSpeed] = React.useState<number | null>(null)
  const loopTokenRef = React.useRef(0)
  const audioRef = React.useRef<HTMLAudioElement | null>(null)
  const [playingSentenceId, setPlayingSentenceId] = React.useState<string | null>(null)
  const [playingRole, setPlayingRole] = React.useState<"native" | "target" | null>(null)
  const ttsCacheRef = React.useRef<Record<string, string>>({})
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
  const [darkMode, setDarkMode] = React.useState(false)
  const [useAiUserKey, setUseAiUserKey] = React.useState(false)
  const [blurTarget, setBlurTarget] = React.useState(false)
  const [blurNative, setBlurNative] = React.useState(false)
  const [clozeInputs, setClozeInputs] = React.useState<Record<string, string>>({})
  const [clozeRevealed, setClozeRevealed] = React.useState<Record<string, boolean>>(
    {}
  )
  const [clozeResults, setClozeResults] = React.useState<
    Record<
      string,
      {
        correct: boolean
        segments: ClozeSegment[]
      }
    >
  >({})
  const clozeBlurPrevRef = React.useRef<boolean | null>(null)

  const settingsQuery = trpc.user.getSettings.useQuery()
  const updateSettings = trpc.user.updateSettings.useMutation()
  const [uiLanguage, setUiLanguage] = React.useState<LanguageOption>("zh-CN")
  const [nativeLanguageSetting, setNativeLanguageSetting] =
    React.useState<LanguageOption>("zh-CN")
  const [targetLanguageSetting, setTargetLanguageSetting] =
    React.useState<LanguageOption>("en-US")
  const [displayOrderSetting, setDisplayOrderSetting] =
    React.useState<DisplayOrder>("native_first")
  const [playbackNativeRepeat, setPlaybackNativeRepeat] = React.useState(1)
  const [playbackTargetRepeat, setPlaybackTargetRepeat] = React.useState(1)
  const [playbackPauseSeconds, setPlaybackPauseSeconds] = React.useState(0)
  const [nativeVoiceId, setNativeVoiceId] = React.useState<string | null>(null)
  const [targetVoiceId, setTargetVoiceId] = React.useState<string | null>(null)
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
  const [shadowingEnabled, setShadowingEnabled] = React.useState(false)
  const [shadowingSpeeds, setShadowingSpeeds] = React.useState<number[]>([
    0.2, 0.4, 0.6, 0.8,
  ])
  const [shadowingDraftEnabled, setShadowingDraftEnabled] = React.useState(false)
  const [shadowingDraftSpeeds, setShadowingDraftSpeeds] = React.useState<number[]>([
    0.2, 0.4, 0.6, 0.8,
  ])
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
  const lastLoopModeRef = React.useRef<"all" | "target">("all")
  const ttsInitRef = React.useRef<string>("")
  const ttsOptionsQuery = trpc.user.getTtsOptions.useQuery(
    {
      nativeLanguage: nativeLanguageSetting as "zh-CN" | "en-US" | "fr-FR",
      targetLanguage: targetLanguageSetting as "zh-CN" | "en-US" | "fr-FR",
    },
    { enabled: settingsQuery.isSuccess }
  )
  const updateTtsVoices = trpc.user.updateTtsVoices.useMutation()
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

  const normalizeClozeTokens = React.useCallback(
    (value: string, language: string) => {
      let text = value.toLowerCase().trim()
      if (language.toLowerCase().startsWith("fr")) {
        text = text.normalize("NFD").replace(/\p{Diacritic}/gu, "")
      }
      text = text.replace(/[\p{P}\p{S}]/gu, " ")
      text = text.replace(/\s+/g, " ").trim()
      if (!text) return []
      return text.split(" ")
    },
    []
  )

  const diffClozeChars = React.useCallback((expected: string, actual: string) => {
    const a = expected.split("")
    const b = actual.split("")
    const dp = Array.from({ length: a.length + 1 }, () =>
      new Array(b.length + 1).fill(0)
    )
    for (let i = 1; i <= a.length; i += 1) {
      for (let j = 1; j <= b.length; j += 1) {
        const aChar = a[i - 1]
        const bChar = b[j - 1]
        if (aChar === bChar) {
          dp[i]![j] = dp[i - 1]![j - 1]! + 1
        } else {
          dp[i]![j] = Math.max(dp[i - 1]![j]!, dp[i]![j - 1]!)
        }
      }
    }
    const ops: { type: "same" | "extra" | "missing"; char: string }[] = []
    let i = a.length
    let j = b.length
    while (i > 0 || j > 0) {
      const aChar = i > 0 ? a[i - 1] : undefined
      const bChar = j > 0 ? b[j - 1] : undefined
      if (i > 0 && j > 0 && aChar === bChar) {
        ops.push({ type: "same", char: aChar ?? "" })
        i -= 1
        j -= 1
      } else if (j > 0 && (i === 0 || dp[i]![j - 1]! >= dp[i - 1]![j]!)) {
        ops.push({ type: "extra", char: bChar ?? "" })
        j -= 1
      } else if (i > 0) {
        ops.push({ type: "missing", char: aChar ?? "" })
        i -= 1
      }
    }
    ops.reverse()
    const segments: { type: "same" | "extra" | "missing"; text: string }[] = []
    for (const op of ops) {
      const last = segments[segments.length - 1]
      if (last && last.type === op.type) {
        last.text += op.char
      } else {
        segments.push({ type: op.type, text: op.char })
      }
    }
    return segments
  }, [])

  const diffClozeTokens = React.useCallback(
    (expected: string[], actual: string[]): ClozeSegment[] => {
      const maxLen = Math.max(expected.length, actual.length)
      const segments: ClozeSegment[] = []
      for (let i = 0; i < maxLen; i += 1) {
        const exp = expected[i]
        const act = actual[i]
        if (exp && act) {
          if (exp === act) {
            segments.push({ kind: "same", text: exp })
          } else {
            segments.push({ kind: "mismatch", parts: diffClozeChars(exp, act) })
          }
        } else if (exp) {
          segments.push({ kind: "missing", text: exp })
        } else if (act) {
          segments.push({ kind: "extra", text: act })
        }
      }
      return segments
    },
    [diffClozeChars]
  )

  const showCreate = isCreating || articles.length === 0
  const activeArticleExists = React.useMemo(() => {
    if (!activeArticleId) return false
    const list = listQuery.data ?? articles
    return list.some((article) => article.id === activeArticleId)
  }, [activeArticleId, articles, listQuery.data])
  const detailQuery = trpc.article.get.useQuery(
    { articleId: activeArticleId ?? "" },
    {
      enabled:
        Boolean(activeArticleId) &&
        !showCreate &&
        (activeArticleExists || listQuery.isFetching),
      retry: false,
      onError: () => {
        setActiveArticleId(null)
        setIsCreating(true)
      },
    }
  )

  const createMutation = trpc.article.create.useMutation({
    onSuccess: async (data) => {
      await utils.article.list.invalidate()
      setContent("")
      setSelectedIds([])
      setIsCreating(false)
      setActiveArticleId(data.articleId)
    },
  })
  const deleteMutation = trpc.article.deleteMany.useMutation({
    onMutate: ({ articleIds }) => {
      if (activeArticleId && articleIds.includes(activeArticleId)) {
        setActiveArticleId(null)
        setIsCreating(true)
      }
    },
    onSuccess: async () => {
      await utils.article.list.invalidate()
      setSelectedIds([])
      setIsCreating(false)
      setActiveArticleId(null)
    },
  })
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
              ? { ...sentence, nativeText, targetText }
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
    if (listQuery.data) setArticles(listQuery.data)
  }, [listQuery.data, setArticles])

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
    if (isClozeEnabled) {
      if (clozeBlurPrevRef.current === null) {
        clozeBlurPrevRef.current = blurTarget
      }
      setBlurTarget(true)
    } else if (clozeBlurPrevRef.current !== null) {
      setBlurTarget(clozeBlurPrevRef.current)
      clozeBlurPrevRef.current = null
    }
  }, [isClozeEnabled, blurTarget])

  React.useEffect(() => {
    if (!isClozeEnabled) return
    setClozeInputs({})
    setClozeResults({})
    setClozeRevealed({})
  }, [isClozeEnabled, activeArticleId])

  React.useEffect(() => {
    if (!detailQuery.data || !isCardMode) return
    setCardIndex(0)
    setCardFlipped(false)
  }, [detailQuery.data, isCardMode, activeArticleId])

  React.useEffect(() => {
    if (!isRandomMode) return
    setIsCardMode(true)
    setCardIndex(0)
    setCardFlipped(false)
  }, [isRandomMode])

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

  const stopLoopPlayback = () => {
    loopTokenRef.current += 1
    setIsLoopingAll(false)
    setIsLoopingTarget(false)
    setIsLoopingSingle(false)
    setIsLoopingShadowing(false)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current = null
    }
  }

  React.useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState !== "visible") {
        stopLoopPlayback()
        cardPlayTokenRef.current += 1
        if (audioRef.current) {
          audioRef.current.pause()
          audioRef.current = null
        }
      }
    }
    document.addEventListener("visibilitychange", handleVisibility)
    return () => document.removeEventListener("visibilitychange", handleVisibility)
  }, [])

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

  React.useEffect(() => {
    if (!activeArticleId && !showCreate && articles.length > 0) {
      setActiveArticleId(articles[0]!.id)
    }
  }, [activeArticleId, articles, showCreate])

  React.useEffect(() => {
    if (!activeArticleId || showCreate) return
    if (listQuery.isFetching) return
    const list = listQuery.data ?? articles
    if (!list.some((article) => article.id === activeArticleId)) {
      setActiveArticleId(null)
      setIsCreating(true)
    }
  }, [activeArticleExists, activeArticleId, showCreate, listQuery.isFetching, listQuery.data, articles])

  React.useEffect(() => {
    stopLoopPlayback()
  }, [activeArticleId, showCreate])

  const handleCreate = () => {
    const trimmed = content.trim()
    if (!trimmed) return
    createMutation.mutate({
      title: deriveTitle(trimmed),
      content: trimmed,
      sourceType: "article",
    })
  }

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const languages = [
    { value: "zh-CN" as LanguageOption, label: t("lang.zhCN") },
    { value: "en-US" as LanguageOption, label: t("lang.enUS") },
    { value: "fr-FR" as LanguageOption, label: t("lang.frFR") },
  ]

  const persistSettings = (next?: Partial<{
    uiLanguage: LanguageOption
    nativeLanguage: LanguageOption
    targetLanguage: LanguageOption
    displayOrder: DisplayOrder
    playbackNativeRepeat: number
    playbackTargetRepeat: number
    playbackPauseSeconds: number
    useAiUserKey: boolean
    shadowing: { enabled: boolean; speeds: number[] }
  }>) => {
    if (!settingsQuery.data) return
    const payload: Parameters<typeof updateSettings.mutate>[0] = {
      uiLanguage: next?.uiLanguage ?? uiLanguage,
      nativeLanguage: next?.nativeLanguage ?? nativeLanguageSetting,
      targetLanguage: next?.targetLanguage ?? targetLanguageSetting,
      displayOrder: next?.displayOrder ?? displayOrderSetting,
      playbackNativeRepeat: next?.playbackNativeRepeat ?? playbackNativeRepeat,
      playbackTargetRepeat: next?.playbackTargetRepeat ?? playbackTargetRepeat,
      playbackPauseMs: Math.round(
        ((next?.playbackPauseSeconds ?? playbackPauseSeconds) || 0) * 1000
      ),
      useAiUserKey: next?.useAiUserKey ?? useAiUserKey,
      shadowing: next?.shadowing ?? {
        enabled: shadowingEnabled,
        speeds: shadowingSpeeds,
      },
    }
    updateSettings.mutate(payload)
  }

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem("sola-tts-cache")
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, string>
        if (parsed && typeof parsed === "object") {
          ttsCacheRef.current = parsed
        }
      }
    } catch {
      ttsCacheRef.current = {}
    }
  }, [])

  const persistTtsCache = React.useCallback(() => {
    try {
      window.localStorage.setItem(
        "sola-tts-cache",
        JSON.stringify(ttsCacheRef.current)
      )
    } catch {
      // ignore quota errors
    }
  }, [])

  const clearTtsCache = async () => {
    ttsCacheRef.current = {}
    try {
      window.localStorage.removeItem("sola-tts-cache")
    } catch {
      // ignore
    }
    if ("caches" in window) {
      try {
        await caches.delete("sola-tts-audio")
      } catch {
        // ignore
      }
    }
    toast.success(t("settings.cacheCleared"))
  }

  const getCachedAudioUrl = React.useCallback(
    (cacheKey: string) => {
      const cached = ttsCacheRef.current[cacheKey]
      if (!cached) return undefined
      if (cached.startsWith("/")) {
        const upgraded = `${apiBaseUrl}${cached}`
        ttsCacheRef.current[cacheKey] = upgraded
        persistTtsCache()
        return upgraded
      }
      return cached
    },
    [apiBaseUrl, persistTtsCache]
  )
  const setCachedAudioUrl = React.useCallback(
    (cacheKey: string, url: string) => {
      ttsCacheRef.current[cacheKey] = url
      persistTtsCache()
    },
    [persistTtsCache]
  )

  const clearSentenceCache = React.useCallback(
    async (sentenceId: string) => {
      const removedUrls: string[] = []
      for (const [key, url] of Object.entries(ttsCacheRef.current)) {
        if (key.includes(`:${sentenceId}:`)) {
          removedUrls.push(url)
          delete ttsCacheRef.current[key]
        }
      }
      if (removedUrls.length > 0) {
        persistTtsCache()
      }
      if ("caches" in window && removedUrls.length > 0) {
        try {
          const cache = await caches.open("sola-tts-audio")
          await Promise.all(removedUrls.map((url) => cache.delete(url)))
        } catch {
          // ignore
        }
      }
    },
    [persistTtsCache]
  )

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

  const resolveVoiceId = React.useCallback(
    (role: "native" | "target") => {
      const data = ttsOptionsQuery.data
      if (!data) return null
      const selectedId = role === "native" ? nativeVoiceId : targetVoiceId
      const options = role === "native" ? data.nativeOptions : data.targetOptions
      const match = options.find((voice) => voice.id === selectedId)
      return match?.voiceId ?? null
    },
    [nativeVoiceId, targetVoiceId, ttsOptionsQuery.data]
  )

  const buildLocalCacheKey = React.useCallback(
    (sentenceId: string, role: "native" | "target", speed?: number) => {
      if (!userId || !detailQuery.data || !ttsOptionsQuery.data) return null
      const voiceId = resolveVoiceId(role)
      if (!voiceId) return null
      const languageCode =
        role === "native"
          ? detailQuery.data.article.nativeLanguage
          : detailQuery.data.article.targetLanguage
      return buildTtsCacheKey({
        userId,
        sentenceId,
        languageCode,
        providerType: ttsOptionsQuery.data.providerType,
        voiceId,
        region: ttsOptionsQuery.data.providerRegion ?? "",
        speed: speed ?? 1,
      })
    },
    [detailQuery.data, resolveVoiceId, ttsOptionsQuery.data, userId]
  )

  const playAudioUrl = React.useCallback(async (url: string) => {
    let objectUrl: string | null = null
    if ("caches" in window) {
      try {
        const cache = await caches.open("sola-tts-audio")
        const cached = await cache.match(url)
        if (cached) {
          const blob = await cached.blob()
          objectUrl = URL.createObjectURL(blob)
        } else {
          try {
            const response = await fetch(url, { credentials: "include" })
            if (response.ok) {
              await cache.put(url, response.clone())
              const blob = await response.blob()
              objectUrl = URL.createObjectURL(blob)
            }
          } catch {
            objectUrl = null
          }
        }
      } catch {
        objectUrl = null
      }
    }

    return new Promise<boolean>((resolve) => {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      let retried = false
      const play = (src: string) => {
        const audio = new Audio(src)
        audioRef.current = audio
        const cleanup = () => {
          audio.onended = null
          audio.onerror = null
          if (objectUrl) {
            URL.revokeObjectURL(objectUrl)
            objectUrl = null
          }
        }
        const finalize = () => {
          cleanup()
          resolve(true)
        }
        const fail = () => {
          cleanup()
          if (objectUrl && !retried) {
            retried = true
            play(url)
            return
          }
          resolve(false)
        }
        audio.onended = finalize
        audio.onerror = fail
        audio.play().catch(fail)
      }

      play(objectUrl ?? url)
    })
  }, [])

  type PlaybackSentence = {
    id: string
    nativeText: string | null
    targetText: string | null
  }

  const playSentenceRole = React.useCallback(
    async (
      sentence: PlaybackSentence,
      role: "native" | "target",
      speed?: number
    ) => {
      const text =
        role === "native" ? sentence.nativeText ?? "" : sentence.targetText ?? ""
      if (!text) return false
      const localKey = buildLocalCacheKey(sentence.id, role, speed)
      if (localKey) {
        const cached = getCachedAudioUrl(localKey)
        if (cached) {
          setPlayingSentenceId(sentence.id)
          setPlayingRole(role)
          setPlayingSpeed(speed ?? 1)
          return playAudioUrl(cached)
        }
      }
      const result = await sentenceAudioMutation.mutateAsync({
        sentenceId: sentence.id,
        role,
        speed,
      })
      let url = getCachedAudioUrl(result.cacheKey)
      if (!url) {
        url = result.url
        setCachedAudioUrl(result.cacheKey, url)
      }
      setPlayingSentenceId(sentence.id)
      setPlayingRole(role)
      setPlayingSpeed(speed ?? 1)
      return playAudioUrl(url)
    },
    [
      buildLocalCacheKey,
      getCachedAudioUrl,
      playAudioUrl,
      sentenceAudioMutation,
      setCachedAudioUrl,
    ]
  )

  const waitMs = React.useCallback(
    (ms: number) =>
      new Promise<void>((resolve) => {
        if (!ms) return resolve()
        setTimeout(resolve, ms)
      }),
    []
  )

  const startLoopAll = async () => {
    if (!detailQuery.data) return
    stopLoopPlayback()
    const token = loopTokenRef.current + 1
    loopTokenRef.current = token
    setIsLoopingAll(true)
    lastLoopModeRef.current = "all"

    const sentences = detailQuery.data.sentences
    const startIndex =
      selectedSentenceId != null
        ? Math.max(
            0,
            sentences.findIndex((sentence) => sentence.id === selectedSentenceId)
          )
        : 0
    const orderSetting = displayOrderSetting ?? "native_first"
    const pauseMs = Math.max(0, Math.round(playbackPauseSeconds * 1000))

    while (loopTokenRef.current === token) {
      for (let sIndex = startIndex; sIndex < sentences.length; sIndex += 1) {
        const sentence = sentences[sIndex]
        if (!sentence) continue
        if (loopTokenRef.current !== token) break
        const order =
          orderSetting === "native_first" ? ["native", "target"] : ["target", "native"]
        const isFirstSentence = sIndex === startIndex
        const orderedRoles =
          isFirstSentence && selectedSentenceRole
            ? [
                selectedSentenceRole,
                ...order.filter((role) => role !== selectedSentenceRole),
              ]
            : order

        const prefetch = () => {
          const upcoming = sentences.slice(sIndex + 1, sIndex + 6)
          for (const next of upcoming) {
            for (const role of order) {
              const text =
                role === "native" ? next.nativeText ?? "" : next.targetText ?? ""
              if (!text) continue
              const localKey = buildLocalCacheKey(next.id, role as "native" | "target")
              if (localKey) {
                const cached = getCachedAudioUrl(localKey)
                if (cached) continue
              }
              sentenceAudioMutation
                .mutateAsync({
                  sentenceId: next.id,
                  role: role as "native" | "target",
                })
                .then((result) => {
                  setCachedAudioUrl(result.cacheKey, result.url)
                })
                .catch(() => {})
            }
          }
        }

        for (const role of orderedRoles) {
          if (loopTokenRef.current !== token) break
          const text =
            role === "native" ? sentence.nativeText ?? "" : sentence.targetText ?? ""
          if (!text) continue

          const repeatTimes =
            role === "native" ? playbackNativeRepeat : playbackTargetRepeat

          for (let i = 0; i < Math.max(1, repeatTimes); i += 1) {
            if (loopTokenRef.current !== token) break
            const ok = await playSentenceRole(sentence, role as "native" | "target")
            if (!ok) {
              stopLoopPlayback()
              toast.error(t("tts.audioPlayFailed"))
              return
            }
            if (pauseMs > 0) {
              await waitMs(pauseMs)
            }
          }
        }
        prefetch()
      }
    }
  }

  const startLoopTarget = async () => {
    if (!detailQuery.data) return
    stopLoopPlayback()
    const token = loopTokenRef.current + 1
    loopTokenRef.current = token
    setIsLoopingTarget(true)
    lastLoopModeRef.current = "target"

    const sentences = detailQuery.data.sentences
    const startIndex =
      selectedSentenceId != null
        ? Math.max(
            0,
            sentences.findIndex((sentence) => sentence.id === selectedSentenceId)
          )
        : 0
    const pauseMs = Math.max(0, Math.round(playbackPauseSeconds * 1000))

    while (loopTokenRef.current === token) {
      for (let sIndex = startIndex; sIndex < sentences.length; sIndex += 1) {
        const sentence = sentences[sIndex]
        if (!sentence) continue
        if (loopTokenRef.current !== token) break
        const isFirstSentence = sIndex === startIndex
        const shouldPlaySelectedFirst =
          isFirstSentence &&
          selectedSentenceRole === "native" &&
          sentence.nativeText &&
          sentence.nativeText.trim().length > 0
        const text = sentence.targetText ?? ""
        if (!text) continue

        const prefetch = () => {
          const upcoming = sentences.slice(sIndex + 1, sIndex + 6)
          for (const next of upcoming) {
            const nextText = next.targetText ?? ""
            if (!nextText) continue
            const localKey = buildLocalCacheKey(next.id, "target")
            if (localKey) {
              const cached = getCachedAudioUrl(localKey)
              if (cached) continue
            }
            sentenceAudioMutation
              .mutateAsync({ sentenceId: next.id, role: "target" })
              .then((result) => {
                setCachedAudioUrl(result.cacheKey, result.url)
              })
              .catch(() => {})
          }
        }

        if (shouldPlaySelectedFirst) {
          const ok = await playSentenceRole(sentence, "native")
          if (!ok) {
            stopLoopPlayback()
            toast.error(t("tts.audioPlayFailed"))
            return
          }
          if (pauseMs > 0) {
            await waitMs(pauseMs)
          }
        }

        for (let i = 0; i < Math.max(1, playbackTargetRepeat); i += 1) {
          if (loopTokenRef.current !== token) break
          const ok = await playSentenceRole(sentence, "target")
          if (!ok) {
            stopLoopPlayback()
            toast.error(t("tts.audioPlayFailed"))
            return
          }
          if (pauseMs > 0) {
            await waitMs(pauseMs)
          }
        }

        prefetch()
      }
    }
  }

  const startLoopSingle = async () => {
    if (!detailQuery.data || !selectedSentenceId || !selectedSentenceRole) {
      toast.error(t("tts.selectSentenceFirst"))
      return
    }
    stopLoopPlayback()
    const token = loopTokenRef.current + 1
    loopTokenRef.current = token
    setIsLoopingSingle(true)

    const sentence = detailQuery.data.sentences.find(
      (item) => item.id === selectedSentenceId
    )
    if (!sentence) {
      stopLoopPlayback()
      return
    }

    const pauseMs = Math.max(0, Math.round(playbackPauseSeconds * 1000))
    const repeatTimes =
      selectedSentenceRole === "native" ? playbackNativeRepeat : playbackTargetRepeat

    while (loopTokenRef.current === token) {
      for (let i = 0; i < Math.max(1, repeatTimes); i += 1) {
        if (loopTokenRef.current !== token) break
        const ok = await playSentenceRole(sentence, selectedSentenceRole)
        if (!ok) {
          stopLoopPlayback()
          toast.error(t("tts.audioPlayFailed"))
          return
        }
        if (pauseMs > 0) {
          await waitMs(pauseMs)
        }
      }
    }
  }

  const startLoopShadowing = async () => {
    if (!detailQuery.data) return
    stopLoopPlayback()
    const token = loopTokenRef.current + 1
    loopTokenRef.current = token
    setIsLoopingShadowing(true)

    const sentences = detailQuery.data.sentences
    if (sentences.length === 0) {
      setIsLoopingShadowing(false)
      return
    }
    const targetSentence =
      selectedSentenceId != null
        ? sentences.find((sentence) => sentence.id === selectedSentenceId)
        : sentences[0]
    if (!targetSentence) {
      setIsLoopingShadowing(false)
      return
    }
    const role = selectedSentenceRole ?? "target"
    if (selectedSentenceId == null) {
      setSelectedSentenceId(targetSentence.id)
      setSelectedSentenceRole(role)
    }
    const pauseMs = Math.max(0, Math.round(playbackPauseSeconds * 1000))
    const speeds = shadowingSpeeds.length > 0 ? shadowingSpeeds : [1, 1, 1, 1]
    for (const speed of speeds) {
      if (loopTokenRef.current !== token) break
      const ok = await playSentenceRole(targetSentence, role, speed)
      if (!ok) {
        stopLoopPlayback()
        toast.error(t("tts.audioPlayFailed"))
        return
      }
      if (pauseMs > 0) {
        await waitMs(pauseMs)
      }
    }
    if (loopTokenRef.current === token) {
      setIsLoopingShadowing(false)
    }
  }

  const handleClozeCheck = async (sentenceId: string) => {
    if (!detailQuery.data) return
    const sentence = detailQuery.data.sentences.find((item) => item.id === sentenceId)
    if (!sentence?.targetText) return
    const input = clozeInputs[sentenceId] ?? ""
    const language = detailQuery.data.article.targetLanguage
    const expectedTokens = normalizeClozeTokens(sentence.targetText, language)
    const inputTokens = normalizeClozeTokens(input, language)
    const segments = diffClozeTokens(expectedTokens, inputTokens)
    const correct =
      expectedTokens.length === inputTokens.length &&
      expectedTokens.every((token, index) => token === inputTokens[index])
    setClozeResults((prev) => ({
      ...prev,
      [sentenceId]: { correct, segments },
    }))

    stopLoopPlayback()
    setSelectedSentenceId(sentenceId)
    setSelectedSentenceRole("target")
    const ok = await playSentenceRole(sentence, "target")
    if (!ok) {
      toast.error(t("tts.audioPlayFailed"))
      return
    }
    if (!correct) return

    const currentIndex = detailQuery.data.sentences.findIndex(
      (item) => item.id === sentenceId
    )
    const next = detailQuery.data.sentences
      .slice(currentIndex + 1)
      .find((item) => item.targetText && item.targetText.trim().length > 0)
    if (next) {
      setSelectedSentenceId(next.id)
      setSelectedSentenceRole("target")
    }
  }

  const cardSentences = React.useMemo(() => {
    if (!detailQuery.data) return []
    return detailQuery.data.sentences.filter(
      (sentence) =>
        Boolean(sentence.targetText?.trim()) || Boolean(sentence.nativeText?.trim())
    )
  }, [detailQuery.data])

  const cardFrontRole =
    displayOrderSetting === "native_first" ? "native" : "target"
  const cardBackRole = cardFrontRole === "native" ? "target" : "native"

  React.useEffect(() => {
    if (!isRandomMode) return
    if (cardSentences.length === 0) return
    setCardIndex(0)
    setCardFlipped(false)
  }, [isRandomMode, cardSentences.length])

  const cardCount = cardSentences.length
  const activeCardSentence = cardSentences[cardIndex]

  const goCard = React.useCallback(
    (nextIndex: number) => {
      if (cardCount === 0) return
      let bounded = nextIndex
      if (isRandomMode) {
        if (cardCount === 1) {
          bounded = 0
        } else {
          do {
            bounded = Math.floor(Math.random() * cardCount)
          } while (bounded === cardIndex)
        }
      } else {
        bounded = Math.max(0, Math.min(nextIndex, cardCount - 1))
      }
      setCardIndex(bounded)
      setCardFlipped(false)
    },
    [cardCount, cardIndex, isRandomMode]
  )

  const handleCardPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement
    if (target.closest("[data-card-nav]")) return
    event.currentTarget.setPointerCapture(event.pointerId)
    cardPointerRef.current = { id: event.pointerId, x: event.clientX }
    cardDragMovedRef.current = false
    setCardDragging(true)
  }

  const handleCardPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement
    if (target.closest("[data-card-nav]")) return
    if (cardPointerRef.current.id !== event.pointerId) return
    const deltaX = event.clientX - cardPointerRef.current.x
    cardPointerRef.current = { id: null, x: 0 }
    setCardDragging(false)
    setCardDragX(0)
    if (Math.abs(deltaX) < 10) {
      cardDragMovedRef.current = false
      setCardFlipped((prev) => !prev)
      return
    }
    if (Math.abs(deltaX) < 50) {
      cardDragMovedRef.current = false
      return
    }
    cardDragMovedRef.current = true
    if (deltaX > 0) {
      goCard(cardIndex - 1)
    } else {
      goCard(cardIndex + 1)
    }
  }

  const handleCardPointerCancel = () => {
    cardPointerRef.current = { id: null, x: 0 }
    setCardDragging(false)
    setCardDragX(0)
    cardDragMovedRef.current = false
  }

  const handleCardPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement
    if (target.closest("[data-card-nav]")) return
    if (cardPointerRef.current.id !== event.pointerId) return
    const deltaX = event.clientX - cardPointerRef.current.x
    if (Math.abs(deltaX) > 5) {
      cardDragMovedRef.current = true
    }
    setCardDragX(Math.max(-120, Math.min(120, deltaX)))
  }

  const playCardAudio = React.useCallback(
    async (sentenceId: string, role: "native" | "target") => {
      if (!detailQuery.data) return
      const sentence = detailQuery.data.sentences.find((item) => item.id === sentenceId)
      if (!sentence) return
      const text = role === "native" ? sentence.nativeText ?? "" : sentence.targetText ?? ""
      if (!text.trim()) return
      const repeatTimes =
        role === "native" ? playbackNativeRepeat : playbackTargetRepeat
      const pauseMs = Math.max(0, Math.round(playbackPauseSeconds * 1000))
      const token = cardPlayTokenRef.current + 1
      cardPlayTokenRef.current = token
      for (let i = 0; i < Math.max(1, repeatTimes); i += 1) {
        if (cardPlayTokenRef.current !== token) return
        const ok = await playSentenceRole(sentence, role)
        if (cardPlayTokenRef.current !== token) return
        if (!ok) {
          toast.error(t("tts.audioPlayFailed"))
          return
        }
        if (pauseMs > 0) {
          await waitMs(pauseMs)
        }
      }
    },
    [
      detailQuery.data,
      playbackNativeRepeat,
      playbackTargetRepeat,
      playbackPauseSeconds,
      playSentenceRole,
      t,
      waitMs,
    ]
  )

  React.useEffect(() => {
    if (!isCardMode) return
    const sentence = activeCardSentence
    if (!sentence) return
    const role = cardFlipped ? cardBackRole : cardFrontRole
    playCardAudio(sentence.id, role)
  }, [
    isCardMode,
    cardFlipped,
    cardIndex,
    activeCardSentence,
    cardFrontRole,
    cardBackRole,
    playCardAudio,
  ])
  const deleteTargets =
    selectedIds.length > 0 ? selectedIds : activeArticleId ? [activeArticleId] : []

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
            <div
              ref={settingsPanelRef}
              className="absolute bottom-12 left-0 right-0 z-20 rounded-xl border bg-card shadow-[0_16px_40px_rgba(15,23,42,0.18)]"
            >
              <div className="px-4 py-3 text-sm font-semibold">{t("settings.title")}</div>
              <div className="space-y-3 border-t px-4 py-3 text-sm">
                <div className="flex items-center justify-between">
                  <span>{t("settings.darkMode")}</span>
                  <button
                    type="button"
                    className={cn(
                      "relative h-5 w-10 rounded-full transition",
                      darkMode ? "bg-primary" : "bg-muted"
                    )}
                    onClick={() => setDarkMode((prev) => !prev)}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 h-4 w-4 rounded-full bg-background shadow transition",
                        darkMode ? "left-5" : "left-1"
                      )}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span>{t("settings.aiSettings")}</span>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8"
                    onClick={() => setAiDialogOpen(true)}
                  >
                    {t("settings.aiSettings")}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <span>{t("settings.aiInstructions")}</span>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8"
                    onClick={() => setAiInstructionDialogOpen(true)}
                  >
                    {t("settings.aiInstructions")}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <span>{t("settings.uiLanguage")}</span>
                  <select
                    className="h-8 rounded-md border bg-background px-2 text-sm"
                    value={uiLanguage}
                    onChange={(event) => {
                      const value = event.target.value as LanguageOption
                      setUiLanguage(value)
                      persistSettings({ uiLanguage: value })
                      i18n.changeLanguage(value)
                      if (typeof window !== "undefined") {
                        localStorage.setItem("sola_ui_lang", value)
                      }
                    }}
                  >
                    {languages.map((lang) => (
                      <option key={lang.value} value={lang.value}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <span>{t("settings.languageSettings")}</span>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8"
                    onClick={() => setLanguageDialogOpen(true)}
                  >
                    {t("settings.languageSettings")}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <span>{t("settings.languagePriority")}</span>
                  <select
                    className="h-8 rounded-md border bg-background px-2 text-sm"
                    value={displayOrderSetting}
                    onChange={(event) => {
                      const value = event.target.value as DisplayOrder
                      setDisplayOrderSetting(value)
                      persistSettings({ displayOrder: value })
                    }}
                  >
                    <option value="native_first">{t("settings.nativeFirst")}</option>
                    <option value="target_first">{t("settings.targetFirst")}</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <span>{t("settings.shadowingConfig")}</span>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8"
                    onClick={() => setShadowingDialogOpen(true)}
                  >
                    {t("settings.shadowing")}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <span>{t("settings.playbackNativeRepeat")}</span>
                  <input
                    type="number"
                    min={0}
                    className="h-8 w-16 rounded-md border bg-background px-2 text-sm text-right"
                    value={playbackNativeRepeat}
                    onChange={(event) => {
                      const value = Number(event.target.value)
                      const next = Number.isFinite(value) ? value : 0
                      setPlaybackNativeRepeat(next)
                      persistSettings({ playbackNativeRepeat: next })
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span>{t("settings.playbackTargetRepeat")}</span>
                  <input
                    type="number"
                    min={0}
                    className="h-8 w-16 rounded-md border bg-background px-2 text-sm text-right"
                    value={playbackTargetRepeat}
                    onChange={(event) => {
                      const value = Number(event.target.value)
                      const next = Number.isFinite(value) ? value : 0
                      setPlaybackTargetRepeat(next)
                      persistSettings({ playbackTargetRepeat: next })
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span>{t("settings.playbackPauseSeconds")}</span>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    className="h-8 w-16 rounded-md border bg-background px-2 text-sm text-right"
                    value={playbackPauseSeconds}
                    onChange={(event) => {
                      const value = Number(event.target.value)
                      const next = Number.isFinite(value) ? value : 0
                      setPlaybackPauseSeconds(next)
                      persistSettings({ playbackPauseSeconds: next })
                    }}
                  />
                </div>

                <div className="pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-center"
                    onClick={() => setClearCacheOpen(true)}
                  >
                    {t("settings.clearCache")}
                  </Button>
                </div>

                <div className="pt-2">
                  <Button
                    type="button"
                    variant="destructive"
                    className="w-full justify-center"
                    onClick={() => {
                      setDeleteAccountOpen(true)
                    }}
                  >
                    {t("settings.deleteAccount")}
                  </Button>
                </div>

                <div className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-center"
                    onClick={() => {
                      signOutMutation
                        .mutateAsync()
                        .catch(() => {})
                        .finally(() => {
                          window.location.href = "/auth/login"
                        })
                    }}
                  >
                    {t("settings.signOut")}
                  </Button>
                </div>
              </div>
            </div>
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
      <div className="md:hidden sticky top-0 z-40 flex items-center justify-between border-b bg-background/95 px-4 py-3 backdrop-blur">
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center text-muted-foreground"
          onClick={() => setMobileMenuOpen(true)}
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
            <path d="M4 6h16" />
            <path d="M4 12h16" />
            <path d="M4 18h16" />
          </svg>
        </button>
        <div className="text-sm font-semibold">Sola</div>
        <div className="relative">
          <button
            ref={mobileSettingsButtonRef}
            type="button"
            className="flex h-9 w-9 items-center justify-center text-muted-foreground"
            onClick={() => {
              setSettingsOpen((prev) => !prev)
              setMobileMenuOpen(false)
            }}
            aria-label="Settings"
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
          </button>
          {settingsOpen ? (
            <div
              ref={mobileSettingsPanelRef}
              className="absolute right-0 top-12 w-[calc(100vw-2rem)] max-w-xs z-20 rounded-xl border bg-card shadow-[0_16px_40px_rgba(15,23,42,0.18)]"
            >
              <div className="px-4 py-3 text-sm font-semibold">{t("settings.title")}</div>
              <div className="space-y-3 border-t px-4 py-3 text-sm">
                <div className="flex items-center justify-between">
                  <span>{t("settings.darkMode")}</span>
                  <button
                    type="button"
                    className={cn(
                      "relative h-5 w-10 rounded-full transition",
                      darkMode ? "bg-primary" : "bg-muted"
                    )}
                    onClick={() => setDarkMode((prev) => !prev)}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 h-4 w-4 rounded-full bg-background shadow transition",
                        darkMode ? "left-5" : "left-1"
                      )}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span>{t("settings.aiSettings")}</span>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8"
                    onClick={() => setAiDialogOpen(true)}
                  >
                    {t("settings.aiSettings")}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <span>{t("settings.aiInstructions")}</span>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8"
                    onClick={() => setAiInstructionDialogOpen(true)}
                  >
                    {t("settings.aiInstructions")}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <span>{t("settings.uiLanguage")}</span>
                  <select
                    className="h-8 rounded-md border bg-background px-2 text-sm"
                    value={uiLanguage}
                    onChange={(event) => {
                      const value = event.target.value as LanguageOption
                      setUiLanguage(value)
                      persistSettings({ uiLanguage: value })
                      i18n.changeLanguage(value)
                      if (typeof window !== "undefined") {
                        localStorage.setItem("sola_ui_lang", value)
                      }
                    }}
                  >
                    {languages.map((lang) => (
                      <option key={lang.value} value={lang.value}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <span>{t("settings.languageSettings")}</span>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8"
                    onClick={() => setLanguageDialogOpen(true)}
                  >
                    {t("settings.languageSettings")}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <span>{t("settings.languagePriority")}</span>
                  <select
                    className="h-8 rounded-md border bg-background px-2 text-sm"
                    value={displayOrderSetting}
                    onChange={(event) => {
                      const value = event.target.value as DisplayOrder
                      setDisplayOrderSetting(value)
                      persistSettings({ displayOrder: value })
                    }}
                  >
                    <option value="native_first">{t("settings.nativeFirst")}</option>
                    <option value="target_first">{t("settings.targetFirst")}</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <span>{t("settings.shadowingConfig")}</span>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8"
                    onClick={() => setShadowingDialogOpen(true)}
                  >
                    {t("settings.shadowing")}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <span>{t("settings.playbackNativeRepeat")}</span>
                  <input
                    type="number"
                    min={0}
                    className="h-8 w-16 rounded-md border bg-background px-2 text-sm text-right"
                    value={playbackNativeRepeat}
                    onChange={(event) => {
                      const value = Number(event.target.value)
                      const next = Number.isFinite(value) ? value : 0
                      setPlaybackNativeRepeat(next)
                      persistSettings({ playbackNativeRepeat: next })
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span>{t("settings.playbackTargetRepeat")}</span>
                  <input
                    type="number"
                    min={0}
                    className="h-8 w-16 rounded-md border bg-background px-2 text-sm text-right"
                    value={playbackTargetRepeat}
                    onChange={(event) => {
                      const value = Number(event.target.value)
                      const next = Number.isFinite(value) ? value : 0
                      setPlaybackTargetRepeat(next)
                      persistSettings({ playbackTargetRepeat: next })
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span>{t("settings.playbackPauseSeconds")}</span>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    className="h-8 w-16 rounded-md border bg-background px-2 text-sm text-right"
                    value={playbackPauseSeconds}
                    onChange={(event) => {
                      const value = Number(event.target.value)
                      const next = Number.isFinite(value) ? value : 0
                      setPlaybackPauseSeconds(next)
                      persistSettings({ playbackPauseSeconds: next })
                    }}
                  />
                </div>

                <div className="pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-center"
                    onClick={() => setClearCacheOpen(true)}
                  >
                    {t("settings.clearCache")}
                  </Button>
                </div>

                <div className="pt-2">
                  <Button
                    type="button"
                    variant="destructive"
                    className="w-full justify-center"
                    onClick={() => {
                      setDeleteAccountOpen(true)
                    }}
                  >
                    {t("settings.deleteAccount")}
                  </Button>
                </div>

                <div className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-center"
                    onClick={() => {
                      signOutMutation
                        .mutateAsync()
                        .catch(() => {})
                        .finally(() => {
                          window.location.href = "/auth/login"
                        })
                    }}
                  >
                    {t("settings.signOut")}
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div
        className={cn(
          "md:hidden fixed inset-0 z-50 transition",
          mobileMenuOpen ? "visible" : "invisible"
        )}
      >
        <div
          className={cn(
            "absolute inset-0 bg-black/40 transition-opacity",
            mobileMenuOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setMobileMenuOpen(false)}
        />
        <div
          className={cn(
            "absolute inset-y-0 left-0 w-72 bg-card shadow-xl transition-transform",
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="text-sm font-semibold">Sola</div>
            <button
              type="button"
              className="text-sm text-muted-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Close
            </button>
          </div>
          <div className="flex h-full min-h-0 flex-col">{sidebarCore}</div>
        </div>
      </div>

      <div className="md:flex">
        <aside className="hidden md:flex md:w-72 md:flex-col md:border-r md:bg-muted/30 md:sticky md:top-0 md:h-screen md:overflow-hidden">
          <div className="h-16 px-5 flex items-center border-b">
            <div className="text-sm font-semibold tracking-wide">Sola</div>
          </div>
          <div className="flex min-h-0 flex-1 flex-col">{sidebarCore}</div>
        </aside>

        <section className="flex-1 min-w-0 px-4 md:px-12">
          <div className="min-h-[calc(100vh-4rem)] md:min-h-screen flex flex-col items-center py-10 md:py-16">
            <div className="w-full max-w-2xl space-y-8">
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
                  <div className="sticky top-0 z-30 -mx-4 md:-mx-12 mb-4 border-b bg-background/95 px-4 md:px-12 py-2 backdrop-blur">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        type="button"
                        variant={isLoopingAll ? "secondary" : "outline"}
                        aria-label={t("article.loopAll")}
                        onClick={() => {
                          if (isLoopingAll) stopLoopPlayback()
                          else startLoopAll()
                        }}
                      >
                        🔁
                      </Button>
                      <Button
                        type="button"
                        variant={isLoopingTarget ? "secondary" : "outline"}
                        aria-label={t("article.loopTarget")}
                        onClick={() => {
                          if (isLoopingTarget) stopLoopPlayback()
                          else startLoopTarget()
                        }}
                      >
                        🟠
                      </Button>
                      <Button
                        type="button"
                        variant={isLoopingSingle ? "secondary" : "outline"}
                        aria-label={t("article.loopSingle")}
                        onClick={() => {
                          if (isLoopingSingle) stopLoopPlayback()
                          else startLoopSingle()
                        }}
                      >
                        🔂
                      </Button>
                      <Button
                        type="button"
                        variant={isLoopingShadowing ? "secondary" : "outline"}
                        aria-label={t("article.shadowing")}
                        onClick={() => {
                          if (isLoopingShadowing) stopLoopPlayback()
                          else startLoopShadowing()
                        }}
                      >
                        🌫️
                      </Button>
                      <Button
                        type="button"
                        variant={isClozeEnabled ? "secondary" : "outline"}
                        aria-label={t("article.clozePractice")}
                        onClick={() => setIsClozeEnabled((prev) => !prev)}
                      >
                        🕳️
                      </Button>
                      <button
                        type="button"
                        className="flex items-center text-xs text-muted-foreground"
                        aria-label={t("article.randomMode")}
                        onClick={() => setIsRandomMode((prev) => !prev)}
                      >
                        <span
                          className={cn(
                            "relative h-7 w-12 rounded-full border transition",
                            isRandomMode ? "bg-primary/80" : "bg-muted"
                          )}
                        >
                          <span
                            className={cn(
                              "absolute top-0.5 h-6 w-6 rounded-full bg-background shadow transition",
                              isRandomMode ? "left-5" : "left-1"
                            )}
                          />
                        </span>
                      </button>
                      <button
                        type="button"
                        className="flex items-center text-xs text-muted-foreground"
                        aria-label={t("article.cardMode")}
                        onClick={() => setIsCardMode((prev) => !prev)}
                      >
                        <span
                          className={cn(
                            "relative h-7 w-12 rounded-full border transition",
                            isCardMode ? "bg-primary/80" : "bg-muted"
                          )}
                        >
                          <span
                            className={cn(
                              "absolute top-0.5 h-6 w-6 rounded-full bg-background shadow transition",
                              isCardMode ? "left-5" : "left-1"
                            )}
                          />
                        </span>
                      </button>
                      <button
                        type="button"
                        className={cn(
                          "relative h-8 w-12 rounded-full border transition",
                          blurTarget ? "bg-primary/80" : "bg-muted"
                        )}
                        onClick={() => setBlurTarget((prev) => !prev)}
                        aria-label={t("article.maskTarget")}
                      >
                        <span
                          className={cn(
                            "absolute top-1 h-6 w-6 rounded-full bg-background shadow transition",
                            blurTarget ? "left-5" : "left-1"
                          )}
                        />
                      </button>
                      <button
                        type="button"
                        className={cn(
                          "relative h-8 w-12 rounded-full border transition",
                          blurNative ? "bg-primary/80" : "bg-muted"
                        )}
                        onClick={() => setBlurNative((prev) => !prev)}
                        aria-label={t("article.maskNative")}
                      >
                        <span
                          className={cn(
                            "absolute top-1 h-6 w-6 rounded-full bg-background shadow transition",
                            blurNative ? "left-5" : "left-1"
                          )}
                        />
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                      {aiInstructionGroups.length === 0 ? (
                        <span className="text-xs text-muted-foreground">
                          {t("ai.noInstructions")}
                        </span>
                      ) : (
                        aiInstructionGroups.map(([type, items]) => (
                          <div
                            key={type}
                            className="flex flex-wrap items-center gap-1.5 rounded-full bg-muted/40 px-2 py-1"
                          >
                            <span className="text-[11px] font-medium text-muted-foreground">
                              {resolveInstructionLabel(
                                type as "translate" | "explain" | "custom"
                              )}
                            </span>
                            {items.map((instruction) => (
                              <Button
                                key={instruction.id}
                                type="button"
                                variant={
                                  aiProgress?.running &&
                                  aiProgress.instructionId === instruction.id
                                    ? "secondary"
                                    : "outline"
                                }
                                className="h-7 px-2 text-xs"
                                onClick={() => {
                                  startAiTranslation(instruction.id, false)
                                }}
                              >
                                {instruction.name}
                              </Button>
                            ))}
                          </div>
                        ))
                      )}
                      {aiProgress ? (
                        <span className="text-xs text-muted-foreground">
                          {t("ai.translationProgress", {
                            completed: aiProgress.completed,
                            total: aiProgress.total,
                          })}
                        </span>
                      ) : null}
                      {aiProgress?.running ? (
                        <Button
                          type="button"
                          variant="outline"
                          className="h-7 px-2 text-xs"
                          onClick={cancelAiTranslation}
                        >
                          {t("ai.cancel")}
                        </Button>
                      ) : null}
                      {!aiProgress?.running && missingNativeCount > 0 ? (
                        <Button
                          type="button"
                          variant="outline"
                          className="h-7 px-2 text-xs"
                          onClick={retryMissingTranslations}
                        >
                          {t("ai.retryMissing")}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                  <div className="space-y-4">
                    {detailQuery.data.sentences.length === 0 ? (
                      <Card>
                        <CardContent className="py-6 text-sm text-muted-foreground">
                          {t("article.noSentences")}
                        </CardContent>
                      </Card>
                    ) : isCardMode ? (
                      <div className="flex flex-col items-center gap-3">
                        <div
                          className="w-full max-w-xl"
                          onPointerDown={handleCardPointerDown}
                          onPointerMove={handleCardPointerMove}
                          onPointerUp={handleCardPointerUp}
                          onPointerCancel={handleCardPointerCancel}
                        >
                          <div
                            role="button"
                            tabIndex={0}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault()
                                setCardFlipped((prev) => !prev)
                              }
                            }}
                            className="group relative mx-auto h-56 w-full max-w-xl cursor-pointer select-none"
                            style={{ perspective: "1200px" }}
                          >
                            <div
                              className={cn(
                                "absolute inset-0 rounded-2xl border border-muted/30 bg-background shadow-[0_20px_60px_rgba(15,23,42,0.12)] transition-transform duration-500",
                                "flex items-center justify-center px-6 text-center text-xl font-semibold"
                              )}
                              style={{
                                backfaceVisibility: "hidden",
                                transform: `${
                                  cardFlipped ? "rotateY(180deg)" : "rotateY(0deg)"
                                } translateX(${cardDragX}px)`,
                                transitionDuration: cardDragging ? "0ms" : "500ms",
                              }}
                            >
                              {activeCardSentence?.[
                                cardFrontRole === "native" ? "nativeText" : "targetText"
                              ] ?? ""}
                            </div>
                            <div
                              className={cn(
                                "absolute inset-0 rounded-2xl border border-muted/30 bg-muted/30 shadow-[0_16px_40px_rgba(15,23,42,0.08)] transition-transform duration-500",
                                "flex items-center justify-center px-6 text-center text-xl font-semibold"
                              )}
                              style={{
                                backfaceVisibility: "hidden",
                                transform: `${
                                  cardFlipped ? "rotateY(0deg)" : "rotateY(-180deg)"
                                } translateX(${cardDragX}px)`,
                                transitionDuration: cardDragging ? "0ms" : "500ms",
                              }}
                            >
                              {activeCardSentence?.[
                                cardBackRole === "native" ? "nativeText" : "targetText"
                              ] ?? ""}
                            </div>
                            <button
                              type="button"
                              data-card-nav
                              aria-label={t("article.cardPrev")}
                              onClick={(event) => {
                                event.stopPropagation()
                                goCard(cardIndex - 1)
                              }}
                              className="absolute inset-y-0 left-0 flex items-center px-2 text-muted-foreground/60 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                              style={{ opacity: cardDragging ? 1 : undefined }}
                            >
                              ◀
                            </button>
                            <button
                              type="button"
                              data-card-nav
                              aria-label={t("article.cardNext")}
                              onClick={(event) => {
                                event.stopPropagation()
                                goCard(cardIndex + 1)
                              }}
                              className="absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground/60 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                              style={{ opacity: cardDragging ? 1 : undefined }}
                            >
                              ▶
                            </button>
                          </div>
                        </div>
                        <Button
                          type="button"
                          className="h-11 w-20 rounded-full text-lg"
                          aria-label={t("article.cardPlay")}
                          onClick={() => {
                            const sentence = activeCardSentence
                            if (!sentence) return
                            const role = cardFlipped ? cardBackRole : cardFrontRole
                            playCardAudio(sentence.id, role)
                          }}
                        >
                          ▶
                        </Button>
                        {!isRandomMode ? (
                          <div className="text-xs text-muted-foreground">
                            {cardIndex + 1}/{cardCount}
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      detailQuery.data.sentences.map((sentence) => {
                        const nativeFirst = displayOrderSetting === "native_first"
                        const items = [
                          { role: "native", text: sentence.nativeText ?? "" },
                          { role: "target", text: sentence.targetText ?? "" },
                        ] as const
                        const ordered = nativeFirst ? items : items.slice().reverse()

                        return (
                          <Card key={sentence.id} className="border-0 shadow-none">
                          <CardContent className="space-y-1.5 rounded-xl bg-muted/20 px-3 py-2 text-sm transition">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <button
                                type="button"
                                aria-label={t("article.editSentenceTitle")}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-transparent transition hover:bg-muted"
                                onClick={() => {
                                  stopLoopPlayback()
                                  setSentenceEditing({
                                    id: sentence.id,
                                    nativeText: sentence.nativeText ?? "",
                                    targetText: sentence.targetText ?? "",
                                  })
                                  setSentenceEditOpen(true)
                                }}
                              >
                                <svg
                                  aria-hidden="true"
                                  viewBox="0 0 24 24"
                                  className="h-4 w-4"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.7"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M12 20h9" />
                                  <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                aria-label={t("article.deleteSentenceTitle")}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-transparent transition hover:bg-muted"
                                onClick={() => {
                                  stopLoopPlayback()
                                  setSentenceDeleteId(sentence.id)
                                  setSentenceDeleteOpen(true)
                                }}
                              >
                                <svg
                                  aria-hidden="true"
                                  viewBox="0 0 24 24"
                                  className="h-4 w-4"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.7"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M3 6h18" />
                                  <path d="M8 6V4h8v2" />
                                  <path d="M19 6l-1 14H6L5 6" />
                                </svg>
                              </button>
                            </div>
                            {ordered.map((item) => {
                                if (!item.text) return null
                                const isPlaying =
                                  sentence.id === playingSentenceId &&
                                  playingRole === item.role
                                const isSelected =
                                  sentence.id === selectedSentenceId &&
                                  selectedSentenceRole === item.role
                                const isTarget = item.role === "target"
                                const isRevealed = clozeRevealed[sentence.id] === true
                                const clozeResult = clozeResults[sentence.id]
                                const shouldBlur =
                                  isTarget && isClozeEnabled
                                    ? !isRevealed
                                    : item.role === "target" && blurTarget
                                return (
                                  <div key={item.role} className="space-y-1">
                                    <div
                                      className={cn(
                                        "relative flex items-start gap-2 rounded-md border border-muted/20 px-2.5 py-1 text-base transition",
                                        isPlaying && "font-medium",
                                        isSelected &&
                                          "border-white/30 shadow-[0_1px_3px_rgba(15,23,42,0.05)] ring-1 ring-white/40"
                                      )}
                                      role="button"
                                      tabIndex={0}
                                      onClick={() => {
                                        stopLoopPlayback()
                                        setSelectedSentenceId(sentence.id)
                                        setSelectedSentenceRole(item.role)
                                        if (isTarget && isClozeEnabled) {
                                          setClozeRevealed((prev) => ({
                                            ...prev,
                                            [sentence.id]: !isRevealed,
                                          }))
                                          return
                                        }
                                        playSentenceRole(
                                          sentence,
                                          item.role as "native" | "target"
                                        )
                                          .then((ok) => {
                                            if (!ok) {
                                              toast.error(
                                                t("tts.audioPlayFailed")
                                              )
                                            }
                                          })
                                          .catch(() => {})
                                      }}
                                      onKeyDown={(event) => {
                                        if (event.key === "Enter" || event.key === " ") {
                                          event.preventDefault()
                                          stopLoopPlayback()
                                          setSelectedSentenceId(sentence.id)
                                          setSelectedSentenceRole(item.role)
                                          if (isTarget && isClozeEnabled) {
                                            setClozeRevealed((prev) => ({
                                              ...prev,
                                              [sentence.id]: !isRevealed,
                                            }))
                                            return
                                          }
                                          playSentenceRole(
                                            sentence,
                                            item.role as "native" | "target"
                                          )
                                            .then((ok) => {
                                              if (!ok) {
                                                toast.error(
                                                  t("tts.audioPlayFailed")
                                                )
                                              }
                                            })
                                            .catch(() => {})
                                        }
                                      }}
                                    >
                                      {isPlaying ? (
                                        <span className="absolute right-2 top-1 text-[11px] text-muted-foreground/80">
                                          {(playingSpeed ?? 1).toFixed(1)}×
                                        </span>
                                      ) : null}
                                      <span
                                        className={cn(
                                          "mt-1 h-3 w-1.5 rounded-full",
                                          item.role === "native"
                                            ? "bg-blue-500"
                                            : "bg-orange-500"
                                        )}
                                      />
                                      <span
                                        className={cn(
                                          "leading-relaxed",
                                          isPlaying &&
                                            (item.role === "native"
                                              ? "text-blue-600"
                                              : "text-orange-500"),
                                          item.role === "native" &&
                                            blurNative &&
                                            "blur-sm",
                                          shouldBlur && "blur-sm"
                                        )}
                                      >
                                        {item.text}
                                      </span>
                                    </div>
                                    {isTarget && isClozeEnabled ? (
                                      <div className="space-y-1 pl-4">
                                        <input
                                          className="h-9 w-full rounded-md border bg-background px-2 text-sm"
                                          placeholder={t("article.clozePlaceholder")}
                                          value={clozeInputs[sentence.id] ?? ""}
                                          style={{
                                            maxWidth: "100%",
                                            width: `${Math.max(
                                              8,
                                              sentence.targetText?.length ?? 8
                                            )}ch`,
                                          }}
                                          onChange={(event) => {
                                            const value = event.target.value
                                            setClozeInputs((prev) => ({
                                              ...prev,
                                              [sentence.id]: value,
                                            }))
                                            setClozeResults((prev) => {
                                              if (!prev[sentence.id]) return prev
                                              const next = { ...prev }
                                              delete next[sentence.id]
                                              return next
                                            })
                                          }}
                                          onKeyDown={(event) => {
                                            if (event.key === "Enter") {
                                              event.preventDefault()
                                              handleClozeCheck(sentence.id)
                                            }
                                          }}
                                        />
                                        {clozeResult ? (
                                          <div className="text-xs">
                                            {clozeResult.segments.map((segment, index) => {
                                                const isLast =
                                                  index === clozeResult.segments.length - 1
                                                const suffix = isLast ? "" : " "
                                                if (segment.kind === "same") {
                                                  return (
                                                    <span
                                                      key={`same-${index}`}
                                                      className="text-green-600"
                                                    >
                                                      {segment.text}
                                                      {suffix}
                                                    </span>
                                                  )
                                                }
                                                if (segment.kind === "extra") {
                                                  return (
                                                    <span
                                                      key={`extra-${index}`}
                                                      className="text-red-500 line-through"
                                                    >
                                                      {segment.text}
                                                      {suffix}
                                                    </span>
                                                  )
                                                }
                                                if (segment.kind === "missing") {
                                                  return (
                                                    <span
                                                      key={`missing-${index}`}
                                                      className="text-orange-500"
                                                    >
                                                      ({segment.text})
                                                      {suffix}
                                                    </span>
                                                  )
                                                }
                                                return (
                                                  <span
                                                    key={`mismatch-${index}`}
                                                    className="text-orange-500"
                                                  >
                                                    {segment.parts.map((part, partIndex) => {
                                                      if (part.type === "same") {
                                                        return (
                                                          <span
                                                            key={`part-same-${partIndex}`}
                                                            className="text-green-600"
                                                          >
                                                            {part.text}
                                                          </span>
                                                        )
                                                      }
                                                      if (part.type === "extra") {
                                                        return (
                                                          <span
                                                            key={`part-extra-${partIndex}`}
                                                            className="text-red-500 line-through"
                                                          >
                                                            {part.text}
                                                          </span>
                                                        )
                                                      }
                                                      return (
                                                        <span
                                                          key={`part-missing-${partIndex}`}
                                                          className="text-orange-500"
                                                        >
                                                          ({part.text})
                                                        </span>
                                                      )
                                                    })}
                                                    {suffix}
                                                  </span>
                                                )
                                              }
                                            )}
                                          </div>
                                        ) : null}
                                      </div>
                                    ) : null}
                                  </div>
                                )
                              })}
                            </CardContent>
                          </Card>
                        )
                      })
                    )}
                  </div>
                </div>
                  ) : (
                    <div className="text-center space-y-2">
                      <h1 className="text-3xl font-semibold">{t("article.heroTitle")}</h1>
                      <p className="text-sm text-muted-foreground">
                        {t("article.heroSubtitle")}
                  </p>
                </div>
              )}

              {showCreate ? (
                <>
                  <Card className="border-muted/60 shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
                    <CardContent className="p-5">
                  <div className="relative">
                        <textarea
                          ref={inputRef}
                          rows={7}
                          value={content}
                          onChange={(event) => setContent(event.target.value)}
                          placeholder={t("article.inputPlaceholder")}
                          className="w-full resize-none rounded-2xl border bg-background px-4 py-4 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                        <Button
                          type="button"
                          className="absolute bottom-3 right-3 h-10 w-10 rounded-full p-0"
                          disabled={!content.trim() || createMutation.isLoading}
                          onClick={handleCreate}
                        >
                          →
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {createMutation.isError ? (
                    <div className="text-center text-sm text-destructive">
                      {t("article.submitFailed")}
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>
          </div>
        </section>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("article.confirmDeleteTitle")}</DialogTitle>
            <DialogDescription>
              {t("article.confirmDeleteDesc", { count: deleteTargets.length })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {t("common.cancel")}
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteMutation.isLoading}
              onClick={() => {
                if (deleteTargets.length === 0) return
                deleteMutation.mutate({ articleIds: deleteTargets })
                setConfirmOpen(false)
              }}
            >
              {t("article.confirmDeleteAction")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={sentenceEditOpen}
        onOpenChange={(open) => {
          setSentenceEditOpen(open)
          if (!open) {
            setSentenceEditing(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("article.editSentenceTitle")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">
                {t("article.editSentenceNative")}
              </label>
              <textarea
                className="min-h-[80px] w-full rounded-md border bg-background px-2 py-1 text-sm"
                value={sentenceEditing?.nativeText ?? ""}
                onChange={(event) => {
                  const value = event.target.value
                  setSentenceEditing((prev) =>
                    prev ? { ...prev, nativeText: value } : prev
                  )
                }}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">
                {t("article.editSentenceTarget")}
              </label>
              <textarea
                className="min-h-[80px] w-full rounded-md border bg-background px-2 py-1 text-sm"
                value={sentenceEditing?.targetText ?? ""}
                onChange={(event) => {
                  const value = event.target.value
                  setSentenceEditing((prev) =>
                    prev ? { ...prev, targetText: value } : prev
                  )
                }}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <DialogClose asChild>
              <Button variant="outline">{t("common.cancel")}</Button>
            </DialogClose>
            <Button
              disabled={!sentenceEditing || updateSentenceMutation.isLoading}
              onClick={async () => {
                if (!sentenceEditing) return
                try {
                  const result = await updateSentenceMutation.mutateAsync({
                    sentenceId: sentenceEditing.id,
                    nativeText: sentenceEditing.nativeText,
                    targetText: sentenceEditing.targetText,
                  })
                  updateSentenceLocal(
                    result.sentenceId,
                    result.nativeText,
                    result.targetText
                  )
                  await clearSentenceCache(result.sentenceId)
                  toast.success(t("article.sentenceUpdateSuccess"))
                  setSentenceEditOpen(false)
                  setSentenceEditing(null)
                } catch {
                  toast.error(t("common.updateFailed"))
                }
              }}
            >
              {t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={sentenceDeleteOpen}
        onOpenChange={(open) => {
          setSentenceDeleteOpen(open)
          if (!open) {
            setSentenceDeleteId(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("article.deleteSentenceTitle")}</DialogTitle>
            <DialogDescription>{t("article.deleteSentenceDesc")}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <DialogClose asChild>
              <Button variant="outline">{t("common.cancel")}</Button>
            </DialogClose>
            <Button
              variant="destructive"
              disabled={!sentenceDeleteId || deleteSentenceMutation.isLoading}
              onClick={async () => {
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
              }}
            >
              {t("article.deleteSentenceConfirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteAccountOpen} onOpenChange={setDeleteAccountOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("settings.deleteAccountTitle")}</DialogTitle>
            <DialogDescription>
              {t("settings.deleteAccountDesc")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {t("common.cancel")}
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteAccountMutation.isLoading}
              onClick={() => {
                deleteAccountMutation
                  .mutateAsync()
                  .catch(() => {})
                  .finally(() => {
                    window.location.href = "/auth/login"
                  })
                setDeleteAccountOpen(false)
              }}
            >
              {t("settings.deleteAccountConfirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={languageDialogOpen} onOpenChange={setLanguageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("settings.languageSettings")}</DialogTitle>
            <DialogDescription>{t("settings.languageDialogDesc")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-sm">
            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted-foreground">
                {t("settings.nativeLanguage")}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  className="h-9 rounded-md border bg-background px-2 text-sm"
                  value={nativeLanguageSetting}
                  onChange={(event) => {
                    const value = event.target.value as LanguageOption
                    setNativeLanguageSetting(value)
                    persistSettings({ nativeLanguage: value })
                  }}
                >
                  {languages.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
                <select
                  className="h-9 min-w-[200px] rounded-md border bg-background px-2 text-sm"
                  value={nativeVoiceId ?? ""}
                  onChange={(event) => {
                    const value = event.target.value || null
                    setNativeVoiceId(value)
                    if (value && targetVoiceId) {
                      updateTtsVoices.mutate({
                        nativeVoiceId: value,
                        targetVoiceId,
                      })
                    }
                  }}
                >
                  <option value="" disabled>
                    {t("settings.voice")}
                  </option>
                  {ttsOptionsQuery.data?.nativeOptions.map((voice) => (
                    <option key={voice.id} value={voice.id}>
                      {(voice.gender === "Female"
                        ? t("settings.voiceFemale")
                        : voice.gender === "Male"
                          ? t("settings.voiceMale")
                          : t("settings.voice"))}{" "}
                      ·{" "}
                      {voice.name ?? voice.voiceId}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted-foreground">
                {t("settings.targetLanguage")}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  className="h-9 rounded-md border bg-background px-2 text-sm"
                  value={targetLanguageSetting}
                  onChange={(event) => {
                    const value = event.target.value as LanguageOption
                    setTargetLanguageSetting(value)
                    persistSettings({ targetLanguage: value })
                  }}
                >
                  {languages.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
                <select
                  className="h-9 min-w-[200px] rounded-md border bg-background px-2 text-sm"
                  value={targetVoiceId ?? ""}
                  onChange={(event) => {
                    const value = event.target.value || null
                    setTargetVoiceId(value)
                    if (nativeVoiceId && value) {
                      updateTtsVoices.mutate({
                        nativeVoiceId,
                        targetVoiceId: value,
                      })
                    }
                  }}
                >
                  <option value="" disabled>
                    {t("settings.voice")}
                  </option>
                  {ttsOptionsQuery.data?.targetOptions.map((voice) => (
                    <option key={voice.id} value={voice.id}>
                      {(voice.gender === "Female"
                        ? t("settings.voiceFemale")
                        : voice.gender === "Male"
                          ? t("settings.voiceMale")
                          : t("settings.voice"))}{" "}
                      ·{" "}
                      {voice.name ?? voice.voiceId}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {t("common.close")}
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("ai.settingsTitle")}</DialogTitle>
            <DialogDescription>{t("ai.settingsDesc")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-sm">
            <div className="space-y-2 rounded-md border px-3 py-2">
              <div className="text-xs font-semibold text-muted-foreground">
                {t("ai.quotaTitle")}
              </div>
              <div className="flex items-center gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={!useAiUserKey}
                    onChange={() => {
                      setUseAiUserKey(false)
                      persistSettings({ useAiUserKey: false })
                    }}
                  />
                  {t("ai.quotaPublic")}
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={useAiUserKey}
                    onChange={() => {
                      setUseAiUserKey(true)
                      persistSettings({ useAiUserKey: true })
                    }}
                  />
                  {t("ai.quotaPrivate")}
                </label>
              </div>
            </div>
            {aiProvidersDraft.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                {t("ai.noProviders")}
              </div>
            ) : (
              aiProvidersDraft.map((provider) => (
                <div
                  key={provider.id}
                  className={cn(
                    "rounded-lg border px-3 py-2 space-y-2",
                    provider.isDefault && "border-primary/60 bg-primary/5"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="text-sm font-semibold">
                        {(provider.providerType || (provider.name ?? "custom")) +
                          (provider.models.length > 0
                            ? ` · ${provider.models[0]}...`
                            : "")}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant={provider.isDefault ? "secondary" : "outline"}
                        className="h-7"
                        onClick={() => {
                          setAiProvidersDraft((prev) => {
                            const next = prev.map((item) => ({
                              ...item,
                              isDefault: item.id === provider.id,
                            }))
                            return [...next].sort(
                              (a, b) => Number(b.isDefault) - Number(a.isDefault)
                            )
                          })
                        }}
                      >
                        {provider.isDefault ? t("common.default") : t("ai.setDefault")}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-7"
                        onClick={() => {
                          setAiProviderEditing({ ...provider })
                          setAiProviderEditModels(provider.models.join(", "))
                          setAiProviderEditKeyVisible(false)
                          setAiProviderEditOpen(true)
                        }}
                      >
                        {t("common.edit")}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-7"
                        onClick={() => setAiProviderDeleteId(provider.id)}
                      >
                        {t("common.delete")}
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-9"
                onClick={() => setAiProviderResetOpen(true)}
              >
                {t("ai.resetToDefault")}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-9"
                onClick={() => setAiProviderAddOpen(true)}
              >
                {t("ai.addCustomProvider")}
              </Button>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {t("common.cancel")}
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button
                type="button"
                onClick={async () => {
                  if (aiProvidersDraft.length === 0) return
                  const defaultProvider = aiProvidersDraft.find((item) => item.isDefault)
                  if (defaultProvider) {
                    await updateAiProviderDefault.mutateAsync({
                      id: defaultProvider.id,
                    })
                  }
                  for (const provider of aiProvidersDraft) {
                    const models = provider.models
                      .map((value) => value.trim())
                      .filter(Boolean)
                    await updateAiProviderConfig.mutateAsync({
                      id: provider.id,
                      apiUrl: provider.apiUrl.trim(),
                      enabled: provider.enabled,
                      models,
                      apiKey: useAiUserKey ? provider.apiKey ?? "" : null,
                    })
                  }
                  await aiProvidersQuery.refetch()
                }}
              >
                {t("common.save")}
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={aiProviderAddOpen} onOpenChange={setAiProviderAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("ai.addCustomTitle")}</DialogTitle>
            <DialogDescription>{t("ai.addCustomDesc")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 text-sm">
            <input
              className="h-9 rounded-md border bg-background px-2 text-sm"
              placeholder={t("ai.providerNamePlaceholder")}
              value={newAiProviderName}
              onChange={(event) => setNewAiProviderName(event.target.value)}
            />
            <select
              className="h-9 rounded-md border bg-background px-2 text-sm"
              value={newAiProviderType}
              onChange={(event) =>
                setNewAiProviderType(event.target.value as AiProviderType)
              }
            >
              {["volcengine", "qwen", "openai", "gemini", "aihubmix"].map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <input
              className="h-9 rounded-md border bg-background px-2 text-sm"
              placeholder="Base URL"
              value={newAiProviderApiUrl}
              onChange={(event) => setNewAiProviderApiUrl(event.target.value)}
            />
            {useAiUserKey ? (
              <div className="flex items-center gap-2">
                <input
                  className="h-9 flex-1 rounded-md border bg-background px-2 text-sm"
                  placeholder="API Key"
                  type={newAiProviderKeyVisible ? "text" : "password"}
                  value={newAiProviderApiKey}
                  onChange={(event) => setNewAiProviderApiKey(event.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="h-9"
                  onClick={() => setNewAiProviderKeyVisible((prev) => !prev)}
                >
                  {newAiProviderKeyVisible ? t("common.hide") : t("common.show")}
                </Button>
              </div>
            ) : null}
            <input
              className="h-9 rounded-md border bg-background px-2 text-sm"
              placeholder={t("ai.modelsPlaceholder")}
              value={newAiProviderModels}
              onChange={(event) => setNewAiProviderModels(event.target.value)}
            />
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={newAiProviderEnabled}
                onChange={(event) => setNewAiProviderEnabled(event.target.checked)}
              />
              {t("common.enabled")}
            </label>
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {t("common.cancel")}
              </Button>
            </DialogClose>
            <Button
              type="button"
              onClick={async () => {
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
                  const message =
                    error instanceof Error ? error.message : t("ai.addCustomFailed")
                  toast.error(message)
                }
              }}
            >
              {t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={aiProviderEditOpen} onOpenChange={setAiProviderEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("ai.editProviderTitle")}</DialogTitle>
            <DialogDescription>{t("ai.editProviderDesc")}</DialogDescription>
          </DialogHeader>
          {aiProviderEditing ? (
            <div className="grid gap-3 text-sm">
              <input
                className="h-9 rounded-md border bg-background px-2 text-sm"
                placeholder={t("ai.providerNamePlaceholder")}
                value={aiProviderEditing.name ?? ""}
                disabled={aiProviderEditing.isPublic}
                onChange={(event) =>
                  setAiProviderEditing((prev) =>
                    prev
                      ? {
                          ...prev,
                          name: event.target.value,
                        }
                      : prev
                  )
                }
              />
              <input
                className="h-9 rounded-md border bg-background px-2 text-sm"
                value={aiProviderEditing.providerType}
                disabled
              />
              <input
                className="h-9 rounded-md border bg-background px-2 text-sm"
                placeholder="Base URL"
                value={aiProviderEditing.apiUrl}
                onChange={(event) =>
                  setAiProviderEditing((prev) =>
                    prev ? { ...prev, apiUrl: event.target.value } : prev
                  )
                }
              />
              {useAiUserKey ? (
                <div className="flex items-center gap-2">
                  <input
                    className="h-9 flex-1 rounded-md border bg-background px-2 text-sm"
                    placeholder="API Key"
                    type={aiProviderEditKeyVisible ? "text" : "password"}
                    value={aiProviderEditing.apiKey ?? ""}
                    onChange={(event) =>
                      setAiProviderEditing((prev) =>
                        prev ? { ...prev, apiKey: event.target.value } : prev
                      )
                    }
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9"
                    onClick={() => setAiProviderEditKeyVisible((prev) => !prev)}
                  >
                    {aiProviderEditKeyVisible ? t("common.hide") : t("common.show")}
                  </Button>
                </div>
              ) : null}
              <input
                className="h-9 rounded-md border bg-background px-2 text-sm"
                placeholder={t("ai.modelsPlaceholder")}
                value={aiProviderEditModels}
                onChange={(event) => setAiProviderEditModels(event.target.value)}
              />
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={aiProviderEditing.enabled}
                  onChange={(event) =>
                    setAiProviderEditing((prev) =>
                      prev ? { ...prev, enabled: event.target.checked } : prev
                    )
                  }
                />
                {t("common.enabled")}
              </label>
            </div>
          ) : null}
          <DialogFooter className="gap-2 sm:gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {t("common.cancel")}
              </Button>
            </DialogClose>
            <Button
              type="button"
              onClick={async () => {
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
                    name: aiProviderEditing.isPublic
                      ? undefined
                      : aiProviderEditing.name ?? "",
                    models,
                    enabled: aiProviderEditing.enabled,
                    apiKey: useAiUserKey ? aiProviderEditing.apiKey ?? "" : null,
                  })
                  await aiProvidersQuery.refetch()
                  setAiProviderEditOpen(false)
                  setAiProviderEditing(null)
                  toast.success(t("ai.editProviderSuccess"))
                } catch (error) {
                  const message =
                    error instanceof Error ? error.message : t("common.updateFailed")
                  toast.error(message)
                }
              }}
            >
              {t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(aiProviderDeleteId)} onOpenChange={() => setAiProviderDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("ai.deleteProviderTitle")}</DialogTitle>
            <DialogDescription>{t("ai.deleteProviderDesc")}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {t("common.cancel")}
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              onClick={async () => {
                if (!aiProviderDeleteId) return
                try {
                  await deleteAiProvider.mutateAsync({ id: aiProviderDeleteId })
                  await aiProvidersQuery.refetch()
                  setAiProviderDeleteId(null)
                  toast.success(t("ai.deleteProviderSuccess"))
                } catch (error) {
                  const message =
                    error instanceof Error ? error.message : t("common.deleteFailed")
                  toast.error(message)
                }
              }}
            >
              {t("common.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={aiProviderResetOpen} onOpenChange={setAiProviderResetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("ai.resetTitle")}</DialogTitle>
            <DialogDescription>{t("ai.resetDesc")}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {t("common.cancel")}
              </Button>
            </DialogClose>
            <Button
              type="button"
              onClick={async () => {
                try {
                  await resetAiProvidersToPublic.mutateAsync({ confirm: true })
                  await aiProvidersQuery.refetch()
                  setAiProviderResetOpen(false)
                  toast.success(t("ai.resetSuccess"))
                } catch (error) {
                  const message =
                    error instanceof Error ? error.message : t("ai.resetFailed")
                  toast.error(message)
                }
              }}
            >
              {t("ai.resetConfirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={aiInstructionDialogOpen} onOpenChange={setAiInstructionDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("ai.instructionsTitle")}</DialogTitle>
            <DialogDescription>{t("ai.instructionsDesc")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-sm">
            <div className="space-y-2">
              {aiInstructionDrafts.length === 0 ? (
                <div className="text-muted-foreground">{t("ai.noInstructions")}</div>
              ) : (
                aiInstructionDrafts
                  .slice()
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((instruction) => (
                    <div
                      key={instruction.id}
                      className="flex items-center justify-between rounded-md border px-3 py-2"
                    >
                      <div className="space-y-1">
                        <div className="text-sm font-semibold">{instruction.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {instruction.instructionType}
                          {instruction.isDefault ? ` · ${t("common.default")}` : ""}
                          {!instruction.enabled ? ` · ${t("common.disabled")}` : ""}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="h-7"
                          onClick={() => {
                            setAiInstructionEditing({ ...instruction })
                            setAiInstructionEditOpen(true)
                          }}
                        >
                          {t("common.edit")}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="h-7"
                          onClick={() => {
                            setAiInstructionDeleteId(instruction.id)
                            setAiInstructionDeleteOpen(true)
                          }}
                        >
                          {t("common.delete")}
                        </Button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

          <DialogFooter className="justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setAiInstructionAddOpen(true)}
            >
              {t("common.add")}
            </Button>
            <DialogClose asChild>
              <Button type="button">{t("common.close")}</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={aiInstructionEditOpen} onOpenChange={setAiInstructionEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("ai.editInstructionTitle")}</DialogTitle>
          </DialogHeader>

          {aiInstructionEditing ? (
            <div className="space-y-3 text-sm">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">
                  {t("ai.instructionName")}
                </label>
                <input
                  className="h-9 w-full rounded-md border bg-background px-2 text-sm"
                  value={aiInstructionEditing.name}
                  onChange={(event) =>
                    setAiInstructionEditing((prev) =>
                      prev ? { ...prev, name: event.target.value } : prev
                    )
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">
                  {t("ai.instructionType")}
                </label>
                <select
                  className="h-9 w-full rounded-md border bg-background px-2 text-sm"
                  value={aiInstructionEditing.instructionType}
                  onChange={(event) =>
                    setAiInstructionEditing((prev) =>
                      prev
                        ? {
                            ...prev,
                            instructionType: event.target.value as
                              | "translate"
                              | "explain"
                              | "custom",
                          }
                        : prev
                    )
                  }
                >
                  <option value="translate">translate</option>
                  <option value="explain">explain</option>
                  <option value="custom">custom</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">
                  {t("ai.provider")}
                </label>
                <select
                  className="h-9 w-full rounded-md border bg-background px-2 text-sm"
                  value={
                    aiInstructionEditing.userAiProviderId ??
                    aiProvidersQuery.data?.find((item) => item.isDefault)?.id ??
                    ""
                  }
                  onChange={(event) =>
                    setAiInstructionEditing((prev) =>
                      prev
                        ? {
                            ...prev,
                            userAiProviderId: event.target.value || null,
                          }
                        : prev
                    )
                  }
                >
                  <option value="">{t("ai.defaultProvider")}</option>
                  {aiProvidersQuery.data?.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.providerType}
                      {item.isDefault ? `(${t("common.default")})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">{t("ai.model")}</label>
                <select
                  className="h-9 w-full rounded-md border bg-background px-2 text-sm"
                  value={aiInstructionEditing.model ?? ""}
                  onChange={(event) =>
                    setAiInstructionEditing((prev) =>
                      prev
                        ? {
                            ...prev,
                            model: event.target.value || null,
                          }
                        : prev
                    )
                  }
                >
                  <option value="">{t("ai.modelAuto")}</option>
                  {resolveProviderModels(
                    aiInstructionEditing.userAiProviderId ??
                      aiProvidersQuery.data?.find((item) => item.isDefault)?.id ??
                      null
                  ).map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">
                  {t("ai.systemPrompt")}
                </label>
                <textarea
                  rows={3}
                  className="w-full rounded-md border bg-background px-2 py-1 text-xs"
                  value={aiInstructionEditing.systemPrompt}
                  onChange={(event) =>
                    setAiInstructionEditing((prev) =>
                      prev ? { ...prev, systemPrompt: event.target.value } : prev
                    )
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">
                  {t("ai.userPrompt")}
                </label>
                <textarea
                  rows={3}
                  className="w-full rounded-md border bg-background px-2 py-1 text-xs"
                  value={aiInstructionEditing.userPromptTemplate}
                  onChange={(event) =>
                    setAiInstructionEditing((prev) =>
                      prev ? { ...prev, userPromptTemplate: event.target.value } : prev
                    )
                  }
                />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">
                    {t("ai.inputSchema")}
                  </label>
                  <textarea
                    rows={3}
                    className="w-full rounded-md border bg-background px-2 py-1 text-xs"
                    value={aiInstructionEditing.inputSchemaJson ?? ""}
                    onChange={(event) =>
                      setAiInstructionEditing((prev) =>
                        prev ? { ...prev, inputSchemaJson: event.target.value } : prev
                      )
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">
                    {t("ai.outputSchema")}
                  </label>
                  <textarea
                    rows={3}
                    className="w-full rounded-md border bg-background px-2 py-1 text-xs"
                    value={aiInstructionEditing.outputSchemaJson ?? ""}
                    onChange={(event) =>
                      setAiInstructionEditing((prev) =>
                        prev ? { ...prev, outputSchemaJson: event.target.value } : prev
                      )
                    }
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={aiInstructionEditing.isDefault}
                    onChange={(event) =>
                      setAiInstructionEditing((prev) =>
                        prev ? { ...prev, isDefault: event.target.checked } : prev
                      )
                    }
                  />
                  {t("ai.defaultInstruction")}
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={aiInstructionEditing.enabled}
                    onChange={(event) =>
                      setAiInstructionEditing((prev) =>
                        prev ? { ...prev, enabled: event.target.checked } : prev
                      )
                    }
                  />
                  {t("common.enabled")}
                </label>
              </div>
            </div>
          ) : null}

          <DialogFooter className="gap-2 sm:gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {t("common.cancel")}
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button
                type="button"
                onClick={async () => {
                  if (!aiInstructionEditing) return
                  await updateUserAiInstruction.mutateAsync({
                    ...aiInstructionEditing,
                    inputSchemaJson: aiInstructionEditing.inputSchemaJson || null,
                    outputSchemaJson: aiInstructionEditing.outputSchemaJson || null,
                  })
                  await aiInstructionQuery.refetch()
                }}
              >
                {t("common.save")}
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={aiInstructionAddOpen} onOpenChange={setAiInstructionAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("ai.addInstructionTitle")}</DialogTitle>
            <DialogDescription>{t("ai.addInstructionDesc")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-2 text-sm">
            {publicAiInstructions.length === 0 ? (
              <div className="text-muted-foreground">{t("ai.noPublicInstructions")}</div>
            ) : (
              <>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">
                    {t("ai.provider")}
                  </label>
                  <select
                    className="h-9 w-full rounded-md border bg-background px-2 text-sm"
                    value={aiInstructionAddProviderId ?? ""}
                    onChange={(event) => {
                      setAiInstructionAddProviderId(event.target.value || null)
                    }}
                  >
                    <option value="">{t("ai.defaultProvider")}</option>
                    {aiProvidersQuery.data?.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.providerType}
                        {item.isDefault ? `(${t("common.default")})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">{t("ai.model")}</label>
                  <select
                    className="h-9 w-full rounded-md border bg-background px-2 text-sm"
                    value={aiInstructionAddModel ?? ""}
                    onChange={(event) => {
                      setAiInstructionAddModel(event.target.value || null)
                    }}
                  >
                    <option value="">{t("ai.modelAuto")}</option>
                    {resolveProviderModels(
                      aiInstructionAddProviderId ??
                        aiProvidersQuery.data?.find((item) => item.isDefault)?.id ??
                        null
                    ).map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  {publicAiInstructions
                    .slice()
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((instruction) => (
                  <div
                    key={instruction.id}
                    className="flex items-center justify-between rounded-md border px-3 py-2"
                  >
                    <div>
                      <div className="font-semibold">{instruction.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {instruction.instructionType}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-7"
                      onClick={async () => {
                        await createUserAiInstructionFromPublic.mutateAsync({
                          publicAiInstructionId: instruction.id,
                          userAiProviderId: aiInstructionAddProviderId ?? null,
                          model: aiInstructionAddModel ?? null,
                        })
                        await aiInstructionQuery.refetch()
                        setAiInstructionAddOpen(false)
                      }}
                    >
                      {t("common.add")}
                    </Button>
                  </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {t("common.close")}
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={aiInstructionDeleteOpen} onOpenChange={setAiInstructionDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("ai.deleteInstructionTitle")}</DialogTitle>
            <DialogDescription>{t("ai.deleteInstructionDesc")}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {t("common.cancel")}
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button
                type="button"
                variant="destructive"
                onClick={async () => {
                  if (!aiInstructionDeleteId) return
                  await deleteUserAiInstruction.mutateAsync({
                    id: aiInstructionDeleteId,
                  })
                  setAiInstructionDeleteId(null)
                  await aiInstructionQuery.refetch()
                }}
              >
                {t("common.delete")}
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={shadowingDialogOpen} onOpenChange={setShadowingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("shadowing.title")}</DialogTitle>
            <DialogDescription>{t("shadowing.desc")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <span>{t("shadowing.label")}</span>
              <button
                type="button"
                className={cn(
                  "relative h-5 w-10 rounded-full transition",
                  shadowingDraftEnabled ? "bg-primary" : "bg-muted"
                )}
                onClick={() => setShadowingDraftEnabled((prev) => !prev)}
              >
                <span
                  className={cn(
                    "absolute top-0.5 h-4 w-4 rounded-full bg-background shadow transition",
                    shadowingDraftEnabled ? "left-5" : "left-1"
                  )}
                />
              </button>
            </div>

            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">
                {t("shadowing.speedList")}
              </div>
              {shadowingDraftSpeeds.map((speed, index) => (
                <div key={`${speed}-${index}`} className="flex items-center gap-2">
                  <input
                    type="number"
                    step={0.1}
                    min={0.1}
                    max={2}
                    className="h-9 w-24 rounded-md border bg-background px-2 text-sm"
                    value={speed}
                    onChange={(event) => {
                      const value = Number(event.target.value)
                      setShadowingDraftSpeeds((prev) => {
                        const next = [...prev]
                        next[index] = Number.isFinite(value) ? value : 0
                        return next
                      })
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 w-9 p-0"
                    onClick={() =>
                      setShadowingDraftSpeeds((prev) =>
                        prev.filter((_, itemIndex) => itemIndex !== index)
                      )
                    }
                  >
                    —
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                className="h-9 w-full justify-center"
                onClick={() => {
                  setShadowingDraftSpeeds((prev) => {
                    const base = prev[prev.length - 1] ?? 0.2
                    const next = Math.round((base + 0.2) * 10) / 10
                    return [...prev, next]
                  })
                }}
              >
                + {t("shadowing.addSpeed")}
              </Button>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {t("common.cancel")}
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button
                type="button"
                onClick={() => {
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
                }}
              >
                OK
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={clearCacheOpen} onOpenChange={setClearCacheOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("settings.clearCacheTitle")}</DialogTitle>
            <DialogDescription>{t("settings.clearCacheDesc")}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {t("common.cancel")}
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button
                type="button"
                onClick={() => {
                  clearTtsCache().catch(() => {})
                }}
              >
                {t("common.confirm")}
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
