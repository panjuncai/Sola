import { useClozePractice } from "@/features/articles"
import type { ClozeResult } from "@/features/articles"

type SentenceClozeResultProps = {
  sentenceId: string
}

export const SentenceClozeResult = ({ sentenceId }: SentenceClozeResultProps) => {
  const { clozeResults } = useClozePractice()
  const clozeResult = clozeResults[sentenceId]

  if (!clozeResult) return null

  return (
    <div className="text-xs">
      {clozeResult.segments.map(
        (segment: ClozeResult["segments"][number], index: number) => {
          const isLast = index === clozeResult.segments.length - 1
          const suffix = isLast ? "" : " "
          if (segment.kind === "same") {
            return (
              <span key={`same-${index}`} className="text-green-600">
                {segment.text}
                {suffix}
              </span>
            )
          }
          if (segment.kind === "extra") {
            return (
              <span key={`extra-${index}`} className="text-red-500 line-through">
                {segment.text}
                {suffix}
              </span>
            )
          }
          if (segment.kind === "missing") {
            return (
              <span key={`missing-${index}`} className="text-orange-500">
                ({segment.text})
                {suffix}
              </span>
            )
          }
          return (
            <span key={`mismatch-${index}`} className="text-orange-500">
              {segment.parts?.map(
                (
                  part: NonNullable<
                    ClozeResult["segments"][number]["parts"]
                  >[number],
                  partIndex: number
                ) => {
                  if (part.type === "same") {
                    return (
                      <span
                        key={`part-same-${partIndex}`}
                        className="text-green-600"
                      >
                        {part.text}
                      </span>
                    )
                  }
                  if (part.type === "extra") {
                    return (
                      <span
                        key={`part-extra-${partIndex}`}
                        className="text-red-500 line-through"
                      >
                        {part.text}
                      </span>
                    )
                  }
                  return (
                    <span
                      key={`part-missing-${partIndex}`}
                      className="text-orange-500"
                    >
                      ({part.text})
                    </span>
                  )
                }
              )}
              {suffix}
            </span>
          )
        }
      )}
    </div>
  )
}
