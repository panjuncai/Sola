import * as React from "react"

import type { ArticleDetail, ArticleSentence } from "@sola/shared"

import { splitSentenceForCloze } from "@sola/logic"
import { useClozePracticeActions, useClozePracticeState } from "../state/useClozePracticeState"
import { useSentenceSelectionActions } from "../state/useSentenceSelectionState"

type ClozeSegment = {
  kind: "same" | "extra" | "missing" | "mismatch"
  text: string
  parts?: { type: "same" | "extra" | "missing"; text: string }[]
}

export type ClozeResult = {
  correct: boolean
  segments: ClozeSegment[]
}

type ClozeDetail = {
  sentences: ArticleSentence[]
  article: Pick<ArticleDetail, "targetLanguage">
}

type UseClozePracticeParams = {
  isClozeEnabled: boolean
  blurTarget: boolean
  setBlurTarget: (value: boolean) => void
  activeArticleId: string | null
  detail: ClozeDetail | undefined
  stopLoopPlayback: () => void
  playSentenceRole: (
    sentence: ArticleSentence,
    role: "native" | "target"
  ) => Promise<boolean>
  onPlayError: () => void
}

const useClozePracticeLogic = ({
  isClozeEnabled,
  blurTarget,
  setBlurTarget,
  activeArticleId,
  detail,
  stopLoopPlayback,
  playSentenceRole,
  onPlayError,
}: UseClozePracticeParams) => {
  const { clozeInputs, clozeRevealed, clozeResults } = useClozePracticeState()
  const { setClozeInputs, setClozeRevealed, setClozeResults } =
    useClozePracticeActions()
  const { setSelectedSentenceId, setSelectedSentenceRole } =
    useSentenceSelectionActions()
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
      if (!blurTarget) {
        setBlurTarget(true)
      }
    } else if (clozeBlurPrevRef.current !== null) {
      if (blurTarget !== clozeBlurPrevRef.current) {
        setBlurTarget(clozeBlurPrevRef.current)
      }
      clozeBlurPrevRef.current = null
    }
  }, [isClozeEnabled, blurTarget, setBlurTarget])

  React.useEffect(() => {
    if (!isClozeEnabled) return
    setClozeInputs({})
    setClozeResults({})
    setClozeRevealed({})
  }, [
    activeArticleId,
    isClozeEnabled,
    setClozeInputs,
    setClozeResults,
    setClozeRevealed,
  ])

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
        setClozeRevealed((prev: Record<string, boolean>) => ({
          ...prev,
          [sentenceId]: !isRevealed,
        }))
        return true
      }
      return false
    },
    [
      setClozeRevealed,
      setSelectedSentenceId,
      setSelectedSentenceRole,
      stopLoopPlayback,
    ]
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
        expectedTokens.every(
          (token: string, index: number) => token === inputTokens[index]
        )
      setClozeResults((prev: Record<string, ClozeResult>) => ({
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
      onPlayError,
      playSentenceRole,
      setClozeResults,
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

type ClozePracticeApi = ReturnType<typeof useClozePracticeLogic>

let latestClozePracticeApi: ClozePracticeApi | null = null

export const useInitClozePractice = (params: UseClozePracticeParams) => {
  const api = useClozePracticeLogic(params)
  // eslint-disable-next-line react-hooks/globals
  latestClozePracticeApi = api
  return api
}

export const useClozePractice = () => {
  if (latestClozePracticeApi) return latestClozePracticeApi
  throw new Error("ClozePractice API is not initialized.")
}
