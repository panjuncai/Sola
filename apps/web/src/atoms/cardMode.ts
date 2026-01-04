import { atom, useAtomValue, useSetAtom } from "jotai"

export const isCardModeAtom = atom(false)
export const cardIndexAtom = atom(0)
export const cardFlippedAtom = atom(false)
export const cardDragXAtom = atom(0)
export const cardDraggingAtom = atom(false)

export const useCardModeState = () => ({
  isCardMode: useAtomValue(isCardModeAtom),
  cardIndex: useAtomValue(cardIndexAtom),
  cardFlipped: useAtomValue(cardFlippedAtom),
  cardDragX: useAtomValue(cardDragXAtom),
  cardDragging: useAtomValue(cardDraggingAtom),
})

export const useCardModeActions = () => ({
  setIsCardMode: useSetAtom(isCardModeAtom),
  setCardIndex: useSetAtom(cardIndexAtom),
  setCardFlipped: useSetAtom(cardFlippedAtom),
  setCardDragX: useSetAtom(cardDragXAtom),
  setCardDragging: useSetAtom(cardDraggingAtom),
})
