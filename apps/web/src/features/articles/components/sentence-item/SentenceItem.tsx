import { Card, CardContent } from "@sola/ui"

import { SentenceEntity } from "@sola/logic"

import { cn } from "@/lib/utils"
import { useSettingsView } from "../../hooks/view/useSettingsView"
import { useSentenceSelectionState } from "../../hooks/state/useSentenceSelectionState"
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
  const entity = new SentenceEntity(sentence)
  const ordered = entity.toDisplayItems(displayOrderSetting)
  const isActive =
    entity.id === playingSentenceId || entity.id === selectedSentenceId

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
          const isTarget = item.role === "target"
          return (
            <div key={item.role} className="space-y-1">
              <SentenceRoleRow
                sentence={sentence}
                role={item.role}
                text={item.text}
              />
              {isTarget && isClozeEnabled && entity.canCloze() ? (
                <div className="space-y-1 pl-4">
                  <SentenceClozeInput
                    sentenceId={entity.id}
                    targetLength={entity.getText("target").length || 8}
                  />
                  <SentenceClozeResult sentenceId={entity.id} />
                </div>
              ) : null}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
