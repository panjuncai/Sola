import type { AudioSourceProvider, PlaybackRole, PlaybackSentence } from "@sola/logic"

import type { ArticleDetailResponse } from "@sola/shared"

import { buildCacheKey } from "../utils/tts"

type SentenceAudioMutation = {
  mutateAsync: (input: {
    sentenceId: string
    role: "native" | "target"
    speed?: number
  }) => Promise<{ cacheKey: string; url: string }>
}

type WebAudioProviderParams = {
  userId: string | null
  apiBaseUrl: string
  detail: ArticleDetailResponse | null | undefined
  nativeVoiceId: string | null
  targetVoiceId: string | null
  providerType: string | null | undefined
  providerRegion: string | null | undefined
  sentenceAudioMutation: SentenceAudioMutation
  getCachedAudioUrl: (cacheKey: string) => string | undefined
  setCachedAudioUrl: (cacheKey: string, url: string) => void
}

export class WebAudioProvider implements AudioSourceProvider {
  private readonly userId: string | null
  private readonly apiBaseUrl: string
  private readonly detail: ArticleDetailResponse | null | undefined
  private readonly nativeVoiceId: string | null
  private readonly targetVoiceId: string | null
  private readonly providerType: string | null | undefined
  private readonly providerRegion: string | null | undefined
  private readonly sentenceAudioMutation: SentenceAudioMutation
  private readonly getCachedAudioUrl: (cacheKey: string) => string | undefined
  private readonly setCachedAudioUrl: (cacheKey: string, url: string) => void

  constructor(params: WebAudioProviderParams) {
    this.userId = params.userId
    this.apiBaseUrl = params.apiBaseUrl
    this.detail = params.detail
    this.nativeVoiceId = params.nativeVoiceId
    this.targetVoiceId = params.targetVoiceId
    this.providerType = params.providerType
    this.providerRegion = params.providerRegion
    this.sentenceAudioMutation = params.sentenceAudioMutation
    this.getCachedAudioUrl = params.getCachedAudioUrl
    this.setCachedAudioUrl = params.setCachedAudioUrl
  }

  prefetch(sentence: PlaybackSentence, role: PlaybackRole) {
    const text = role === "native" ? sentence.nativeText ?? "" : sentence.targetText ?? ""
    if (!text.trim()) return
    const cacheKey = this.buildLocalCacheKey(sentence.id, role)
    if (!cacheKey) return
    if (this.getCachedAudioUrl(cacheKey)) return
    this.sentenceAudioMutation
      .mutateAsync({ sentenceId: sentence.id, role })
      .then((result) => {
        if (result?.cacheKey && result?.url) {
          this.setCachedAudioUrl(result.cacheKey, this.normalizeUrl(result.url))
        }
      })
      .catch(() => {})
  }

  private buildLocalCacheKey(sentenceId: string, role: PlaybackRole) {
    if (!this.userId || !this.detail || !this.providerType) return null
    const voiceId = this.resolveVoiceId(role)
    if (!voiceId) return null
    const languageCode =
      role === "native" ? this.detail.article.nativeLanguage : this.detail.article.targetLanguage
    return buildCacheKey({
      userId: this.userId,
      sentenceId,
      languageCode,
      providerType: this.providerType,
      voiceId,
      region: this.providerRegion ?? "",
      speed: 1,
    })
  }

  private resolveVoiceId(role: PlaybackRole) {
    const selectedId = role === "native" ? this.nativeVoiceId : this.targetVoiceId
    if (!selectedId) return null
    return selectedId
  }

  private normalizeUrl(url: string) {
    if (url.startsWith("/")) return `${this.apiBaseUrl}${url}`
    return url
  }
}
