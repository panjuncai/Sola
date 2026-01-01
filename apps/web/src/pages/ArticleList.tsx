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
  const [darkMode, setDarkMode] = React.useState(false)

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
  const userId = useAuthStore((state) => state.user?.id ?? null)
  const ttsInitRef = React.useRef<string>("")
  const ttsOptionsQuery = trpc.user.getTtsOptions.useQuery(
    {
      nativeLanguage: nativeLanguageSetting as "zh-CN" | "en-US" | "fr-FR",
      targetLanguage: targetLanguageSetting as "zh-CN" | "en-US" | "fr-FR",
    },
    { enabled: settingsQuery.isSuccess }
  )
  const updateTtsVoices = trpc.user.updateTtsVoices.useMutation()

  const showCreate = isCreating || articles.length === 0
  const detailQuery = trpc.article.get.useQuery(
    { articleId: activeArticleId ?? "" },
    { enabled: Boolean(activeArticleId) && !showCreate }
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
    onSuccess: async () => {
      await utils.article.list.invalidate()
      setSelectedIds([])
      setIsCreating(false)
      setActiveArticleId(null)
    },
  })
  const deleteAccountMutation = trpc.user.deleteAccount.useMutation()
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
    }
  }, [settingsQuery.data])

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

  React.useEffect(() => {
    if (!settingsOpen) return
    const handleOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (settingsPanelRef.current?.contains(target)) return
      if (settingsButtonRef.current?.contains(target)) return
      setSettingsOpen(false)
    }
    document.addEventListener("mousedown", handleOutside)
    return () => document.removeEventListener("mousedown", handleOutside)
  }, [settingsOpen])

  React.useEffect(() => {
    if (!activeArticleId && !showCreate && articles.length > 0) {
      setActiveArticleId(articles[0]!.id)
    }
  }, [activeArticleId, articles, showCreate])

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
    }
    updateSettings.mutate(payload)
  }

  const stopLoopPlayback = () => {
    loopTokenRef.current += 1
    setIsLoopingAll(false)
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

  const buildLocalCacheKey = (sentenceId: string, role: "native" | "target") => {
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
      speed: 1,
    })
  }

  const playAudioUrl = (url: string) =>
    new Promise<boolean>((resolve) => {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      const audio = new Audio(url)
      audioRef.current = audio
      const finalize = () => {
        audio.onended = null
        audio.onerror = null
        resolve(true)
      }
      const fail = () => {
        audio.onended = null
        audio.onerror = null
        resolve(false)
      }
      audio.onended = finalize
      audio.onerror = fail
      audio.play().catch(fail)
    })

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

    const sentences = detailQuery.data.sentences
    const orderSetting = detailQuery.data.article.displayOrder ?? "native_first"
    const pauseMs = Math.max(0, Math.round(playbackPauseSeconds * 1000))

    while (loopTokenRef.current === token) {
      for (let sIndex = 0; sIndex < sentences.length; sIndex += 1) {
        const sentence = sentences[sIndex]
        if (loopTokenRef.current !== token) break
        const order =
          orderSetting === "native_first" ? ["native", "target"] : ["target", "native"]

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

        for (const role of order) {
          if (loopTokenRef.current !== token) break
          const text =
            role === "native" ? sentence.nativeText ?? "" : sentence.targetText ?? ""
          if (!text) continue

          const repeatTimes =
            role === "native" ? playbackNativeRepeat : playbackTargetRepeat

          for (let i = 0; i < Math.max(1, repeatTimes); i += 1) {
            if (loopTokenRef.current !== token) break
            const localKey = buildLocalCacheKey(sentence.id, role as "native" | "target")
            if (localKey) {
              const cached = getCachedAudioUrl(localKey)
              if (cached) {
                setPlayingSentenceId(sentence.id)
                setPlayingRole(role as "native" | "target")
                const ok = await playAudioUrl(cached)
                if (!ok) {
                  stopLoopPlayback()
                  toast.error("音频播放失败，请检查 TTS 配置或音频路径。")
                  return
                }
                if (pauseMs > 0) {
                  await waitMs(pauseMs)
                }
                continue
              }
            }

            const result = await sentenceAudioMutation.mutateAsync({
              sentenceId: sentence.id,
              role: role as "native" | "target",
            })
            let url = getCachedAudioUrl(result.cacheKey)
            if (!url) {
              url = result.url
              setCachedAudioUrl(result.cacheKey, url)
            }
            setPlayingSentenceId(sentence.id)
            setPlayingRole(role as "native" | "target")
            const ok = await playAudioUrl(url)
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
                    step={0.5}
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
                      trpc.auth.signOut
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
          className="text-sm font-medium"
          onClick={() => setMobileMenuOpen(true)}
        >
          Menu
        </button>
        <div className="text-sm font-semibold">Sola</div>
        <div className="w-10" aria-hidden />
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
                    <div className="flex items-center justify-end gap-2">
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
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <h1 className="text-3xl font-semibold">
                      {detailQuery.data.article.title ?? "未命名"}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      {detailQuery.data.article.sourceType === "word_list"
                        ? "单词列表"
                        : "文章"}{" "}
                      · {detailQuery.data.article.nativeLanguage} →{" "}
                      {detailQuery.data.article.targetLanguage}
                    </p>
                  </div>
                  <div className="space-y-4">
                    {detailQuery.data.sentences.length === 0 ? (
                      <Card>
                        <CardContent className="py-6 text-sm text-muted-foreground">
                          暂无句子
                        </CardContent>
                      </Card>
                    ) : (
                      detailQuery.data.sentences.map((sentence) => (
                        <Card key={sentence.id}>
                          <CardContent className="py-4 text-sm">
                            <div
                              className={cn(
                                "text-base",
                                sentence.id === playingSentenceId &&
                                  playingRole === "target" &&
                                  "text-orange-500 font-medium"
                              )}
                            >
                              {sentence.targetText}
                            </div>
                          </CardContent>
                        </Card>
                      ))
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
    </div>
  )
}
