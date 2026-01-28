import type { TFunction } from "i18next"
import { atom, useAtom, useSetAtom } from "jotai"

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

const uiSentenceOperationsDepsAtom = atom<SentenceOperationsDeps | null>(null)
const uiSentenceEditOpenAtom = atom(false)
const uiSentenceDeleteOpenAtom = atom(false)
const uiSentenceEditingAtom = atom<SentenceEditing | null>(null)
const uiSentenceDeleteIdAtom = atom<string | null>(null)

export const useSetSentenceOperationsDeps = () => useSetAtom(uiSentenceOperationsDepsAtom)

export const useSentenceOperationsState = () => {
  const [sentenceEditOpen, setSentenceEditOpen] = useAtom(uiSentenceEditOpenAtom)
  const [sentenceDeleteOpen, setSentenceDeleteOpen] = useAtom(
    uiSentenceDeleteOpenAtom
  )
  const [sentenceEditing, setSentenceEditing] = useAtom(uiSentenceEditingAtom)
  const [sentenceDeleteId, setSentenceDeleteId] = useAtom(uiSentenceDeleteIdAtom)
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
