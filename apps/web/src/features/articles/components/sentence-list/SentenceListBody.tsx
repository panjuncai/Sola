import { SentenceListItemRow } from "./SentenceListItemRow"

type SentenceListBodyProps = {
  sentences: Array<{
    id: string
    nativeText: string | null
    targetText: string | null
  }>
}

export const SentenceListBody = ({ sentences }: SentenceListBodyProps) => {
  return (
    <>
      {sentences.map((sentence) => (
        <SentenceListItemRow key={sentence.id} sentence={sentence} />
      ))}
    </>
  )
}
