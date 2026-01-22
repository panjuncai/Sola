import * as React from "react"
import type { TFunction } from "i18next"
import { useAtomValue } from "jotai"

import { toast } from "@sola/ui"

import { trpc } from "@/lib/trpc"
import { trpcAtom } from "@/lib/trpcAtom"
import { trpcClient } from "@/lib/trpcClient"
import type { ArticleDetail, ArticleSentence } from "@sola/shared"
import { useAiDialogsActions, useAiDialogsState } from "../../atoms/aiDialogs"
import type { InstructionType } from "../../types"
import { useAiManagementState as useAiManagementAtomState } from "../../atoms/aiManagement"

type ArticleDetailResponse = {
  article: ArticleDetail
  sentences: ArticleSentence[]
}

type UseAiManagementParams = {
  t: TFunction<"translation">
  detail: ArticleDetailResponse | undefined
  useAiUserKey: boolean
}

const aiProvidersAtom = trpcAtom(
  "user.getAiProviders",
  trpcClient.user.getAiProviders,
  undefined
)
const aiInstructionAtom = trpcAtom(
  "user.getUserAiInstructions",
  trpcClient.user.getUserAiInstructions,
  undefined
)
const publicAiInstructionAtom = trpcAtom(
  "user.getPublicAiInstructions",
  trpcClient.user.getPublicAiInstructions,
  undefined
)

const useAiManagementState = ({
  t,
  detail,
  useAiUserKey,
}: UseAiManagementParams) => {
  const {
    aiInstructionAddModel,
    setAiInstructionAddModel,
    aiInstructionEditing,
    setAiInstructionEditing,
    aiInstructionDeleteId,
    setAiInstructionDeleteId,
    aiInstructionAddProviderId,
    setAiInstructionAddProviderId,
    newAiProviderName,
    setNewAiProviderName,
    newAiProviderType,
    setNewAiProviderType,
    newAiProviderApiUrl,
    setNewAiProviderApiUrl,
    newAiProviderModels,
    setNewAiProviderModels,
    newAiProviderEnabled,
    setNewAiProviderEnabled,
    newAiProviderApiKey,
    setNewAiProviderApiKey,
    newAiProviderKeyVisible,
    setNewAiProviderKeyVisible,
    aiProviderEditing,
    setAiProviderEditing,
    aiProviderEditKeyVisible,
    setAiProviderEditKeyVisible,
    aiProviderEditModels,
    setAiProviderEditModels,
    aiProgress,
    setAiProgress,
    aiLastInstructionId,
    setAiLastInstructionId,
  } = useAiManagementAtomState()
  const utils = trpc.useUtils()
  const aiProvidersQuery = useAtomValue(aiProvidersAtom)
  const updateAiProviderDefault = trpc.user.updateAiProviderDefault.useMutation()
  const updateAiProviderConfig = trpc.user.updateAiProviderConfig.useMutation()
  const createUserAiProvider = trpc.user.createUserAiProvider.useMutation()
  const deleteAiProvider = trpc.user.deleteAiProvider.useMutation()
  const resetAiProvidersToPublic = trpc.user.resetAiProvidersToPublic.useMutation()
  const aiInstructionQuery = useAtomValue(aiInstructionAtom)
  const publicAiInstructionQuery = useAtomValue(publicAiInstructionAtom)
  const createUserAiInstructionFromPublic =
    trpc.user.createUserAiInstructionFromPublic.useMutation()
  const updateUserAiInstruction = trpc.user.updateUserAiInstruction.useMutation()
  const deleteUserAiInstruction = trpc.user.deleteUserAiInstruction.useMutation()
  const translateSentence = trpc.ai.translateSentence.useMutation()
  const {
    aiDialogOpen,
    aiInstructionDialogOpen,
    aiInstructionEditOpen,
    aiInstructionAddOpen,
    aiInstructionDeleteOpen,
    aiProviderAddOpen,
    aiProviderEditOpen,
    aiProviderDeleteId,
    aiProviderResetOpen,
  } = useAiDialogsState()
  const {
    setAiDialogOpen,
    setAiInstructionDialogOpen,
    setAiInstructionEditOpen,
    setAiInstructionAddOpen,
    setAiInstructionDeleteOpen,
    setAiProviderAddOpen,
    setAiProviderEditOpen,
    setAiProviderDeleteId,
    setAiProviderResetOpen,
  } = useAiDialogsActions()
  const aiRunIdRef = React.useRef(0)
  const aiDialogOpenRef = React.useRef(false)
  const aiInstructionDialogOpenRef = React.useRef(false)

  const aiInstructionList = React.useMemo(() => {
    const list = aiInstructionQuery.data ?? []
    return list
      .filter((instruction) => instruction.enabled)
      .slice()
      .sort((a, b) => {
        const defaultRank = Number(b.isDefault) - Number(a.isDefault)
        if (defaultRank !== 0) return defaultRank
        return a.name.localeCompare(b.name)
      })
  }, [aiInstructionQuery.data])

  const aiInstructionGroups = React.useMemo(() => {
    const groups = new Map<string, typeof aiInstructionList>()
    for (const instruction of aiInstructionList) {
      const list = groups.get(instruction.instructionType) ?? []
      list.push(instruction)
      groups.set(instruction.instructionType, list)
    }
    return Array.from(groups.entries())
  }, [aiInstructionList])

  const defaultInstructionId = React.useMemo(() => {
    return aiInstructionList.find((instruction) => instruction.isDefault)?.id ?? null
  }, [aiInstructionList])

  const resolveInstructionLabel = React.useCallback(
    (type: InstructionType) => {
      if (type === "translate") return t("ai.typeTranslate")
      if (type === "explain") return t("ai.typeExplain")
      return t("ai.typeCustom")
    },
    [t]
  )

  const resolveProvider = React.useCallback(
    (providerId: string | null) => {
      const defaultProvider =
        aiProvidersQuery.data?.find((item) => item.isDefault) ?? null
      if (providerId) {
        return aiProvidersQuery.data?.find((item) => item.id === providerId) ?? null
      }
      return defaultProvider
    },
    [aiProvidersQuery.data]
  )

  const resolveProviderModels = React.useCallback(
    (providerId: string | null) => {
      const provider = resolveProvider(providerId)
      return provider?.models ?? provider?.availableModels ?? []
    },
    [resolveProvider]
  )

  const missingNativeCount = React.useMemo(() => {
    if (!detail) return 0
    return detail.sentences.filter(
      (sentence) =>
        Boolean(sentence.targetText?.trim()) && !sentence.nativeText?.trim()
    ).length
  }, [detail])

  const updateSentenceTranslation = React.useCallback(
    (sentenceId: string, translation: string) => {
      const articleId = detail?.article.id
      if (!articleId) return
      utils.article.get.setData({ articleId }, (current) => {
        if (!current) return current
        return {
          ...current,
          sentences: current.sentences.map((sentence) =>
            sentence.id === sentenceId
              ? { ...sentence, nativeText: translation }
              : sentence
          ),
        }
      })
    },
    [detail?.article.id, utils.article.get]
  )

  const getTranslationTargets = React.useCallback(
    (missingOnly: boolean) => {
      if (!detail) return []
      return detail.sentences.filter((sentence) => {
        if (!sentence.targetText?.trim()) return false
        if (missingOnly) return !sentence.nativeText?.trim()
        return true
      })
    },
    [detail]
  )

  const startAiTranslation = React.useCallback(
    async (instructionId: string, missingOnly: boolean) => {
      if (aiProgress?.running) {
        toast.error(t("ai.translationInProgress"))
        return
      }
      if (!detail) {
        toast.error(t("ai.noArticleSelected"))
        return
      }
      const targets = getTranslationTargets(missingOnly)
      if (targets.length === 0) {
        toast.error(t(missingOnly ? "ai.noMissingTargets" : "ai.noTargets"))
        return
      }

      const runId = aiRunIdRef.current + 1
      aiRunIdRef.current = runId
      setAiLastInstructionId(instructionId)
      setAiProgress({
        instructionId,
        total: targets.length,
        completed: 0,
        running: true,
      })

      let completed = 0
      let failed = 0
      let index = 0
      const concurrency = Math.min(3, targets.length)

      const worker = async () => {
        while (true) {
          const nextIndex = index
          index += 1
          const sentence = targets[nextIndex]
          if (!sentence) return
          if (aiRunIdRef.current !== runId) return
          try {
            const result = await translateSentence.mutateAsync({
              sentenceId: sentence.id,
              instructionId,
            })
            if (aiRunIdRef.current !== runId) return
            updateSentenceTranslation(result.sentenceId, result.translation)
          } catch {
            failed += 1
          }
          if (aiRunIdRef.current !== runId) return
          completed += 1
          setAiProgress((prev) =>
            prev && prev.instructionId === instructionId
              ? { ...prev, completed }
              : prev
          )
        }
      }

      await Promise.all(Array.from({ length: concurrency }, () => worker()))

      if (aiRunIdRef.current !== runId) return
      setAiProgress((prev) => (prev ? { ...prev, running: false } : prev))
      if (failed > 0) {
        toast.error(t("ai.translationFailed", { count: failed }))
      } else {
        toast.success(t("ai.translationComplete", { count: targets.length }))
      }
    },
    [
      aiProgress?.running,
      detail,
      getTranslationTargets,
      setAiLastInstructionId,
      setAiProgress,
      t,
      translateSentence,
      updateSentenceTranslation,
    ]
  )

  const cancelAiTranslation = React.useCallback(() => {
    if (!aiProgress?.running) return
    aiRunIdRef.current += 1
    setAiProgress((prev) => (prev ? { ...prev, running: false } : prev))
    toast.success(t("ai.translationCanceled"))
  }, [aiProgress?.running, setAiProgress, t])

  const retryMissingTranslations = React.useCallback(() => {
    const instructionId = aiLastInstructionId ?? defaultInstructionId
    if (!instructionId) {
      toast.error(t("ai.noInstructionAvailable"))
      return
    }
    startAiTranslation(instructionId, true)
  }, [aiLastInstructionId, defaultInstructionId, startAiTranslation, t])

  React.useEffect(() => {
    if (!aiDialogOpen) {
      aiDialogOpenRef.current = false
      return
    }
    if (!aiDialogOpenRef.current) {
      setNewAiProviderName("")
      setNewAiProviderType("openai")
      setNewAiProviderApiUrl("")
      setNewAiProviderModels("")
      setNewAiProviderEnabled(true)
      setNewAiProviderApiKey("")
      setNewAiProviderKeyVisible(false)
      aiDialogOpenRef.current = true
    }
  }, [
    aiDialogOpen,
    setNewAiProviderName,
    setNewAiProviderType,
    setNewAiProviderApiUrl,
    setNewAiProviderModels,
    setNewAiProviderEnabled,
    setNewAiProviderApiKey,
    setNewAiProviderKeyVisible,
  ])

  React.useEffect(() => {
    if (!aiInstructionDialogOpen) {
      aiInstructionDialogOpenRef.current = false
      return
    }
    if (!aiInstructionDialogOpenRef.current) {
      aiInstructionDialogOpenRef.current = true
    }
  }, [aiInstructionDialogOpen])

  React.useEffect(() => {
    if (!aiInstructionDialogOpen) return
    const nextProviderId =
      aiProvidersQuery.data?.find((item) => item.isDefault)?.id ?? null
    if (nextProviderId !== aiInstructionAddProviderId) {
      setAiInstructionAddProviderId(nextProviderId)
    }
  }, [aiInstructionDialogOpen, aiInstructionAddProviderId, aiProvidersQuery.data, setAiInstructionAddProviderId])

  React.useEffect(() => {
    if (!aiInstructionAddOpen) return
    const providerId =
      aiInstructionAddProviderId ??
      aiProvidersQuery.data?.find((item) => item.isDefault)?.id ??
      null
    const models = resolveProviderModels(providerId)
    if (!models.length) {
      setAiInstructionAddModel(null)
      return
    }
    if (!aiInstructionAddModel || !models.includes(aiInstructionAddModel)) {
      setAiInstructionAddModel(models[0] ?? null)
    }
  }, [
    aiInstructionAddOpen,
    aiInstructionAddProviderId,
    aiInstructionAddModel,
    aiProvidersQuery.data,
    resolveProviderModels,
    setAiInstructionAddModel,
  ])

  const setDefaultProvider = React.useCallback(
    async (providerId: string) => {
      await updateAiProviderDefault.mutateAsync({ id: providerId })
      await aiProvidersQuery.refetch()
    },
    [aiProvidersQuery, updateAiProviderDefault]
  )

  const addAiProvider = React.useCallback(async () => {
    const name = newAiProviderName.trim()
    const apiUrl = newAiProviderApiUrl.trim()
    const models = newAiProviderModels
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
    if (!name || !apiUrl || models.length === 0) {
      toast.error(t("ai.addCustomError"))
      return
    }
    try {
      await createUserAiProvider.mutateAsync({
        name,
        providerType: newAiProviderType,
        apiUrl,
        models,
        enabled: newAiProviderEnabled,
        apiKey: useAiUserKey ? newAiProviderApiKey.trim() || null : null,
      })
      await aiProvidersQuery.refetch()
      setNewAiProviderName("")
      setNewAiProviderType("openai")
      setNewAiProviderApiUrl("")
      setNewAiProviderModels("")
      setNewAiProviderEnabled(true)
      setNewAiProviderApiKey("")
      setNewAiProviderKeyVisible(false)
      setAiProviderAddOpen(false)
      toast.success(t("ai.addCustomSuccess"))
    } catch (error) {
      const message = error instanceof Error ? error.message : t("ai.addCustomFailed")
      toast.error(message)
    }
  }, [
    aiProvidersQuery,
    createUserAiProvider,
    newAiProviderApiKey,
    newAiProviderApiUrl,
    newAiProviderEnabled,
    newAiProviderModels,
    newAiProviderName,
    newAiProviderType,
    setAiProviderAddOpen,
    setNewAiProviderApiKey,
    setNewAiProviderApiUrl,
    setNewAiProviderEnabled,
    setNewAiProviderKeyVisible,
    setNewAiProviderModels,
    setNewAiProviderName,
    setNewAiProviderType,
    t,
    useAiUserKey,
  ])

  const updateAiProvider = React.useCallback(async () => {
    if (!aiProviderEditing) return
    const models = aiProviderEditModels
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
    if (!aiProviderEditing.apiUrl.trim()) {
      toast.error(t("ai.baseUrlRequired"))
      return
    }
    try {
      await updateAiProviderConfig.mutateAsync({
        id: aiProviderEditing.id,
        apiUrl: aiProviderEditing.apiUrl.trim(),
        name: aiProviderEditing.isPublic ? undefined : aiProviderEditing.name ?? "",
        models,
        enabled: aiProviderEditing.enabled,
        apiKey: useAiUserKey ? aiProviderEditing.apiKey ?? "" : null,
      })
      await aiProvidersQuery.refetch()
      setAiProviderEditOpen(false)
      setAiProviderEditing(null)
      toast.success(t("ai.editProviderSuccess"))
    } catch (error) {
      const message = error instanceof Error ? error.message : t("common.updateFailed")
      toast.error(message)
    }
  }, [
    aiProviderEditModels,
    aiProviderEditing,
    aiProvidersQuery,
    setAiProviderEditOpen,
    setAiProviderEditing,
    t,
    updateAiProviderConfig,
    useAiUserKey,
  ])

  const removeAiProvider = React.useCallback(async () => {
    if (!aiProviderDeleteId) return
    try {
      await deleteAiProvider.mutateAsync({ id: aiProviderDeleteId })
      await aiProvidersQuery.refetch()
      setAiProviderDeleteId(null)
      toast.success(t("ai.deleteProviderSuccess"))
    } catch (error) {
      const message = error instanceof Error ? error.message : t("common.deleteFailed")
      toast.error(message)
    }
  }, [
    aiProviderDeleteId,
    aiProvidersQuery,
    deleteAiProvider,
    setAiProviderDeleteId,
    t,
  ])

  const resetAiProviders = React.useCallback(async () => {
    try {
      await resetAiProvidersToPublic.mutateAsync({ confirm: true })
      await aiProvidersQuery.refetch()
      setAiProviderResetOpen(false)
      toast.success(t("ai.resetSuccess"))
    } catch (error) {
      const message = error instanceof Error ? error.message : t("ai.resetFailed")
      toast.error(message)
    }
  }, [aiProvidersQuery, resetAiProvidersToPublic, setAiProviderResetOpen, t])

  return React.useMemo(
    () => ({
      aiProvidersQuery,
      aiInstructionQuery,
      publicAiInstructionQuery,
      aiDialogOpen,
      setAiDialogOpen,
      aiInstructionDialogOpen,
      setAiInstructionDialogOpen,
      aiInstructionEditOpen,
      setAiInstructionEditOpen,
      aiInstructionAddOpen,
      setAiInstructionAddOpen,
      aiInstructionDeleteOpen,
      setAiInstructionDeleteOpen,
      aiInstructionAddModel,
      setAiInstructionAddModel,
      aiInstructionEditing,
      setAiInstructionEditing,
      aiInstructionDeleteId,
      setAiInstructionDeleteId,
      aiInstructionAddProviderId,
      setAiInstructionAddProviderId,
      newAiProviderName,
      setNewAiProviderName,
      newAiProviderType,
      setNewAiProviderType,
      newAiProviderApiUrl,
      setNewAiProviderApiUrl,
      newAiProviderModels,
      setNewAiProviderModels,
      newAiProviderEnabled,
      setNewAiProviderEnabled,
      newAiProviderApiKey,
      setNewAiProviderApiKey,
      newAiProviderKeyVisible,
      setNewAiProviderKeyVisible,
      aiProviderAddOpen,
      setAiProviderAddOpen,
      aiProviderEditOpen,
      setAiProviderEditOpen,
      aiProviderEditing,
      setAiProviderEditing,
      aiProviderDeleteId,
      setAiProviderDeleteId,
      aiProviderEditKeyVisible,
      setAiProviderEditKeyVisible,
      aiProviderEditModels,
      setAiProviderEditModels,
      aiProviderResetOpen,
      setAiProviderResetOpen,
      aiProgress,
      setAiProgress,
      aiInstructionGroups,
      missingNativeCount,
      resolveInstructionLabel,
      resolveProviderModels,
      startAiTranslation,
      cancelAiTranslation,
      retryMissingTranslations,
      setDefaultProvider,
      addAiProvider,
      updateAiProvider,
      removeAiProvider,
      resetAiProviders,
      createInstructionFromPublic: createUserAiInstructionFromPublic.mutateAsync,
      updateInstruction: updateUserAiInstruction.mutateAsync,
      deleteInstruction: deleteUserAiInstruction.mutateAsync,
    }),
    [
      addAiProvider,
      aiDialogOpen,
      aiInstructionAddModel,
      aiInstructionAddOpen,
      aiInstructionAddProviderId,
      aiInstructionDeleteId,
      aiInstructionDeleteOpen,
      aiInstructionDialogOpen,
      aiInstructionEditOpen,
      aiInstructionEditing,
      aiInstructionGroups,
      aiInstructionQuery,
      aiProgress,
      aiProviderAddOpen,
      aiProviderDeleteId,
      aiProviderEditKeyVisible,
      aiProviderEditModels,
      aiProviderEditOpen,
      aiProviderEditing,
      aiProviderResetOpen,
      aiProvidersQuery,
      cancelAiTranslation,
      createUserAiInstructionFromPublic.mutateAsync,
      deleteUserAiInstruction.mutateAsync,
      missingNativeCount,
      newAiProviderApiKey,
      newAiProviderApiUrl,
      newAiProviderEnabled,
      newAiProviderKeyVisible,
      newAiProviderModels,
      newAiProviderName,
      newAiProviderType,
      publicAiInstructionQuery,
      removeAiProvider,
      resetAiProviders,
      resolveInstructionLabel,
      resolveProviderModels,
      retryMissingTranslations,
      setDefaultProvider,
      setAiDialogOpen,
      setAiInstructionAddModel,
      setAiInstructionAddOpen,
      setAiInstructionAddProviderId,
      setAiInstructionDeleteId,
      setAiInstructionDeleteOpen,
      setAiInstructionDialogOpen,
      setAiInstructionEditOpen,
      setAiInstructionEditing,
      setAiProgress,
      setAiProviderAddOpen,
      setAiProviderDeleteId,
      setAiProviderEditKeyVisible,
      setAiProviderEditModels,
      setAiProviderEditOpen,
      setAiProviderEditing,
      setAiProviderResetOpen,
      setNewAiProviderApiKey,
      setNewAiProviderApiUrl,
      setNewAiProviderEnabled,
      setNewAiProviderKeyVisible,
      setNewAiProviderModels,
      setNewAiProviderName,
      setNewAiProviderType,
      startAiTranslation,
      updateAiProvider,
      updateUserAiInstruction.mutateAsync,
    ]
  )
}

export type AiManagementApi = ReturnType<typeof useAiManagementState>

let latestAiManagementApi: AiManagementApi | null = null

export const useInitAiManagement = (params: UseAiManagementParams) => {
  const api = useAiManagementState(params)
  // eslint-disable-next-line react-hooks/globals
  latestAiManagementApi = api
  return api
}

export const useAiManagement = useInitAiManagement

export const useAiManagementRequired = () => {
  if (latestAiManagementApi) return latestAiManagementApi
  throw new Error("AiManagement API is not initialized.")
}
