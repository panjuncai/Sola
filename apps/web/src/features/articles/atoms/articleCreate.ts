import { atom, useAtomValue, useSetAtom } from "jotai"
import type * as React from "react"

const uiCreateInputRefAtom = atom<React.RefObject<HTMLTextAreaElement | null> | null>(
  null
)

export const useArticleCreateInputRef = () => useAtomValue(uiCreateInputRefAtom)

export const useArticleCreateInputActions = () => ({
  setCreateInputRef: useSetAtom(uiCreateInputRefAtom),
})
