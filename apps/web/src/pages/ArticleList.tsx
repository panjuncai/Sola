import * as React from "react"

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

import { trpc } from "@/lib/trpc"
import { useArticleStore } from "@/stores/useArticleStore"
import { useAuthStore } from "@/stores/useAuthStore"

function deriveTitle(content: string) {
  return content.trim().slice(0, 10)
}

export function ArticleList() {
  const articles = useArticleStore((state) => state.articles)
  const setArticles = useArticleStore((state) => state.setArticles)
  const listQuery = trpc.article.list.useQuery()
  const utils = trpc.useUtils()

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

  const settingsQuery = trpc.user.getSettings.useQuery()
  const updateSettings = trpc.user.updateSettings.useMutation()
  const [uiLanguage, setUiLanguage] = React.useState("zh-CN")
  const [nativeLanguageSetting, setNativeLanguageSetting] = React.useState("zh-CN")
  const [targetLanguageSetting, setTargetLanguageSetting] = React.useState("en-US")
  const [displayOrderSetting, setDisplayOrderSetting] = React.useState("native_first")
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
  const [newAiProviderType, setNewAiProviderType] = React.useState("openai")
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
  const [aiProviderEditModels, setAiProviderEditModels] = React.useState("")
  const [aiProviderResetOpen, setAiProviderResetOpen] = React.useState(false)
  const [publicAiInstructions, setPublicAiInstructions] = React.useState<
    {
      id: string
      name: string
      instructionType: "translate" | "explain" | "custom"
      systemPrompt: string
      userPromptTemplate: string
      inputSchemaJson: string | null
      outputSchemaJson: string | null
      enabled: boolean
      isDefault: boolean
    }[]
  >([])
  const userId = useAuthStore((state) => state.user?.id ?? null)
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
  const deleteAccountMutation = trpc.user.deleteAccount.useMutation()
  const signOutMutation = trpc.auth.signOut.useMutation()
  const sentenceAudioMutation = trpc.tts.getSentenceAudio.useMutation()

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
        [...aiInstructionQuery.data].sort((a, b) => a.name.localeCompare(b.name))
      )
    }
    if (publicAiInstructionQuery.data) {
      setPublicAiInstructions(publicAiInstructionQuery.data)
    }
    setAiInstructionAddProviderId(
      aiProvidersQuery.data?.find((item) => item.isDefault)?.id ?? null
    )
  }, [aiInstructionDialogOpen, aiInstructionQuery.data, publicAiInstructionQuery.data])

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
    { value: "zh-CN", label: "中文" },
    { value: "en-US", label: "English" },
    { value: "fr-FR", label: "Français" },
  ]

  const persistSettings = (next?: Partial<{
    uiLanguage: string
    nativeLanguage: string
    targetLanguage: string
    displayOrder: string
    playbackNativeRepeat: number
    playbackTargetRepeat: number
    playbackPauseSeconds: number
    useAiUserKey: boolean
    shadowing: { enabled: boolean; speeds: number[] }
  }>) => {
    if (!settingsQuery.data) return
    const payload = {
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

  const persistTtsCache = () => {
    try {
      window.localStorage.setItem(
        "sola-tts-cache",
        JSON.stringify(ttsCacheRef.current)
      )
    } catch {
      // ignore quota errors
    }
  }

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
    toast.success("已清理本地音频缓存")
  }

  const getCachedAudioUrl = (cacheKey: string) => {
    const cached = ttsCacheRef.current[cacheKey]
    if (!cached) return undefined
    if (cached.startsWith("/")) {
      const upgraded = `${apiBaseUrl}${cached}`
      ttsCacheRef.current[cacheKey] = upgraded
      persistTtsCache()
      return upgraded
    }
    return cached
  }
  const setCachedAudioUrl = (cacheKey: string, url: string) => {
    ttsCacheRef.current[cacheKey] = url
    persistTtsCache()
  }

  const resolveVoiceId = (role: "native" | "target") => {
    const data = ttsOptionsQuery.data
    if (!data) return null
    const selectedId = role === "native" ? nativeVoiceId : targetVoiceId
    const options = role === "native" ? data.nativeOptions : data.targetOptions
    const match = options.find((voice) => voice.id === selectedId)
    return match?.voiceId ?? null
  }

  const buildLocalCacheKey = (
    sentenceId: string,
    role: "native" | "target",
    speed?: number
  ) => {
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
  }

  const playSentenceRole = async (
    sentence: (typeof detailQuery.data)["sentences"][number],
    role: "native" | "target",
    speed?: number
  ) => {
    const text = role === "native" ? sentence.nativeText ?? "" : sentence.targetText ?? ""
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
  }

  const playAudioUrl = async (url: string) => {
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
  }

  const waitMs = (ms: number) =>
    new Promise<void>((resolve) => {
      if (!ms) return resolve()
      setTimeout(resolve, ms)
    })

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
              toast.error("音频播放失败，请检查 TTS 配置或音频路径。")
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
            toast.error("音频播放失败，请检查 TTS 配置或音频路径。")
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
            toast.error("音频播放失败，请检查 TTS 配置或音频路径。")
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
      toast.error("请先选择要循环的句子。")
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
          toast.error("音频播放失败，请检查 TTS 配置或音频路径。")
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
        toast.error("音频播放失败，请检查 TTS 配置或音频路径。")
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
          + 新增文章
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
          批量删除
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {listQuery.isLoading ? (
          <div className="text-sm text-muted-foreground">加载中...</div>
        ) : listQuery.isError ? (
          <div className="text-sm text-muted-foreground">加载失败</div>
        ) : articles.length === 0 ? (
          <div className="text-sm text-muted-foreground">暂无文章</div>
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
                {article.title ?? "未命名"}
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
              <div className="px-4 py-3 text-sm font-semibold">设置</div>
              <div className="space-y-3 border-t px-4 py-3 text-sm">
                <div className="flex items-center justify-between">
                  <span>暗黑模式</span>
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
                  <span>AI 设置</span>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8"
                    onClick={() => setAiDialogOpen(true)}
                  >
                    AI 设置
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <span>AI 指令</span>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8"
                    onClick={() => setAiInstructionDialogOpen(true)}
                  >
                    AI 指令
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <span>UI 语言</span>
                  <select
                    className="h-8 rounded-md border bg-background px-2 text-sm"
                    value={uiLanguage}
                    onChange={(event) => {
                      const value = event.target.value
                      setUiLanguage(value)
                      persistSettings({ uiLanguage: value })
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
                  <span>语言设置</span>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8"
                    onClick={() => setLanguageDialogOpen(true)}
                  >
                    语言设置
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <span>语言优先级</span>
                  <select
                    className="h-8 rounded-md border bg-background px-2 text-sm"
                    value={displayOrderSetting}
                    onChange={(event) => {
                      const value = event.target.value
                      setDisplayOrderSetting(value)
                      persistSettings({ displayOrder: value })
                    }}
                  >
                    <option value="native_first">母语优先</option>
                    <option value="target_first">外语优先</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <span>影子跟读配置</span>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8"
                    onClick={() => setShadowingDialogOpen(true)}
                  >
                    影子跟读
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <span>自动母语次数</span>
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
                  <span>自动外语次数</span>
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
                  <span>自动发音间隔 (s)</span>
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
                    清理音频缓存
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
                    注销账号
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
                    登出
                  </Button>
                </div>
              </div>
            </div>
          ) : null}

          <button
            ref={settingsButtonRef}
            type="button"
            className="text-sm font-medium text-muted-foreground"
            onClick={() => {
              setSettingsOpen((prev) => !prev)
              setMobileMenuOpen(false)
            }}
          >
            Settings
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
              <div className="px-4 py-3 text-sm font-semibold">设置</div>
              <div className="space-y-3 border-t px-4 py-3 text-sm">
                <div className="flex items-center justify-between">
                  <span>暗黑模式</span>
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
                  <span>AI 设置</span>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8"
                    onClick={() => setAiDialogOpen(true)}
                  >
                    AI 设置
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <span>AI 指令</span>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8"
                    onClick={() => setAiInstructionDialogOpen(true)}
                  >
                    AI 指令
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <span>UI 语言</span>
                  <select
                    className="h-8 rounded-md border bg-background px-2 text-sm"
                    value={uiLanguage}
                    onChange={(event) => {
                      const value = event.target.value
                      setUiLanguage(value)
                      persistSettings({ uiLanguage: value })
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
                  <span>语言设置</span>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8"
                    onClick={() => setLanguageDialogOpen(true)}
                  >
                    语言设置
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <span>语言优先级</span>
                  <select
                    className="h-8 rounded-md border bg-background px-2 text-sm"
                    value={displayOrderSetting}
                    onChange={(event) => {
                      const value = event.target.value
                      setDisplayOrderSetting(value)
                      persistSettings({ displayOrder: value })
                    }}
                  >
                    <option value="native_first">母语优先</option>
                    <option value="target_first">外语优先</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <span>影子跟读配置</span>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8"
                    onClick={() => setShadowingDialogOpen(true)}
                  >
                    影子跟读
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <span>自动母语次数</span>
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
                  <span>自动外语次数</span>
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
                  <span>自动发音间隔 (s)</span>
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
                    清理音频缓存
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
                    注销账号
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
                    登出
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
          <div className="flex h-full flex-col">{sidebarCore}</div>
        </div>
      </div>

      <div className="md:flex">
        <aside className="hidden md:flex md:w-72 md:flex-col md:border-r md:bg-muted/30 md:min-h-screen md:sticky md:top-0">
          <div className="h-16 px-5 flex items-center border-b">
            <div className="text-sm font-semibold tracking-wide">Sola</div>
          </div>
          <div className="flex h-full flex-col">{sidebarCore}</div>
        </aside>

        <section className="flex-1 min-w-0 px-4 md:px-12">
          <div className="min-h-[calc(100vh-4rem)] md:min-h-screen flex flex-col items-center py-10 md:py-16">
            <div className="w-full max-w-2xl space-y-8">
              {showCreate ? (
                <div className="text-center space-y-2">
                  <h1 className="text-3xl font-semibold">今天想背点什么？</h1>
                  <p className="text-sm text-muted-foreground">
                    输入外语文章，系统会自动切分为句子。
                  </p>
                </div>
              ) : detailQuery.isLoading ? (
                <div className="text-sm text-muted-foreground">加载文章中...</div>
              ) : detailQuery.data ? (
                <div className="space-y-4">
                  <div className="sticky top-0 z-30 -mx-4 md:-mx-12 mb-4 border-b bg-background/95 px-4 md:px-12 py-2 backdrop-blur">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        type="button"
                        variant={isLoopingAll ? "secondary" : "outline"}
                        onClick={() => {
                          if (isLoopingAll) stopLoopPlayback()
                          else startLoopAll()
                        }}
                      >
                        🔁 全文循环
                      </Button>
                      <Button
                        type="button"
                        variant={isLoopingTarget ? "secondary" : "outline"}
                        onClick={() => {
                          if (isLoopingTarget) stopLoopPlayback()
                          else startLoopTarget()
                        }}
                      >
                        🟠 外语循环
                      </Button>
                      <Button
                        type="button"
                        variant={isLoopingSingle ? "secondary" : "outline"}
                        onClick={() => {
                          if (isLoopingSingle) stopLoopPlayback()
                          else startLoopSingle()
                        }}
                      >
                        🔂 单句循环
                      </Button>
                      <Button
                        type="button"
                        variant={isLoopingShadowing ? "secondary" : "outline"}
                        onClick={() => {
                          if (isLoopingShadowing) stopLoopPlayback()
                          else startLoopShadowing()
                        }}
                      >
                        🌫️ 影子跟读
                      </Button>
                      <button
                        type="button"
                        className={cn(
                          "relative h-8 w-12 rounded-full border transition",
                          blurTarget ? "bg-primary/80" : "bg-muted"
                        )}
                        onClick={() => setBlurTarget((prev) => !prev)}
                        aria-label="遮挡外语"
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
                        aria-label="遮挡母语"
                      >
                        <span
                          className={cn(
                            "absolute top-1 h-6 w-6 rounded-full bg-background shadow transition",
                            blurNative ? "left-5" : "left-1"
                          )}
                        />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {detailQuery.data.sentences.length === 0 ? (
                      <Card>
                        <CardContent className="py-6 text-sm text-muted-foreground">
                          暂无句子
                        </CardContent>
                      </Card>
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
                              {ordered.map((item) => {
                                if (!item.text) return null
                                const isPlaying =
                                  sentence.id === playingSentenceId &&
                                  playingRole === item.role
                                const isSelected =
                                  sentence.id === selectedSentenceId &&
                                  selectedSentenceRole === item.role
                                return (
                                  <div
                                    key={item.role}
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
                                      playSentenceRole(
                                        sentence,
                                        item.role as "native" | "target"
                                      )
                                        .then((ok) => {
                                          if (!ok) {
                                            toast.error(
                                              "音频播放失败，请检查 TTS 配置或音频路径。"
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
                                        playSentenceRole(
                                          sentence,
                                          item.role as "native" | "target"
                                        )
                                          .then((ok) => {
                                            if (!ok) {
                                              toast.error(
                                                "音频播放失败，请检查 TTS 配置或音频路径。"
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
                                        item.role === "native" && blurNative && "blur-sm",
                                        item.role === "target" && blurTarget && "blur-sm"
                                      )}
                                    >
                                      {item.text}
                                    </span>
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
                      <h1 className="text-3xl font-semibold">今天想背点什么？</h1>
                      <p className="text-sm text-muted-foreground">
                        输入外语文章，系统会自动切分为句子。
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
                          placeholder="输入场景文章..."
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
                      提交失败，请稍后再试。
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
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              将删除选中的 {deleteTargets.length} 篇文章及其句子内容，此操作不可恢复。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                取消
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
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteAccountOpen} onOpenChange={setDeleteAccountOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认注销账号</DialogTitle>
            <DialogDescription>
              注销后将删除所有数据，且不可恢复。请谨慎操作。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                取消
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
              确认注销
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={languageDialogOpen} onOpenChange={setLanguageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>语言设置</DialogTitle>
            <DialogDescription>设置母语/外语与语音偏好。</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-sm">
            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted-foreground">母语</div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  className="h-9 rounded-md border bg-background px-2 text-sm"
                  value={nativeLanguageSetting}
                  onChange={(event) => {
                    const value = event.target.value
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
                    语音
                  </option>
                  {ttsOptionsQuery.data?.nativeOptions.map((voice) => (
                    <option key={voice.id} value={voice.id}>
                      {(voice.gender === "Female" ? "女" : voice.gender === "Male" ? "男" : "语音")} ·{" "}
                      {voice.name ?? voice.voiceId}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted-foreground">外语</div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  className="h-9 rounded-md border bg-background px-2 text-sm"
                  value={targetLanguageSetting}
                  onChange={(event) => {
                    const value = event.target.value
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
                    语音
                  </option>
                  {ttsOptionsQuery.data?.targetOptions.map((voice) => (
                    <option key={voice.id} value={voice.id}>
                      {(voice.gender === "Female" ? "女" : voice.gender === "Male" ? "男" : "语音")} ·{" "}
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
                关闭
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>AI 设置</DialogTitle>
            <DialogDescription>新增自定义厂商或调整默认与模型。</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-sm">
            <div className="space-y-2 rounded-md border px-3 py-2">
              <div className="text-xs font-semibold text-muted-foreground">额度选择</div>
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
                  公共额度
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
                  私有额度
                </label>
              </div>
            </div>
            {aiProvidersDraft.length === 0 ? (
              <div className="text-sm text-muted-foreground">暂无 AI 厂商配置。</div>
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
                        {provider.isDefault ? "默认" : "设为默认"}
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
                        修改
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-7"
                        onClick={() => setAiProviderDeleteId(provider.id)}
                      >
                        删除
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
                恢复默认配置
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-9"
                onClick={() => setAiProviderAddOpen(true)}
              >
                新增自定义厂商
              </Button>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                取消
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
                保存
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={aiProviderAddOpen} onOpenChange={setAiProviderAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新增自定义厂商</DialogTitle>
            <DialogDescription>填写自定义厂商配置并保存。</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 text-sm">
            <input
              className="h-9 rounded-md border bg-background px-2 text-sm"
              placeholder="名称（唯一）"
              value={newAiProviderName}
              onChange={(event) => setNewAiProviderName(event.target.value)}
            />
            <select
              className="h-9 rounded-md border bg-background px-2 text-sm"
              value={newAiProviderType}
              onChange={(event) => setNewAiProviderType(event.target.value)}
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
                  {newAiProviderKeyVisible ? "隐藏" : "显示"}
                </Button>
              </div>
            ) : null}
            <input
              className="h-9 rounded-md border bg-background px-2 text-sm"
              placeholder="models，逗号分隔"
              value={newAiProviderModels}
              onChange={(event) => setNewAiProviderModels(event.target.value)}
            />
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={newAiProviderEnabled}
                onChange={(event) => setNewAiProviderEnabled(event.target.checked)}
              />
              启用
            </label>
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                取消
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
                  toast.error("请填写名称、URL 和模型")
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
                  toast.success("已新增厂商")
                } catch (error) {
                  const message = error instanceof Error ? error.message : "新增厂商失败"
                  toast.error(message)
                }
              }}
            >
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={aiProviderEditOpen} onOpenChange={setAiProviderEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>修改厂商</DialogTitle>
            <DialogDescription>调整厂商配置。</DialogDescription>
          </DialogHeader>
          {aiProviderEditing ? (
            <div className="grid gap-3 text-sm">
              <input
                className="h-9 rounded-md border bg-background px-2 text-sm"
                placeholder="名称（唯一）"
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
                    {aiProviderEditKeyVisible ? "隐藏" : "显示"}
                  </Button>
                </div>
              ) : null}
              <input
                className="h-9 rounded-md border bg-background px-2 text-sm"
                placeholder="models，逗号分隔"
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
                启用
              </label>
            </div>
          ) : null}
          <DialogFooter className="gap-2 sm:gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                取消
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
                  toast.error("Base URL 不能为空")
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
                  toast.success("已更新厂商")
                } catch (error) {
                  const message = error instanceof Error ? error.message : "更新失败"
                  toast.error(message)
                }
              }}
            >
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(aiProviderDeleteId)} onOpenChange={() => setAiProviderDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>删除厂商</DialogTitle>
            <DialogDescription>确认删除此厂商配置？</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                取消
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
                  toast.success("已删除厂商")
                } catch (error) {
                  const message = error instanceof Error ? error.message : "删除失败"
                  toast.error(message)
                }
              }}
            >
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={aiProviderResetOpen} onOpenChange={setAiProviderResetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>恢复默认配置</DialogTitle>
            <DialogDescription>将公共配置覆盖更新到用户级厂商配置。</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                取消
              </Button>
            </DialogClose>
            <Button
              type="button"
              onClick={async () => {
                try {
                  await resetAiProvidersToPublic.mutateAsync({ confirm: true })
                  await aiProvidersQuery.refetch()
                  setAiProviderResetOpen(false)
                  toast.success("已恢复默认配置")
                } catch (error) {
                  const message = error instanceof Error ? error.message : "恢复失败"
                  toast.error(message)
                }
              }}
            >
              确认恢复
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={aiInstructionDialogOpen} onOpenChange={setAiInstructionDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>AI 指令</DialogTitle>
            <DialogDescription>管理你的 AI 指令。</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-sm">
            <div className="space-y-2">
              {aiInstructionDrafts.length === 0 ? (
                <div className="text-muted-foreground">暂无指令。</div>
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
                          {instruction.isDefault ? " · 默认" : ""}
                          {!instruction.enabled ? " · 已停用" : ""}
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
                          修改
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
                          删除
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
              新增
            </Button>
            <DialogClose asChild>
              <Button type="button">关闭</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={aiInstructionEditOpen} onOpenChange={setAiInstructionEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>编辑 AI 指令</DialogTitle>
          </DialogHeader>

          {aiInstructionEditing ? (
            <div className="space-y-3 text-sm">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">指令名称</label>
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
                <label className="text-xs text-muted-foreground">指令类型</label>
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
                <label className="text-xs text-muted-foreground">AI 厂商</label>
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
                  <option value="">默认厂商</option>
                  {aiProvidersQuery.data?.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.providerType}
                      {item.isDefault ? "（默认）" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">系统提示词</label>
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
                <label className="text-xs text-muted-foreground">用户提示词</label>
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
                  <label className="text-xs text-muted-foreground">输入参数定义</label>
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
                  <label className="text-xs text-muted-foreground">输出结构定义</label>
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
                  默认指令
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
                  启用
                </label>
              </div>
            </div>
          ) : null}

          <DialogFooter className="gap-2 sm:gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                取消
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
                保存
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={aiInstructionAddOpen} onOpenChange={setAiInstructionAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新增指令</DialogTitle>
            <DialogDescription>从公共指令复制一份。</DialogDescription>
          </DialogHeader>

          <div className="space-y-2 text-sm">
            {publicAiInstructions.length === 0 ? (
              <div className="text-muted-foreground">暂无公共指令。</div>
            ) : (
              <>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">AI 厂商</label>
                  <select
                    className="h-9 w-full rounded-md border bg-background px-2 text-sm"
                    value={aiInstructionAddProviderId ?? ""}
                    onChange={(event) => {
                      setAiInstructionAddProviderId(event.target.value || null)
                    }}
                  >
                    <option value="">默认厂商</option>
                    {aiProvidersQuery.data?.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.providerType}
                        {item.isDefault ? "（默认）" : ""}
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
                        })
                        await aiInstructionQuery.refetch()
                        setAiInstructionAddOpen(false)
                      }}
                    >
                      新增
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
                关闭
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={aiInstructionDeleteOpen} onOpenChange={setAiInstructionDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>删除指令</DialogTitle>
            <DialogDescription>确认删除该指令？</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                取消
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
                删除
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={shadowingDialogOpen} onOpenChange={setShadowingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>影子跟读配置</DialogTitle>
            <DialogDescription>设置影子跟读速率序列。</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <span>影子跟读</span>
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
              <div className="text-xs text-muted-foreground">速率序列</div>
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
                + 添加速率
              </Button>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                取消
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
            <DialogTitle>清理音频缓存</DialogTitle>
            <DialogDescription>确认清理本地音频缓存吗？</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                取消
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button
                type="button"
                onClick={() => {
                  clearTtsCache().catch(() => {})
                }}
              >
                确认
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
