import * as React from "react"
import { useTranslation } from "react-i18next"

import { useClozePractice } from "../../hooks/init/useInitClozePractice"
import type { ClozeResult } from "../../hooks/init/useInitClozePractice"

type SentenceClozeInputProps = {
  sentenceId: string
  targetLength: number
}

export const SentenceClozeInput = ({
  sentenceId,
  targetLength,
}: SentenceClozeInputProps) => {
  const { t } = useTranslation()
  const { clozeInputs, setClozeInputs, setClozeResults, handleClozeCheck } =
    useClozePractice()

  const value = clozeInputs[sentenceId] ?? ""

  const handleInputChange = React.useCallback(
    (nextValue: string) => {
      setClozeInputs((prev: Record<string, string>) => ({
        ...prev,
        [sentenceId]: nextValue,
      }))
      setClozeResults((prev: Record<string, ClozeResult>) => {
        if (!prev[sentenceId]) return prev
        const next = { ...prev }
        delete next[sentenceId]
        return next
      })
    },
    [sentenceId, setClozeInputs, setClozeResults]
  )

  return (
    <input
      className="h-9 w-full rounded-md border bg-background px-2 text-sm"
      placeholder={t("article.clozePlaceholder")}
      value={value}
      style={{
        maxWidth: "100%",
        width: `${Math.max(8, targetLength)}ch`,
      }}
      onChange={(event) => {
        handleInputChange(event.target.value)
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault()
          handleClozeCheck(sentenceId)
        }
      }}
    />
  )
}
