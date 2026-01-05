import * as React from "react"

import { trpc } from "@/lib/trpc"
import { useArticlesState } from "@/atoms/articles"

type UseArticlesParams = {
  deriveTitle: (content: string) => string
}

const useArticlesLogic = ({ deriveTitle }: UseArticlesParams) => {
  const {
    articles,
    setArticles,
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

  const showCreate = isCreating || articles.length === 0
  const activeArticleExists = React.useMemo(() => {
    if (!activeArticleId) return false
    const list = listQuery.data ?? articles
    return list.some((article) => article.id === activeArticleId)
  }, [activeArticleId, articles, listQuery.data])

  const detailQuery = trpc.article.get.useQuery(
    { articleId: activeArticleId ?? "" },
    {
      enabled:
        Boolean(activeArticleId) &&
        !showCreate &&
        (activeArticleExists || listQuery.isFetching),
      retry: false,
      onError: () => {
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
    if (listQuery.data) setArticles(listQuery.data)
  }, [listQuery.data, setArticles])

  React.useEffect(() => {
    if (!activeArticleId && !showCreate && articles.length > 0) {
      setActiveArticleId(articles[0]!.id)
    }
  }, [activeArticleId, articles, showCreate])

  React.useEffect(() => {
    if (!activeArticleId || showCreate) return
    if (listQuery.isFetching) return
    const list = listQuery.data ?? articles
    if (!list.some((article) => article.id === activeArticleId)) {
      setActiveArticleId(null)
      setIsCreating(true)
    }
  }, [activeArticleExists, activeArticleId, showCreate, listQuery.isFetching, listQuery.data, articles])

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
    articles,
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

export const useArticles = (params: UseArticlesParams) => {
  const api = useArticlesLogic(params)
  latestArticlesApi = api
  return api
}
