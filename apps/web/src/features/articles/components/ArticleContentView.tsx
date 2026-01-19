import { ArticleContentCreate } from "./content/ArticleContentCreate"
import { ArticleContentBody } from "./content/ArticleContentBody"

export const ArticleContentView = () => {
  return (
    <>
      <ArticleContentBody />
      <ArticleContentCreate />
    </>
  )
}
