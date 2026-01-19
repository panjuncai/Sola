import { atom, useAtom } from "jotai"
const articleContentAtom = atom("")
const selectedArticleIdsAtom = atom<string[]>([])
const activeArticleIdAtom = atom<string | null>(null)
const isCreatingArticleAtom = atom(false)

export const useArticlesState = () => {
  const [content, setContent] = useAtom(articleContentAtom)
  const [selectedIds, setSelectedIds] = useAtom(selectedArticleIdsAtom)
  const [activeArticleId, setActiveArticleId] = useAtom(activeArticleIdAtom)
  const [isCreating, setIsCreating] = useAtom(isCreatingArticleAtom)

  return {
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
