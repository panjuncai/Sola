import {
  useArticleCreateInputActions as useArticleCreateInputActionsAtom,
  useArticleCreateInputRef,
} from "../../atoms/articleCreate"

export const useArticleCreateInputState = () => ({
  inputRef: useArticleCreateInputRef(),
})

export const useArticleCreateInputActions = () =>
  useArticleCreateInputActionsAtom()
