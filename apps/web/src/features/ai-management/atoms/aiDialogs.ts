import { atom, useAtomValue, useSetAtom } from "jotai"

const uiAiDialogOpenAtom = atom(false)
const uiAiInstructionDialogOpenAtom = atom(false)
const uiAiInstructionEditOpenAtom = atom(false)
const uiAiInstructionAddOpenAtom = atom(false)
const uiAiInstructionDeleteOpenAtom = atom(false)
const uiAiProviderAddOpenAtom = atom(false)
const uiAiProviderEditOpenAtom = atom(false)
const uiAiProviderDeleteIdAtom = atom<string | null>(null)
const uiAiProviderResetOpenAtom = atom(false)

export const useAiDialogsState = () => ({
  aiDialogOpen: useAtomValue(uiAiDialogOpenAtom),
  aiInstructionDialogOpen: useAtomValue(uiAiInstructionDialogOpenAtom),
  aiInstructionEditOpen: useAtomValue(uiAiInstructionEditOpenAtom),
  aiInstructionAddOpen: useAtomValue(uiAiInstructionAddOpenAtom),
  aiInstructionDeleteOpen: useAtomValue(uiAiInstructionDeleteOpenAtom),
  aiProviderAddOpen: useAtomValue(uiAiProviderAddOpenAtom),
  aiProviderEditOpen: useAtomValue(uiAiProviderEditOpenAtom),
  aiProviderDeleteId: useAtomValue(uiAiProviderDeleteIdAtom),
  aiProviderResetOpen: useAtomValue(uiAiProviderResetOpenAtom),
})

export const useAiDialogsActions = () => ({
  setAiDialogOpen: useSetAtom(uiAiDialogOpenAtom),
  setAiInstructionDialogOpen: useSetAtom(uiAiInstructionDialogOpenAtom),
  setAiInstructionEditOpen: useSetAtom(uiAiInstructionEditOpenAtom),
  setAiInstructionAddOpen: useSetAtom(uiAiInstructionAddOpenAtom),
  setAiInstructionDeleteOpen: useSetAtom(uiAiInstructionDeleteOpenAtom),
  setAiProviderAddOpen: useSetAtom(uiAiProviderAddOpenAtom),
  setAiProviderEditOpen: useSetAtom(uiAiProviderEditOpenAtom),
  setAiProviderDeleteId: useSetAtom(uiAiProviderDeleteIdAtom),
  setAiProviderResetOpen: useSetAtom(uiAiProviderResetOpenAtom),
})
