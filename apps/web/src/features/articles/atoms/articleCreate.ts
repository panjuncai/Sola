import { atom, useAtomValue, useSetAtom } from "jotai"
import type * as React from "react"

const createInputRefAtom = atom<React.RefObject<HTMLTextAreaElement | null> | null>(
  null
)

export const useArticleCreateInputRef = () => useAtomValue(createInputRefAtom)

export const useArticleCreateInputActions = () => ({
  setCreateInputRef: useSetAtom(createInputRefAtom),
})
