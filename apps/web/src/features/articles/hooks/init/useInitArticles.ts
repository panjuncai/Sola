import * as React from "react"

import { trpc } from "@/lib/trpc"
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
  const utils = trpc.useUtils()

  const listQuery = trpc.article.list.useQuery()
  const list = React.useMemo(() => listQuery.data ?? [], [listQuery.data])
  const isLoading = listQuery.isLoading
  const isError = listQuery.isError

  const showCreate = isCreating || list.length === 0
  const activeArticleExists = React.useMemo(() => {
    if (!activeArticleId) return false
    return list.some((article) => article.id === activeArticleId)
  }, [activeArticleId, list])

  const detailQuery = trpc.article.get.useQuery(
    { articleId: activeArticleId ?? "" },
    {
      keepPreviousData: true,
      enabled:
        Boolean(activeArticleId) &&
        !showCreate &&
        (activeArticleExists || listQuery.isFetching),
      retry: false,
      onError: () => {
        if (routeArticleId) return
        setActiveArticleId(null)
        setIsCreating(true)
      },
    }
  )

  const createMutation = trpc.article.create.useMutation({
    onSuccess: async (data) => {
      await utils.article.list.invalidate()
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
      await utils.article.list.invalidate()
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
    createMutation.mutate({
      title: deriveTitle(trimmed),
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

export const useArticles = useInitArticles
