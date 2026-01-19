import type { TFunction } from "i18next"
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai"

type SentenceOperationsDeps = {
  t: TFunction<"translation">
  detail:
    | {
        article: { id: string }
        sentences: Array<{
          id: string
          nativeText: string | null
          targetText: string | null
        }>
      }
    | undefined
  stopLoopPlayback: () => void
  clearSentenceSelection: (sentenceId: string) => void
  clearSentenceCache: (sentenceId: string) => Promise<void> | void
}

type SentenceEditing = {
  id: string
  nativeText: string
  targetText: string
}

const sentenceOperationsDepsAtom = atom<SentenceOperationsDeps | null>(null)
const sentenceEditOpenAtom = atom(false)
const sentenceDeleteOpenAtom = atom(false)
const sentenceEditingAtom = atom<SentenceEditing | null>(null)
const sentenceDeleteIdAtom = atom<string | null>(null)

export const useSentenceOperationsDeps = () => useAtomValue(sentenceOperationsDepsAtom)
export const useSetSentenceOperationsDeps = () => useSetAtom(sentenceOperationsDepsAtom)

export const useSentenceOperationsState = () => {
  const [sentenceEditOpen, setSentenceEditOpen] = useAtom(sentenceEditOpenAtom)
  const [sentenceDeleteOpen, setSentenceDeleteOpen] = useAtom(
    sentenceDeleteOpenAtom
  )
  const [sentenceEditing, setSentenceEditing] = useAtom(sentenceEditingAtom)
  const [sentenceDeleteId, setSentenceDeleteId] = useAtom(sentenceDeleteIdAtom)
  return {
    sentenceEditOpen,
    setSentenceEditOpen,
    sentenceDeleteOpen,
    setSentenceDeleteOpen,
    sentenceEditing,
    setSentenceEditing,
    sentenceDeleteId,
    setSentenceDeleteId,
  }
}
