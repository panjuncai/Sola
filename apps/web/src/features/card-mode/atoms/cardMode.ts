import { atom, useAtomValue, useSetAtom } from "jotai"

const isCardModeAtom = atom(false)
const cardIndexAtom = atom(0)
const cardFlippedAtom = atom(false)
const cardDragXAtom = atom(0)
const cardDraggingAtom = atom(false)

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
