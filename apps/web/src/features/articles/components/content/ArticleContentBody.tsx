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
  const { detailQuery, showCreate } = useArticlesContext()
  const { isCardMode } = useCardModeState()

  if (showCreate) {
    if (children) {
      return <>{children}</>
    }
    return <ArticleContentToolbar />
  }

  if (detailQuery.isLoading) {
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
