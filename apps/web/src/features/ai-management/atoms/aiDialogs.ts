import { atom, useAtomValue, useSetAtom } from "jotai"

const aiDialogOpenAtom = atom(false)
const aiInstructionDialogOpenAtom = atom(false)
const aiInstructionEditOpenAtom = atom(false)
const aiInstructionAddOpenAtom = atom(false)
const aiInstructionDeleteOpenAtom = atom(false)
const aiProviderAddOpenAtom = atom(false)
const aiProviderEditOpenAtom = atom(false)
const aiProviderDeleteIdAtom = atom<string | null>(null)
const aiProviderResetOpenAtom = atom(false)

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
