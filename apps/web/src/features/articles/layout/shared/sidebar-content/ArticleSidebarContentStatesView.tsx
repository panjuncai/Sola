import {
  ArticleListEmptyState,
  ArticleListErrorState,
  ArticleListLoadingState,
} from "../../../components/ArticleListStates"

type ArticleSidebarContentStatesViewProps = {
  variant: "loading" | "error" | "empty" | null
}

export const ArticleSidebarContentStatesView = ({
  variant,
}: ArticleSidebarContentStatesViewProps) => {
  if (variant === "loading") {
    return <ArticleListLoadingState />
  }

  if (variant === "error") {
    return <ArticleListErrorState />
  }

  if (variant === "empty") {
    return <ArticleListEmptyState />
  }

  return null
}
