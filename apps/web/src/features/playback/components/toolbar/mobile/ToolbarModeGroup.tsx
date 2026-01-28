import { useTranslation } from "react-i18next"

import { useCardModeState } from "@/features/card-mode"
import { useSettingsView } from "@/features/articles"
import { useArticleToolbarRequired } from "../../../hooks/init/useInitArticleToolbar"
import { ToolbarToggleRow } from "./ToolbarToggleRow"

export const ToolbarModeGroup = () => {
  const { t } = useTranslation()
  const toolbar = useArticleToolbarRequired()
  const { isCardMode } = useCardModeState()
  const settings = useSettingsView()
  const { toggleRandomMode, toggleCloze, handleToggleCardMode } = toolbar
  const { isRandomMode, isClozeEnabled } = toolbar
  const { blurTarget, blurNative, handleToggleBlurTarget, handleToggleBlurNative } =
    settings

  return (
    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
      <ToolbarToggleRow
        label={t("article.randomMode")}
        active={isRandomMode}
        onClick={toggleRandomMode}
      />
      <ToolbarToggleRow
        label={t("article.cardMode")}
        active={isCardMode}
        onClick={handleToggleCardMode}
      />
      <ToolbarToggleRow
        label={t("article.clozePractice")}
        active={isClozeEnabled}
        onClick={toggleCloze}
      />
      <ToolbarToggleRow
        label={t("article.maskTarget")}
        active={blurTarget}
        onClick={handleToggleBlurTarget}
      />
      <ToolbarToggleRow
        label={t("article.maskNative")}
        active={blurNative}
        onClick={handleToggleBlurNative}
      />
    </div>
  )
}
