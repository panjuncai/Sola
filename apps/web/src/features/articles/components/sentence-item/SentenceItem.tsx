import { Card, CardContent } from "@sola/ui"

import { cn } from "@/lib/utils"
import { useSettingsView, useSentenceSelectionState } from "@/features/articles"
import { useArticleToolbarState, usePlaybackState } from "@/features/playback"

import { SentenceActionButtons } from "./SentenceActionButtons"
import { SentenceClozeInput } from "./SentenceClozeInput"
import { SentenceClozeResult } from "./SentenceClozeResult"
import { SentenceRoleRow } from "./SentenceRoleRow"

type SentenceItemProps = {
  sentence: {
    id: string
    nativeText: string | null
    targetText: string | null
  }
}

export const SentenceItem = ({ sentence }: SentenceItemProps) => {
  const { displayOrderSetting } = useSettingsView()
  const { isClozeEnabled } = useArticleToolbarState()
  const { playingSentenceId } = usePlaybackState()
  const { selectedSentenceId } = useSentenceSelectionState()
  const nativeFirst = displayOrderSetting === "native_first"
  const items = [
    { role: "native" as const, text: sentence.nativeText ?? "" },
    { role: "target" as const, text: sentence.targetText ?? "" },
  ]
  const ordered = nativeFirst ? items : items.slice().reverse()
  const isActive = sentence.id === playingSentenceId || sentence.id === selectedSentenceId

  return (
    <Card className="border-0 shadow-none">
      <CardContent
        className={cn(
          "space-y-1.5 rounded-xl bg-muted/20 px-3 py-2 text-sm transition",
          isActive && "border-2 border-emerald-500/80"
        )}
      >
        <SentenceActionButtons sentence={sentence} />
        {ordered.map((item) => {
          if (!item.text) return null
          const isTarget = item.role === "target"
          return (
            <div key={item.role} className="space-y-1">
              <SentenceRoleRow
                sentence={sentence}
                role={item.role}
                text={item.text}
              />
              {isTarget && isClozeEnabled ? (
                <div className="space-y-1 pl-4">
                  <SentenceClozeInput
                    sentenceId={sentence.id}
                    targetLength={sentence.targetText?.length ?? 8}
                  />
                  <SentenceClozeResult sentenceId={sentence.id} />
                </div>
              ) : null}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
