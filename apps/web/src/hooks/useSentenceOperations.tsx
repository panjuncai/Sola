import * as React from "react"
import type { TFunction } from "i18next"

import { toast } from "@sola/ui"

import { trpc } from "@/lib/trpc"
import type { ClozeResult } from "@/hooks/useClozePractice"

type SentenceDetail = {
  article: { id: string }
  sentences: Array<{
    id: string
    nativeText: string | null
    targetText: string | null
  }>
}

type UseSentenceOperationsParams = {
  t: TFunction<"translation">
  detail: SentenceDetail | undefined
  stopLoopPlayback: () => void
  clearSentenceSelection: (sentenceId: string) => void
  clearSentenceCache: (sentenceId: string) => Promise<void> | void
  setClozeInputs: React.Dispatch<React.SetStateAction<Record<string, string>>>
  setClozeResults: React.Dispatch<React.SetStateAction<Record<string, ClozeResult>>>
  setClozeRevealed: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
}

const useSentenceOperationsState = ({
  t,
  detail,
  stopLoopPlayback,
  clearSentenceSelection,
  clearSentenceCache,
  setClozeInputs,
  setClozeResults,
  setClozeRevealed,
}: UseSentenceOperationsParams) => {
  const utils = trpc.useUtils()
  const updateSentenceMutation = trpc.article.updateSentence.useMutation()
  const deleteSentenceMutation = trpc.article.deleteSentence.useMutation()

  const [sentenceEditOpen, setSentenceEditOpen] = React.useState(false)
  const [sentenceDeleteOpen, setSentenceDeleteOpen] = React.useState(false)
  const [sentenceEditing, setSentenceEditing] = React.useState<{
    id: string
    nativeText: string
    targetText: string
  } | null>(null)
  const [sentenceDeleteId, setSentenceDeleteId] = React.useState<string | null>(null)

  const updateSentenceLocal = React.useCallback(
    (sentenceId: string, nativeText: string | null, targetText: string | null) => {
      const articleId = detail?.article.id
      if (!articleId) return
      utils.article.get.setData({ articleId }, (current) => {
        if (!current) return current
        return {
          ...current,
          sentences: current.sentences.map((sentence) =>
            sentence.id === sentenceId
              ? { ...sentence, nativeText, targetText: targetText ?? "" }
              : sentence
          ),
        }
      })
    },
    [detail?.article.id, utils.article.get]
  )

  const deleteSentenceLocal = React.useCallback(
    (sentenceId: string) => {
      const articleId = detail?.article.id
      if (!articleId) return
      utils.article.get.setData({ articleId }, (current) => {
        if (!current) return current
        return {
          ...current,
          sentences: current.sentences.filter((sentence) => sentence.id !== sentenceId),
        }
      })
    },
    [detail?.article.id, utils.article.get]
  )

  const handleSentenceEdit = React.useCallback(
    (sentence: { id: string; nativeText: string | null; targetText: string | null }) => {
      setSentenceEditing({
        id: sentence.id,
        nativeText: sentence.nativeText ?? "",
        targetText: sentence.targetText ?? "",
      })
      setSentenceEditOpen(true)
    },
    []
  )

  const handleSentenceDelete = React.useCallback((sentenceId: string) => {
    setSentenceDeleteId(sentenceId)
    setSentenceDeleteOpen(true)
  }, [])

  const handleEditSave = React.useCallback(async () => {
    if (!sentenceEditing) return
    try {
      const result = await updateSentenceMutation.mutateAsync({
        sentenceId: sentenceEditing.id,
        nativeText: sentenceEditing.nativeText,
        targetText: sentenceEditing.targetText,
      })
      updateSentenceLocal(result.sentenceId, result.nativeText, result.targetText)
      await clearSentenceCache(result.sentenceId)
      toast.success(t("article.sentenceUpdateSuccess"))
      setSentenceEditOpen(false)
      setSentenceEditing(null)
    } catch {
      toast.error(t("common.updateFailed"))
    }
  }, [clearSentenceCache, sentenceEditing, t, updateSentenceLocal, updateSentenceMutation])

  const handleDeleteConfirm = React.useCallback(async () => {
    if (!sentenceDeleteId) return
    const targetId = sentenceDeleteId
    try {
      stopLoopPlayback()
      await deleteSentenceMutation.mutateAsync({ sentenceId: targetId })
      deleteSentenceLocal(targetId)
      clearSentenceSelection(targetId)
      await clearSentenceCache(targetId)
      setClozeInputs((prev) => {
        if (!prev[targetId]) return prev
        const next = { ...prev }
        delete next[targetId]
        return next
      })
      setClozeResults((prev) => {
        if (!prev[targetId]) return prev
        const next = { ...prev }
        delete next[targetId]
        return next
      })
      setClozeRevealed((prev) => {
        if (!prev[targetId]) return prev
        const next = { ...prev }
        delete next[targetId]
        return next
      })
      toast.success(t("article.sentenceDeleteSuccess"))
      setSentenceDeleteOpen(false)
      setSentenceDeleteId(null)
    } catch {
      toast.error(t("common.deleteFailed"))
    }
  }, [
    clearSentenceCache,
    clearSentenceSelection,
    deleteSentenceLocal,
    deleteSentenceMutation,
    sentenceDeleteId,
    setClozeInputs,
    setClozeResults,
    setClozeRevealed,
    stopLoopPlayback,
    t,
  ])

  return {
    sentenceEditOpen,
    setSentenceEditOpen,
    sentenceDeleteOpen,
    setSentenceDeleteOpen,
    sentenceEditing,
    setSentenceEditing,
    sentenceDeleteId,
    setSentenceDeleteId,
    isSaving: updateSentenceMutation.isLoading,
    isDeleting: deleteSentenceMutation.isLoading,
    handleSentenceEdit,
    handleSentenceDelete,
    handleEditSave,
    handleDeleteConfirm,
  }
}

type SentenceOperationsContextValue = ReturnType<typeof useSentenceOperationsState>

const SentenceOperationsContext =
  React.createContext<SentenceOperationsContextValue | null>(null)

export const SentenceOperationsProvider = ({
  value,
  children,
}: {
  value: SentenceOperationsContextValue
  children: React.ReactNode
}) => {
  return (
    <SentenceOperationsContext.Provider value={value}>
      {children}
    </SentenceOperationsContext.Provider>
  )
}

export const useSentenceOperations = (params?: UseSentenceOperationsParams) => {
  const context = React.useContext(SentenceOperationsContext)
  if (context) return context
  if (!params) {
    throw new Error("useSentenceOperations requires params when no provider is set.")
  }
  return useSentenceOperationsState(params)
}
