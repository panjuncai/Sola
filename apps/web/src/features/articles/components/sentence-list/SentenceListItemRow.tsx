import { SentenceItem } from "../sentence-item/SentenceItem"

type SentenceListItemRowProps = {
  sentence: {
    id: string
    nativeText: string | null
    targetText: string | null
  }
}

export const SentenceListItemRow = ({ sentence }: SentenceListItemRowProps) => {
  return <SentenceItem sentence={sentence} />
}
