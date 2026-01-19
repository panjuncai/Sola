import { atom, useAtomValue, useSetAtom } from "jotai"

const bulkDeleteOpenAtom = atom(false)

export const useArticleDialogsState = () => ({
  bulkDeleteOpen: useAtomValue(bulkDeleteOpenAtom),
})

export const useArticleDialogsActions = () => ({
  setBulkDeleteOpen: useSetAtom(bulkDeleteOpenAtom),
})
