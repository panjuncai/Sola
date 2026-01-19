import * as React from "react"
import type { TFunction } from "i18next"

import type { ArticleDetail, ArticleSentence } from "@sola/shared"
import { toast } from "@sola/ui"

import { trpc } from "@/lib/trpc"
import {
  useSentenceOperationsState,
  useSetSentenceOperationsDeps,
} from "../../atoms/sentenceOperations"
import { useClozePracticeActions } from "../../atoms/clozePractice"

type SentenceDetail = {
  article: Pick<ArticleDetail, "id">
  sentences: ArticleSentence[]
}

type UseSentenceOperationsParams = {
  t: TFunction<"translation">
  detail: SentenceDetail | undefined
  stopLoopPlayback: () => void
  clearSentenceSelection: (sentenceId: string) => void
  clearSentenceCache: (sentenceId: string) => Promise<void> | void
}

const useSentenceOperationsLogic = ({
  t,
  detail,
  stopLoopPlayback,
  clearSentenceSelection,
  clearSentenceCache,
}: UseSentenceOperationsParams) => {
  const { setClozeInputs, setClozeResults, setClozeRevealed } =
    useClozePracticeActions()
  const utils = trpc.useUtils()
  const updateSentenceMutation = trpc.article.updateSentence.useMutation()
  const deleteSentenceMutation = trpc.article.deleteSentence.useMutation()
  const {
    sentenceEditOpen,
    setSentenceEditOpen,
    sentenceDeleteOpen,
    setSentenceDeleteOpen,
    sentenceEditing,
    setSentenceEditing,
    sentenceDeleteId,
    setSentenceDeleteId,
  } = useSentenceOperationsState()

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
    (sentence: Pick<ArticleSentence, "id" | "nativeText" | "targetText">) => {
      setSentenceEditing({
        id: sentence.id,
        nativeText: sentence.nativeText ?? "",
        targetText: sentence.targetText ?? "",
      })
      setSentenceEditOpen(true)
    },
    [setSentenceEditOpen, setSentenceEditing]
  )

  const handleSentenceDelete = React.useCallback(
    (sentenceId: string) => {
      setSentenceDeleteId(sentenceId)
      setSentenceDeleteOpen(true)
    },
    [setSentenceDeleteId, setSentenceDeleteOpen]
  )

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
  }, [
    clearSentenceCache,
    sentenceEditing,
    setSentenceEditOpen,
    setSentenceEditing,
    t,
    updateSentenceLocal,
    updateSentenceMutation,
  ])

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
    setSentenceDeleteId,
    setSentenceDeleteOpen,
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

export const useInitSentenceOperations = (params: UseSentenceOperationsParams) => {
  const api = useSentenceOperationsLogic(params)
  // eslint-disable-next-line react-hooks/globals
  latestSentenceOperationsApi = api
  const setDeps = useSetSentenceOperationsDeps()
  React.useEffect(() => {
    setDeps(params)
  }, [params, setDeps])
  return api
}

export const useSentenceOperations = () => {
  if (latestSentenceOperationsApi) return latestSentenceOperationsApi
  throw new Error("SentenceOperations API is not initialized.")
}

type SentenceOperationsValue = ReturnType<typeof useSentenceOperationsLogic>

let latestSentenceOperationsApi: SentenceOperationsValue | null = null
