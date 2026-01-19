import { ArticleSidebarContentStatesView } from "./ArticleSidebarContentStatesView"

type ArticleSidebarContentStatesProps = {
  isLoading: boolean
  isError: boolean
  isEmpty: boolean
}

const getSidebarContentVariant = ({
  isLoading,
  isError,
  isEmpty,
}: ArticleSidebarContentStatesProps) => {
  if (isLoading) return "loading"
  if (isError) return "error"
  if (isEmpty) return "empty"
  return null
}

export const ArticleSidebarContentStates = ({
  isLoading,
  isError,
  isEmpty,
}: ArticleSidebarContentStatesProps) => {
  const variant = getSidebarContentVariant({ isLoading, isError, isEmpty })
  return <ArticleSidebarContentStatesView variant={variant} />
}
