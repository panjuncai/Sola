import * as React from "react"

import { splitSentenceForCloze } from "@/utils/text"

type ClozeSegment = {
  kind: "same" | "extra" | "missing" | "mismatch"
  text: string
  parts?: { type: "same" | "extra" | "missing"; text: string }[]
}

export type ClozeResult = {
  correct: boolean
  segments: ClozeSegment[]
}

type ClozeSentence = {
  id: string
  nativeText: string | null
  targetText: string | null
}

type ClozeDetail = {
  sentences: ClozeSentence[]
  article: { targetLanguage: string }
}

type UseClozePracticeParams = {
  isClozeEnabled: boolean
  blurTarget: boolean
  setBlurTarget: React.Dispatch<React.SetStateAction<boolean>>
  activeArticleId: string | null
  detail: ClozeDetail | undefined
  stopLoopPlayback: () => void
  playSentenceRole: (sentence: ClozeSentence, role: "native" | "target") => Promise<boolean>
  setSelectedSentenceId: React.Dispatch<React.SetStateAction<string | null>>
  setSelectedSentenceRole: React.Dispatch<
    React.SetStateAction<"native" | "target" | null>
  >
  onPlayError: () => void
}

export const useClozePractice = ({
  isClozeEnabled,
  blurTarget,
  setBlurTarget,
  activeArticleId,
  detail,
  stopLoopPlayback,
  playSentenceRole,
  setSelectedSentenceId,
  setSelectedSentenceRole,
  onPlayError,
}: UseClozePracticeParams) => {
  const [clozeInputs, setClozeInputs] = React.useState<Record<string, string>>({})
  const [clozeRevealed, setClozeRevealed] = React.useState<Record<string, boolean>>(
    {}
  )
  const [clozeResults, setClozeResults] = React.useState<Record<string, ClozeResult>>(
    {}
  )
  const clozeBlurPrevRef = React.useRef<boolean | null>(null)

  const diffClozeChars = React.useCallback((expected: string, actual: string) => {
    const a = expected.split("")
    const b = actual.split("")
    const dp = Array.from({ length: a.length + 1 }, () =>
      new Array(b.length + 1).fill(0)
    )
    for (let i = 1; i <= a.length; i += 1) {
      for (let j = 1; j <= b.length; j += 1) {
        const aChar = a[i - 1]
        const bChar = b[j - 1]
        if (aChar === bChar) {
          dp[i]![j] = dp[i - 1]![j - 1]! + 1
        } else {
          dp[i]![j] = Math.max(dp[i - 1]![j]!, dp[i]![j - 1]!)
        }
      }
    }
    const ops: { type: "same" | "extra" | "missing"; char: string }[] = []
    let i = a.length
    let j = b.length
    while (i > 0 || j > 0) {
      const aChar = i > 0 ? a[i - 1] : undefined
      const bChar = j > 0 ? b[j - 1] : undefined
      if (i > 0 && j > 0 && aChar === bChar) {
        ops.push({ type: "same", char: aChar ?? "" })
        i -= 1
        j -= 1
      } else if (j > 0 && (i === 0 || dp[i]![j - 1]! >= dp[i - 1]![j]!)) {
        ops.push({ type: "extra", char: bChar ?? "" })
        j -= 1
      } else if (i > 0) {
        ops.push({ type: "missing", char: aChar ?? "" })
        i -= 1
      }
    }
    ops.reverse()
    const segments: { type: "same" | "extra" | "missing"; text: string }[] = []
    for (const op of ops) {
      const last = segments[segments.length - 1]
      if (last && last.type === op.type) {
        last.text += op.char
      } else {
        segments.push({ type: op.type, text: op.char })
      }
    }
    return segments
  }, [])

  const diffClozeTokens = React.useCallback(
    (expected: string[], actual: string[]): ClozeSegment[] => {
      const maxLen = Math.max(expected.length, actual.length)
      const segments: ClozeSegment[] = []
      for (let i = 0; i < maxLen; i += 1) {
        const exp = expected[i]
        const act = actual[i]
        if (exp && act) {
          if (exp === act) {
            segments.push({ kind: "same", text: exp })
          } else {
            segments.push({
              kind: "mismatch",
              text: "",
              parts: diffClozeChars(exp, act),
            })
          }
        } else if (exp) {
          segments.push({ kind: "missing", text: exp })
        } else if (act) {
          segments.push({ kind: "extra", text: act })
        }
      }
      return segments
    },
    [diffClozeChars]
  )

  React.useEffect(() => {
    if (isClozeEnabled) {
      if (clozeBlurPrevRef.current === null) {
        clozeBlurPrevRef.current = blurTarget
      }
      setBlurTarget(true)
    } else if (clozeBlurPrevRef.current !== null) {
      setBlurTarget(clozeBlurPrevRef.current)
      clozeBlurPrevRef.current = null
    }
  }, [isClozeEnabled, blurTarget, setBlurTarget])

  React.useEffect(() => {
    if (!isClozeEnabled) return
    setClozeInputs({})
    setClozeResults({})
    setClozeRevealed({})
  }, [isClozeEnabled, activeArticleId])

  const handleSentenceSelect = React.useCallback(
    (
      sentenceId: string,
      role: "native" | "target",
      isTarget: boolean,
      clozeEnabled: boolean,
      isRevealed: boolean
    ) => {
      stopLoopPlayback()
      setSelectedSentenceId(sentenceId)
      setSelectedSentenceRole(role)
      if (isTarget && clozeEnabled) {
        setClozeRevealed((prev) => ({
          ...prev,
          [sentenceId]: !isRevealed,
        }))
        return true
      }
      return false
    },
    [setSelectedSentenceId, setSelectedSentenceRole, stopLoopPlayback]
  )

  const handleClozeCheck = React.useCallback(
    async (sentenceId: string) => {
      if (!detail) return
      const sentence = detail.sentences.find((item) => item.id === sentenceId)
      if (!sentence?.targetText) return
      const input = clozeInputs[sentenceId] ?? ""
      const language = detail.article.targetLanguage
      const expectedTokens = splitSentenceForCloze(sentence.targetText, language)
      const inputTokens = splitSentenceForCloze(input, language)
      const segments = diffClozeTokens(expectedTokens, inputTokens)
      const correct =
        expectedTokens.length === inputTokens.length &&
        expectedTokens.every((token, index) => token === inputTokens[index])
      setClozeResults((prev) => ({
        ...prev,
        [sentenceId]: { correct, segments },
      }))

      stopLoopPlayback()
      setSelectedSentenceId(sentenceId)
      setSelectedSentenceRole("target")
      const ok = await playSentenceRole(sentence, "target")
      if (!ok) {
        onPlayError()
        return
      }
      if (!correct) return

      const currentIndex = detail.sentences.findIndex((item) => item.id === sentenceId)
      const next = detail.sentences
        .slice(currentIndex + 1)
        .find((item) => item.targetText && item.targetText.trim().length > 0)
      if (next) {
        setSelectedSentenceId(next.id)
        setSelectedSentenceRole("target")
      }
    },
    [
      clozeInputs,
      detail,
      diffClozeTokens,
      splitSentenceForCloze,
      onPlayError,
      playSentenceRole,
      setSelectedSentenceId,
      setSelectedSentenceRole,
      stopLoopPlayback,
    ]
  )

  return {
    clozeInputs,
    setClozeInputs,
    clozeRevealed,
    setClozeRevealed,
    clozeResults,
    setClozeResults,
    handleSentenceSelect,
    handleClozeCheck,
  }
}
