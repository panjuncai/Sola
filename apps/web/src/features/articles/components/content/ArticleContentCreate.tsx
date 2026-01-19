import { CreateArticlePanel, useArticlesContext } from "@/features/articles"

export const ArticleContentCreate = () => {
  const { showCreate } = useArticlesContext()
  if (!showCreate) {
    return null
  }
  return <CreateArticlePanel />
}
