import { create } from "zustand"

export interface PlayerState {
  isPlaying: boolean
  currentArticleId: number | null
  volume: number
  actions: {
    play: (id: number) => void
    pause: () => void
    setVolume: (volume: number) => void
  }
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value))
}

export const usePlayerStore = create<PlayerState>((set) => ({
  isPlaying: false,
  currentArticleId: null,
  volume: 1,
  actions: {
    play: (id) =>
      set({
        isPlaying: true,
        currentArticleId: id,
      }),
    pause: () =>
      set({
        isPlaying: false,
      }),
    setVolume: (volume) =>
      set({
        volume: clamp01(volume),
      }),
  },
}))
