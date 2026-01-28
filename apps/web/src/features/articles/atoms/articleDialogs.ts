import { atom, useAtomValue, useSetAtom } from "jotai"

const uiBulkDeleteOpenAtom = atom(false)

export const useArticleDialogsState = () => ({
  bulkDeleteOpen: useAtomValue(uiBulkDeleteOpenAtom),
})

export const useArticleDialogsActions = () => ({
  setBulkDeleteOpen: useSetAtom(uiBulkDeleteOpenAtom),
})
