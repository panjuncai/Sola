import * as React from "react"
import type { TFunction } from "i18next"

import { Button, Card, CardContent } from "@sola/ui"

type CreateArticlePanelProps = {
  t: TFunction<"translation">
  inputRef: React.RefObject<HTMLTextAreaElement | null>
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  isSubmitting: boolean
  isError: boolean
}

export const CreateArticlePanel: React.FC<CreateArticlePanelProps> = ({
  t,
  inputRef,
  value,
  onChange,
  onSubmit,
  isSubmitting,
  isError,
}) => {
  return (
    <>
      <Card className="border-muted/60 shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
        <CardContent className="p-5">
          <div className="relative">
            <textarea
              ref={inputRef}
              rows={7}
              value={value}
              onChange={(event) => onChange(event.target.value)}
              placeholder={t("article.inputPlaceholder")}
              className="w-full resize-none rounded-2xl border bg-background px-4 py-4 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <Button
              type="button"
              className="absolute bottom-3 right-3 h-10 w-10 rounded-full p-0"
              disabled={!value.trim() || isSubmitting}
              onClick={onSubmit}
            >
              →
            </Button>
          </div>
        </CardContent>
      </Card>

      {isError ? (
        <div className="text-center text-sm text-destructive">
          {t("article.submitFailed")}
        </div>
      ) : null}
    </>
  )
}
