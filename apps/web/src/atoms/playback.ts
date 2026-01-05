import { atom, useAtomValue, useSetAtom } from "jotai"

type PlaybackApi = {
  buildLocalCacheKey: (
    sentenceId: string,
    role: "native" | "target",
    speed?: number
  ) => string | null
  getCachedAudioUrl: (cacheKey: string) => string | undefined
  setCachedAudioUrl: (cacheKey: string, url: string) => void
  playSentenceRole: (
    sentence: { id: string; nativeText: string | null; targetText: string | null },
    role: "native" | "target",
    speed?: number
  ) => Promise<boolean>
  stopAudioPlayback: () => void
  clearTtsCache: () => Promise<void>
  clearSentenceCache: (sentenceId: string) => Promise<void>
}

export const playingSentenceIdAtom = atom<string | null>(null)
export const playingRoleAtom = atom<"native" | "target" | null>(null)
export const playingSpeedAtom = atom<number | null>(null)
export const playbackApiAtom = atom<PlaybackApi | null>(null)

export const usePlaybackState = () => ({
  playingSentenceId: useAtomValue(playingSentenceIdAtom),
  playingRole: useAtomValue(playingRoleAtom),
  playingSpeed: useAtomValue(playingSpeedAtom),
})

export const usePlaybackActions = () => ({
  setPlayingSentenceId: useSetAtom(playingSentenceIdAtom),
  setPlayingRole: useSetAtom(playingRoleAtom),
  setPlayingSpeed: useSetAtom(playingSpeedAtom),
})

export const usePlaybackApi = () => useAtomValue(playbackApiAtom)

export const useSetPlaybackApi = () => useSetAtom(playbackApiAtom)
