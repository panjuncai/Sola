import { atom, useAtomValue, useSetAtom } from "jotai"

const uiPlayingSentenceIdAtom = atom<string | null>(null)
const uiPlayingRoleAtom = atom<"native" | "target" | null>(null)
const uiPlayingSpeedAtom = atom<number | null>(null)

export const usePlaybackState = () => ({
  playingSentenceId: useAtomValue(uiPlayingSentenceIdAtom),
  playingRole: useAtomValue(uiPlayingRoleAtom),
  playingSpeed: useAtomValue(uiPlayingSpeedAtom),
})

export const usePlaybackActions = () => ({
  setPlayingSentenceId: useSetAtom(uiPlayingSentenceIdAtom),
  setPlayingRole: useSetAtom(uiPlayingRoleAtom),
  setPlayingSpeed: useSetAtom(uiPlayingSpeedAtom),
})
