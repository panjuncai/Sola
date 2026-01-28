import { atom, useAtom } from "jotai"
const uiArticleContentAtom = atom("")
const uiSelectedArticleIdsAtom = atom<string[]>([])
const uiActiveArticleIdAtom = atom<string | null>(null)
const uiIsCreatingArticleAtom = atom(false)

export const useArticlesState = () => {
  const [content, setContent] = useAtom(uiArticleContentAtom)
  const [selectedIds, setSelectedIds] = useAtom(uiSelectedArticleIdsAtom)
  const [activeArticleId, setActiveArticleId] = useAtom(uiActiveArticleIdAtom)
  const [isCreating, setIsCreating] = useAtom(uiIsCreatingArticleAtom)

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
