import * as React from "react"
import { useTranslation } from "react-i18next"

import { Button, Card, CardContent } from "@sola/ui"

import {
  ArticleCreateErrorState,
  useArticlesContext,
  useArticleCreateInputActions,
} from "@/features/articles"

export const CreateArticlePanel = () => {
  const { t } = useTranslation()
  const inputRef = React.useRef<HTMLTextAreaElement | null>(null)
  const { setCreateInputRef } = useArticleCreateInputActions()
  const { content, setContent, handleCreate, createMutation } = useArticlesContext()
  const isSubmitting = createMutation.isLoading
  const isError = createMutation.isError

  React.useEffect(() => {
    setCreateInputRef(inputRef)
    return () => setCreateInputRef(null)
  }, [setCreateInputRef])

  return (
    <>
      <Card className="border-muted/60 shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
        <CardContent className="p-5">
          <div className="relative">
            <textarea
              ref={inputRef}
              rows={7}
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder={t("article.inputPlaceholder")}
              className="w-full resize-none rounded-2xl border bg-background px-4 py-4 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <Button
              type="button"
              className="absolute bottom-3 right-3 h-10 w-10 rounded-full p-0"
              disabled={!content.trim() || isSubmitting}
              onClick={handleCreate}
            >
              →
            </Button>
          </div>
        </CardContent>
      </Card>

      {isError ? (
        <ArticleCreateErrorState />
      ) : null}
    </>
  )
}
