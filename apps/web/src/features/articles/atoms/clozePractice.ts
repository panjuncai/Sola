import type { ClozeResult } from "../hooks/init/useInitClozePractice"
import { atom, useAtomValue, useSetAtom } from "jotai"

const clozeInputsAtom = atom<Record<string, string>>({})
const clozeRevealedAtom = atom<Record<string, boolean>>({})
const clozeResultsAtom = atom<Record<string, ClozeResult>>({})

export const useClozePracticeState = () => ({
  clozeInputs: useAtomValue(clozeInputsAtom),
  clozeRevealed: useAtomValue(clozeRevealedAtom),
  clozeResults: useAtomValue(clozeResultsAtom),
})

export const useClozePracticeActions = () => ({
  setClozeInputs: useSetAtom(clozeInputsAtom),
  setClozeRevealed: useSetAtom(clozeRevealedAtom),
  setClozeResults: useSetAtom(clozeResultsAtom),
})
