import { SentenceListBody } from "./sentence-list/SentenceListBody"
import { SentenceListEmptyState } from "./sentence-list/SentenceListEmptyState"
import { useArticlesContext } from "@/features/articles"

export const SentenceList = () => {
  const { detailQuery } = useArticlesContext()
  const detail = detailQuery.data

  if (!detail) return null

  if (detail.sentences.length === 0) {
    return <SentenceListEmptyState />
  }

  return <SentenceListBody sentences={detail.sentences} />
}
