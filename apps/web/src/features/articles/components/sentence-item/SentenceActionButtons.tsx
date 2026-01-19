import { useTranslation } from "react-i18next"

import { useSentenceOperations } from "@/features/articles"
import { useArticleToolbarRequired } from "@/features/playback"

type SentenceActionButtonsProps = {
  sentence: {
    id: string
    nativeText: string | null
    targetText: string | null
  }
}

export const SentenceActionButtons = ({ sentence }: SentenceActionButtonsProps) => {
  const { t } = useTranslation()
  const { handleSentenceEdit, handleSentenceDelete } = useSentenceOperations()
  const { stopLoopPlayback } = useArticleToolbarRequired()

  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <button
        type="button"
        aria-label={t("article.editSentenceTitle")}
        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-transparent transition hover:bg-muted"
        onClick={() => {
          stopLoopPlayback()
          handleSentenceEdit(sentence)
        }}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
      </button>
      <button
        type="button"
        aria-label={t("article.deleteSentenceTitle")}
        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-transparent transition hover:bg-muted"
        onClick={() => {
          stopLoopPlayback()
          handleSentenceDelete(sentence.id)
        }}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 6h18" />
          <path d="M8 6V4h8v2" />
          <path d="M19 6l-1 14H6L5 6" />
        </svg>
      </button>
    </div>
  )
}
