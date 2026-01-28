import { atom, useAtomValue, useSetAtom } from "jotai"

const uiIsCardModeAtom = atom(false)
const uiCardIndexAtom = atom(0)
const uiCardFlippedAtom = atom(false)
const uiCardDragXAtom = atom(0)
const uiCardDraggingAtom = atom(false)

export const useCardModeState = () => ({
  isCardMode: useAtomValue(uiIsCardModeAtom),
  cardIndex: useAtomValue(uiCardIndexAtom),
  cardFlipped: useAtomValue(uiCardFlippedAtom),
  cardDragX: useAtomValue(uiCardDragXAtom),
  cardDragging: useAtomValue(uiCardDraggingAtom),
})

export const useCardModeActions = () => ({
  setIsCardMode: useSetAtom(uiIsCardModeAtom),
  setCardIndex: useSetAtom(uiCardIndexAtom),
  setCardFlipped: useSetAtom(uiCardFlippedAtom),
  setCardDragX: useSetAtom(uiCardDragXAtom),
  setCardDragging: useSetAtom(uiCardDraggingAtom),
})
