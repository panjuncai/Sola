import { atom, useAtomValue, useSetAtom } from "jotai"

const playingSentenceIdAtom = atom<string | null>(null)
const playingRoleAtom = atom<"native" | "target" | null>(null)
const playingSpeedAtom = atom<number | null>(null)

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
