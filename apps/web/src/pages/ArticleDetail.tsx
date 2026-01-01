import * as React from "react"
import { Link, useParams } from "react-router-dom"

import { Card, CardContent, CardHeader, CardTitle } from "@sola/ui"

import { trpc } from "@/lib/trpc"
import { useArticleStore } from "@/stores/useArticleStore"

function formatDate(value: number) {
  if (!Number.isFinite(value)) return "-"
  return new Date(value).toLocaleString()
}

export function ArticleDetail() {
  const { articleId } = useParams()
  const currentArticle = useArticleStore((state) => state.currentArticle)
  const sentences = useArticleStore((state) => state.sentences)
  const setCurrentArticle = useArticleStore((state) => state.setCurrentArticle)
  const clearCurrentArticle = useArticleStore((state) => state.clearCurrentArticle)

  const detailQuery = trpc.article.get.useQuery(
    { articleId: articleId ?? "" },
    { enabled: Boolean(articleId) }
  )

  React.useEffect(() => {
    clearCurrentArticle()
  }, [articleId, clearCurrentArticle])

  React.useEffect(() => {
    if (detailQuery.data) {
      setCurrentArticle(detailQuery.data.article, detailQuery.data.sentences)
    }
    if (detailQuery.isError) {
      clearCurrentArticle()
    }
  }, [detailQuery.data, detailQuery.isError, setCurrentArticle, clearCurrentArticle])

  const grouped = React.useMemo(() => {
    const groups = new Map<number, typeof sentences>()
    for (const sentence of sentences) {
      const list = groups.get(sentence.paragraphIndex) ?? []
      list.push(sentence)
      groups.set(sentence.paragraphIndex, list)
    }
    return Array.from(groups.entries()).sort((a, b) => a[0] - b[0])
  }, [sentences])

  if (detailQuery.isLoading) {
    return (
      <div className="mx-auto w-full max-w-3xl text-sm text-muted-foreground">
        Loading article...
      </div>
    )
  }

  if (!currentArticle) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-3">
        <p className="text-sm text-muted-foreground">Article not found.</p>
        <Link className="text-sm text-primary underline" to="/articles">
          Back to articles
        </Link>
      </div>
    )
  }

  const nativeFirst = currentArticle.displayOrder === "native_first"

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4">
      <div className="space-y-2">
        <Link className="text-sm text-primary underline" to="/articles">
          ← Back to articles
        </Link>
        <h1 className="text-2xl font-semibold">
          {currentArticle.title ?? "Untitled article"}
        </h1>
        <div className="text-sm text-muted-foreground">
          {currentArticle.sourceType === "word_list" ? "Word list" : "Article"} ·{" "}
          {currentArticle.nativeLanguage} → {currentArticle.targetLanguage} · Created{" "}
          {formatDate(currentArticle.createdAt)}
        </div>
      </div>

      <div className="space-y-3">
        {grouped.map(([paragraphIndex, items]) => (
          <Card key={paragraphIndex}>
            <CardHeader>
              <CardTitle className="text-base">Paragraph {paragraphIndex + 1}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((sentence) => (
                <div key={sentence.id} className="space-y-1">
                  {nativeFirst && sentence.nativeText ? (
                    <div className="text-sm text-muted-foreground">
                      {sentence.nativeText}
                    </div>
                  ) : null}
                  <div className="text-base">{sentence.targetText}</div>
                  {!nativeFirst && sentence.nativeText ? (
                    <div className="text-sm text-muted-foreground">
                      {sentence.nativeText}
                    </div>
                  ) : null}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
