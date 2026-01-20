import { CardModeView, useCardModeState } from "@/features/card-mode"

import {
  ArticleContentLoadingState,
  SentenceList,
  useArticlesContext,
} from "@/features/articles"
import { ArticleContentBodyShell } from "./ArticleContentBodyShell"
import { ArticleContentToolbar } from "./ArticleContentToolbar"

type ArticleContentBodyProps = {
  children?: React.ReactNode
}

export const ArticleContentBody = ({ children }: ArticleContentBodyProps) => {
  const { detailQuery, showCreate, activeArticleId } = useArticlesContext()
  const { isCardMode } = useCardModeState()

  if (showCreate) {
    if (children) {
      return <>{children}</>
    }
    return <ArticleContentToolbar />
  }

  const detailId = detailQuery.data?.article.id ?? null
  if (detailQuery.isLoading || (activeArticleId && detailId !== activeArticleId)) {
    return <ArticleContentLoadingState />
  }

  if (children) {
    return <>{children}</>
  }

  if (!detailQuery.data) {
    return null
  }

  return (
    <ArticleContentBodyShell>
      <ArticleContentToolbar />
      {isCardMode ? <CardModeView /> : <SentenceList />}
    </ArticleContentBodyShell>
  )
}
