import * as React from "react"
import type { TFunction } from "i18next"
import { useAtomValue } from "jotai"
import { useQueryClient } from "@tanstack/react-query"

import { toast } from "@sola/ui"

import { trpc } from "@/lib/trpc"
import { trpcAtom } from "@/lib/trpcAtom"
import { trpcClient } from "@/lib/trpcClient"
import {
  refreshAiInstructions as refreshAiInstructionsQuery,
  refreshAiProviders as refreshAiProvidersQuery,
  refreshArticleDetail as refreshArticleDetailQuery,
} from "@/lib/queryRefresh"
import type { ArticleDetailResponse } from "@sola/shared"
import { useAiDialogsActions, useAiDialogsState } from "../../atoms/aiDialogs"
import type { InstructionType } from "../../types"
import {
  type AiInstruction,
  useAiManagementState as useAiManagementAtomState,
} from "../../atoms/aiManagement"

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

const useAiManagementLogic = ({
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
  type AiProgress = typeof aiProgress
  const queryClient = useQueryClient()
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

  const refreshArticleDetail = React.useCallback(async () => {
    const articleId = detail?.article.id
    if (!articleId) return
    await refreshArticleDetailQuery(queryClient, articleId)
  }, [detail?.article.id, queryClient])

  const refreshAiProviders = React.useCallback(async () => {
    await refreshAiProvidersQuery(queryClient)
  }, [queryClient])

  const refreshAiInstructions = React.useCallback(async () => {
    await refreshAiInstructionsQuery(queryClient)
  }, [queryClient])

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
    const groups = new Map<string, AiInstruction[]>()
    for (const instruction of aiInstructionList) {
      const list = groups.get(instruction.instructionType) ?? []
      list.push(instruction)
      groups.set(instruction.instructionType, list)
    }
    return Array.from(groups.entries())
  }, [aiInstructionList])

  const defaultInstructionId = React.useMemo(
    () => aiInstructionList.find((instruction) => instruction.isDefault)?.id ?? null,
    [aiInstructionList]
  )

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
            await translateSentence.mutateAsync({
              sentenceId: sentence.id,
              instructionId,
            })
          } catch {
            failed += 1
          }
          if (aiRunIdRef.current !== runId) return
          completed += 1
          setAiProgress((prev: AiProgress) =>
            prev && prev.instructionId === instructionId
              ? { ...prev, completed }
              : prev
          )
        }
      }

      await Promise.all(Array.from({ length: concurrency }, () => worker()))

      if (aiRunIdRef.current !== runId) return
      await refreshArticleDetail()
      setAiProgress((prev: AiProgress) =>
        prev ? { ...prev, running: false } : prev
      )
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
      refreshArticleDetail,
    ]
  )

  const cancelAiTranslation = React.useCallback(() => {
    if (!aiProgress?.running) return
    aiRunIdRef.current += 1
    setAiProgress((prev: AiProgress) =>
      prev ? { ...prev, running: false } : prev
    )
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
  }, [
    aiInstructionDialogOpen,
    aiInstructionAddProviderId,
    aiProvidersQuery.data,
    setAiInstructionAddProviderId,
  ])

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
      await refreshAiProviders()
    },
    [refreshAiProviders, updateAiProviderDefault]
  )

  const addAiProvider = React.useCallback(async () => {
    const name = newAiProviderName.trim()
    const apiUrl = newAiProviderApiUrl.trim()
    const models = newAiProviderModels
      .split(",")
      .map((item: string) => item.trim())
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
      await refreshAiProviders()
      setNewAiProviderName("")
      setNewAiProviderType("openai")
      setNewAiProviderApiUrl("")
      setNewAiProviderModels("")
      setNewAiProviderEnabled(true)
      setNewAiProviderApiKey("")
      setNewAiProviderKeyVisible(false)
      setAiProviderAddOpen(false)
      toast.success(t("ai.addCustomSuccess"))
    } catch {
      // Error toast handled by global tRPC error handler.
    }
  }, [
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
    refreshAiProviders,
  ])

  const updateAiProvider = React.useCallback(async () => {
    if (!aiProviderEditing) return
    const models = aiProviderEditModels
      .split(",")
      .map((item: string) => item.trim())
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
      await refreshAiProviders()
      setAiProviderEditOpen(false)
      setAiProviderEditing(null)
      toast.success(t("ai.editProviderSuccess"))
    } catch {
      // Error toast handled by global tRPC error handler.
    }
  }, [
    aiProviderEditModels,
    aiProviderEditing,
    setAiProviderEditOpen,
    setAiProviderEditing,
    t,
    updateAiProviderConfig,
    useAiUserKey,
    refreshAiProviders,
  ])

  const removeAiProvider = React.useCallback(async () => {
    if (!aiProviderDeleteId) return
    try {
      await deleteAiProvider.mutateAsync({ id: aiProviderDeleteId })
      await refreshAiProviders()
      setAiProviderDeleteId(null)
      toast.success(t("ai.deleteProviderSuccess"))
    } catch {
      // Error toast handled by global tRPC error handler.
    }
  }, [
    aiProviderDeleteId,
    deleteAiProvider,
    setAiProviderDeleteId,
    t,
    refreshAiProviders,
  ])

  const resetAiProviders = React.useCallback(async () => {
    try {
      await resetAiProvidersToPublic.mutateAsync({ confirm: true })
      await refreshAiProviders()
      setAiProviderResetOpen(false)
      toast.success(t("ai.resetSuccess"))
    } catch {
      // Error toast handled by global tRPC error handler.
    }
  }, [refreshAiProviders, resetAiProvidersToPublic, setAiProviderResetOpen, t])

  const createInstructionFromPublic = React.useCallback(
    async (...args: Parameters<typeof createUserAiInstructionFromPublic.mutateAsync>) => {
      const result = await createUserAiInstructionFromPublic.mutateAsync(...args)
      await refreshAiInstructions()
      return result
    },
    [createUserAiInstructionFromPublic, refreshAiInstructions]
  )

  const updateInstruction = React.useCallback(
    async (...args: Parameters<typeof updateUserAiInstruction.mutateAsync>) => {
      const result = await updateUserAiInstruction.mutateAsync(...args)
      await refreshAiInstructions()
      return result
    },
    [refreshAiInstructions, updateUserAiInstruction]
  )

  const deleteInstruction = React.useCallback(
    async (...args: Parameters<typeof deleteUserAiInstruction.mutateAsync>) => {
      const result = await deleteUserAiInstruction.mutateAsync(...args)
      await refreshAiInstructions()
      return result
    },
    [deleteUserAiInstruction, refreshAiInstructions]
  )

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
      createInstructionFromPublic,
      updateInstruction,
      deleteInstruction,
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
      createInstructionFromPublic,
      deleteInstruction,
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
      updateInstruction,
    ]
  )
}

type AiManagementApi = ReturnType<typeof useAiManagementLogic>

export const useInitAiManagement = (params: UseAiManagementParams) => {
  const api = useAiManagementLogic(params)
  // eslint-disable-next-line react-hooks/globals
  latestAiManagementApi = api
  return api
}

export const useAiManagementRequired = () => {
  if (latestAiManagementApi) return latestAiManagementApi
  throw new Error("AiManagement API is not initialized.")
}

let latestAiManagementApi: AiManagementApi | null = null
