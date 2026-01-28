import { CreateArticlePanel } from "../CreateArticlePanel"
import { useArticlesContext } from "../../hooks/init/useInitArticles"

export const ArticleContentCreate = () => {
  const { showCreate } = useArticlesContext()
  if (!showCreate) {
    return null
  }
  return <CreateArticlePanel />
}
