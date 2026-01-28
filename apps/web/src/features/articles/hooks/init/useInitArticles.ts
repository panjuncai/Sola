import * as React from "react"
import { useAtomValue } from "jotai"
import { useQueryClient } from "@tanstack/react-query"

import { ArticleEntity } from "@sola/logic"

import { trpc } from "@/lib/trpc"
import { trpcAtom } from "@/lib/trpcAtom"
import { trpcClient } from "@/lib/trpcClient"
import { refreshArticleList } from "@/lib/queryRefresh"
import { useArticlesState } from "../../atoms/articles"

type UseArticlesParams = {
  deriveTitle: (content: string) => string
  routeArticleId?: string | null
}

const useArticlesLogic = ({ deriveTitle, routeArticleId }: UseArticlesParams) => {
  const {
    content,
    setContent,
    selectedIds,
    setSelectedIds,
    activeArticleId,
    setActiveArticleId,
    isCreating,
    setIsCreating,
  } = useArticlesState()
  const listQuery = useAtomValue(
    React.useMemo(
      () => trpcAtom("article.list", trpcClient.article.list, undefined),
      []
    )
  )
  const list = React.useMemo(() => listQuery.data ?? [], [listQuery.data])
  const isLoading = listQuery.isLoading
  const isError = listQuery.isError
  const queryClient = useQueryClient()

  const showCreate = isCreating || list.length === 0
  const activeArticleExists = React.useMemo(() => {
    if (!activeArticleId) return false
    return list.some((article) => article.id === activeArticleId)
  }, [activeArticleId, list])

  const detailQuery = useAtomValue(
    React.useMemo(
      () =>
        trpcAtom(
          "article.get",
          trpcClient.article.get,
          { articleId: activeArticleId ?? "" },
          {
            enabled:
              Boolean(activeArticleId) &&
              !showCreate &&
              (activeArticleExists || listQuery.isFetching),
            retry: false,
            placeholderData: (prev) => prev,
          }
        ),
      [
        activeArticleExists,
        activeArticleId,
        listQuery.isFetching,
        showCreate,
      ]
    )
  )
  React.useEffect(() => {
    if (routeArticleId) return
    if (!detailQuery.isError) return
    setActiveArticleId(null)
    setIsCreating(true)
  }, [detailQuery.isError, routeArticleId, setActiveArticleId, setIsCreating])

  const createMutation = trpc.article.create.useMutation({
    onSuccess: async (data) => {
      await refreshArticleList(queryClient)
      setContent("")
      setSelectedIds([])
      setIsCreating(false)
      setActiveArticleId(data.articleId)
    },
  })

  const deleteMutation = trpc.article.deleteMany.useMutation({
    onMutate: ({ articleIds }) => {
      if (activeArticleId && articleIds.includes(activeArticleId)) {
        setActiveArticleId(null)
        setIsCreating(true)
      }
    },
    onSuccess: async () => {
      await refreshArticleList(queryClient)
      setSelectedIds([])
      setIsCreating(false)
      setActiveArticleId(null)
    },
  })

  const deleteTargets =
    selectedIds.length > 0 ? selectedIds : activeArticleId ? [activeArticleId] : []

  React.useEffect(() => {
    if (routeArticleId) return
    if (!activeArticleId && !showCreate && list.length > 0) {
      setActiveArticleId(list[0]!.id)
    }
  }, [activeArticleId, list, routeArticleId, setActiveArticleId, showCreate])

  React.useEffect(() => {
    if (routeArticleId) return
    if (!activeArticleId || showCreate) return
    if (listQuery.isFetching) return
    if (!list.some((article) => article.id === activeArticleId)) {
      setActiveArticleId(null)
      setIsCreating(true)
    }
  }, [
    activeArticleExists,
    activeArticleId,
    listQuery.isFetching,
    list,
    routeArticleId,
    setActiveArticleId,
    setIsCreating,
    showCreate,
  ])

  const handleCreate = () => {
    const trimmed = content.trim()
    if (!trimmed) return
    const title = new ArticleEntity({
      id: "draft",
      title: null,
      content: trimmed,
    }).getTitle()
    createMutation.mutate({
      title: title ?? deriveTitle(trimmed),
      content: trimmed,
      sourceType: "article",
    })
  }

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  return {
    list,
    isLoading,
    isError,
    content,
    setContent,
    listQuery,
    detailQuery,
    activeArticleId,
    setActiveArticleId,
    isCreating,
    setIsCreating,
    selectedIds,
    setSelectedIds,
    showCreate,
    deleteTargets,
    handleCreate,
    toggleSelected,
    createMutation,
    deleteMutation,
  }
}

export const useArticlesContext = () => {
  if (!latestArticlesApi) {
    throw new Error("useArticlesContext must be initialized by useArticles.")
  }
  return latestArticlesApi
}

type ArticlesApi = ReturnType<typeof useArticlesLogic>

let latestArticlesApi: ArticlesApi | null = null

export const useInitArticles = (params: UseArticlesParams) => {
  const api = useArticlesLogic(params)
  // eslint-disable-next-line react-hooks/globals
  latestArticlesApi = api
  return api
}
