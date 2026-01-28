import type {
  ArticleToolbarApi,
  UseArticleToolbarParams,
} from "../logic/toolbar/useArticleToolbarLogic"
import { useArticleToolbarLogic } from "../logic/toolbar/useArticleToolbarLogic"

export const useInitArticleToolbar = (params: UseArticleToolbarParams) => {
  const api = useArticleToolbarLogic(params)
  // eslint-disable-next-line react-hooks/globals
  latestArticleToolbarApi = api
  return api
}

export const useArticleToolbarRequired = () => {
  if (latestArticleToolbarApi) return latestArticleToolbarApi
  throw new Error("ArticleToolbar API is not initialized.")
}

let latestArticleToolbarApi: ArticleToolbarApi | null = null
