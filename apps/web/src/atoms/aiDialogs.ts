import { atom, useAtomValue, useSetAtom } from "jotai"

export const aiDialogOpenAtom = atom(false)
export const aiInstructionDialogOpenAtom = atom(false)
export const aiInstructionEditOpenAtom = atom(false)
export const aiInstructionAddOpenAtom = atom(false)
export const aiInstructionDeleteOpenAtom = atom(false)
export const aiProviderAddOpenAtom = atom(false)
export const aiProviderEditOpenAtom = atom(false)
export const aiProviderDeleteIdAtom = atom<string | null>(null)
export const aiProviderResetOpenAtom = atom(false)

export const useAiDialogsState = () => ({
  aiDialogOpen: useAtomValue(aiDialogOpenAtom),
  aiInstructionDialogOpen: useAtomValue(aiInstructionDialogOpenAtom),
  aiInstructionEditOpen: useAtomValue(aiInstructionEditOpenAtom),
  aiInstructionAddOpen: useAtomValue(aiInstructionAddOpenAtom),
  aiInstructionDeleteOpen: useAtomValue(aiInstructionDeleteOpenAtom),
  aiProviderAddOpen: useAtomValue(aiProviderAddOpenAtom),
  aiProviderEditOpen: useAtomValue(aiProviderEditOpenAtom),
  aiProviderDeleteId: useAtomValue(aiProviderDeleteIdAtom),
  aiProviderResetOpen: useAtomValue(aiProviderResetOpenAtom),
})

export const useAiDialogsActions = () => ({
  setAiDialogOpen: useSetAtom(aiDialogOpenAtom),
  setAiInstructionDialogOpen: useSetAtom(aiInstructionDialogOpenAtom),
  setAiInstructionEditOpen: useSetAtom(aiInstructionEditOpenAtom),
  setAiInstructionAddOpen: useSetAtom(aiInstructionAddOpenAtom),
  setAiInstructionDeleteOpen: useSetAtom(aiInstructionDeleteOpenAtom),
  setAiProviderAddOpen: useSetAtom(aiProviderAddOpenAtom),
  setAiProviderEditOpen: useSetAtom(aiProviderEditOpenAtom),
  setAiProviderDeleteId: useSetAtom(aiProviderDeleteIdAtom),
  setAiProviderResetOpen: useSetAtom(aiProviderResetOpenAtom),
})
