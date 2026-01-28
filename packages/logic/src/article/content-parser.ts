export type SentenceDraft = {
  orderIndex: number
  paragraphIndex: number
  targetText: string
}

export function splitWordList(content: string): SentenceDraft[] {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
  return lines.map((line, index) => ({
    orderIndex: index,
    paragraphIndex: 0,
    targetText: line,
  }))
}

export function splitArticleContent(content: string): SentenceDraft[] {
  const normalized = content.replace(/\r\n/g, "\n").trim()
  const paragraphs = normalized
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
  const sentences: SentenceDraft[] = []
  let orderIndex = 0

  paragraphs.forEach((paragraph, paragraphIndex) => {
    const lines = paragraph
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean)
    if (lines.length === 0) return

    for (const line of lines) {
      const parts = line
        .split(/(?<=[.!?。！？])\s+/)
        .map((part) => part.trim())
        .filter(Boolean)

      if (parts.length === 0) {
        sentences.push({
          orderIndex: orderIndex++,
          paragraphIndex,
          targetText: line,
        })
        continue
      }

      for (const part of parts) {
        sentences.push({
          orderIndex: orderIndex++,
          paragraphIndex,
          targetText: part,
        })
      }
    }
  })

  if (sentences.length === 0 && normalized) {
    sentences.push({
      orderIndex: 0,
      paragraphIndex: 0,
      targetText: normalized,
    })
  }

  return sentences
}

export function deriveTitle(content: string) {
  return content.trim().slice(0, 10)
}
