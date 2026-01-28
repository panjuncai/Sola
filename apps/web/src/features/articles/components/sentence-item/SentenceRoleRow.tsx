import * as React from "react"
import { useTranslation } from "react-i18next"

import { cn, toast } from "@sola/ui"

import { SentenceEntity } from "@sola/logic"

import { useClozePractice } from "../../hooks/init/useInitClozePractice"
import { useSentenceSelectionState } from "../../hooks/state/useSentenceSelectionState"
import { useSettingsView } from "../../hooks/view/useSettingsView"
import { useArticleToolbarRequired } from "@/features/playback"
import { useArticleToolbarState } from "@/features/playback"
import { usePlaybackRequired, usePlaybackState } from "@/features/playback"

type SentenceRoleRowProps = {
  sentence: {
    id: string
    nativeText: string | null
    targetText: string | null
  }
  role: "native" | "target"
  text: string
}

export const SentenceRoleRow = ({ sentence, role, text }: SentenceRoleRowProps) => {
  const { t } = useTranslation()
  const { playSentenceRole } = usePlaybackRequired()
  const { playingSentenceId, playingRole, playingSpeed } = usePlaybackState()
  const { selectedSentenceId, selectedSentenceRole } = useSentenceSelectionState()
  const { blurTarget, blurNative } = useSettingsView()
  const { isClozeEnabled } = useArticleToolbarState()
  const { markUserSelected } = useArticleToolbarRequired()
  const { clozeRevealed, handleSentenceSelect } = useClozePractice()
  const entity = new SentenceEntity(sentence)

  const isTarget = role === "target"
  const isPlaying = sentence.id === playingSentenceId && playingRole === role
  const isSelected = sentence.id === selectedSentenceId && selectedSentenceRole === role
  const isRevealed = clozeRevealed[sentence.id] === true
  const shouldBlur =
    isTarget && isClozeEnabled ? !isRevealed : isTarget && blurTarget

  const handlePlayError = React.useCallback(() => {
    toast.error(t("tts.audioPlayFailed"))
  }, [t])

  return (
    <div
      className={cn(
        "relative flex items-start gap-2 rounded-md border border-muted/20 px-2.5 py-1 text-base transition",
        isPlaying && "font-medium",
        isSelected &&
          "border-white/30 shadow-[0_1px_3px_rgba(15,23,42,0.05)] ring-1 ring-white/40"
      )}
      role="button"
      tabIndex={0}
      onClick={() => {
        markUserSelected()
        const skipPlay = handleSentenceSelect(
          sentence.id,
          role,
          isTarget,
          isClozeEnabled,
          isRevealed
        )
        if (skipPlay) return
        if (!entity.isPlayable(role)) return
        playSentenceRole(sentence, role)
          .then((ok) => {
            if (!ok) handlePlayError()
          })
          .catch(() => {})
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          markUserSelected()
          const skipPlay = handleSentenceSelect(
            sentence.id,
            role,
            isTarget,
            isClozeEnabled,
            isRevealed
          )
          if (skipPlay) return
          if (!entity.isPlayable(role)) return
          playSentenceRole(sentence, role)
            .then((ok) => {
              if (!ok) handlePlayError()
            })
            .catch(() => {})
        }
      }}
    >
      {isPlaying ? (
        <span className="absolute right-2 top-1 text-[11px] text-muted-foreground/80">
          {(playingSpeed ?? 1).toFixed(1)}×
        </span>
      ) : null}
      <span
        className={cn(
          "mt-1 h-3 w-1.5 rounded-full",
          role === "native" ? "bg-blue-500" : "bg-orange-500"
        )}
      />
      <span
        className={cn(
          "leading-relaxed",
          (isPlaying || isSelected) &&
            (role === "native" ? "text-blue-600" : "text-orange-500"),
          role === "native" && blurNative && "blur-sm",
          shouldBlur && "blur-sm"
        )}
      >
        {text}
      </span>
    </div>
  )
}
