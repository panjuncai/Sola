import { atom, useAtom } from "jotai"

import type { ArticleListItem } from "@/stores/useArticleStore"

export const articlesAtom = atom<ArticleListItem[]>([])
export const articleContentAtom = atom("")
export const selectedArticleIdsAtom = atom<string[]>([])
export const activeArticleIdAtom = atom<string | null>(null)
export const isCreatingArticleAtom = atom(false)

export const useArticlesState = () => {
  const [articles, setArticles] = useAtom(articlesAtom)
  const [content, setContent] = useAtom(articleContentAtom)
  const [selectedIds, setSelectedIds] = useAtom(selectedArticleIdsAtom)
  const [activeArticleId, setActiveArticleId] = useAtom(activeArticleIdAtom)
  const [isCreating, setIsCreating] = useAtom(isCreatingArticleAtom)

  return {
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
  }
}
