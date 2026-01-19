import { useArticleToolbarView } from "../../../hooks/view/useArticleToolbarView"
import { ToolbarToggleButton } from "./ToolbarToggleButton"

export const ToolbarModeGroup = () => {
  const { t, toolbar, isCardMode, settings } = useArticleToolbarView()
  const {
    isRandomMode,
    isClozeEnabled,
    toggleRandomMode,
    toggleCloze,
    handleToggleCardMode,
  } = toolbar
  const { blurTarget, blurNative, handleToggleBlurTarget, handleToggleBlurNative } =
    settings

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-muted-foreground">
      <ToolbarToggleButton
        label={t("article.randomMode")}
        active={isRandomMode}
        onClick={toggleRandomMode}
      />
      <ToolbarToggleButton
        label={t("article.cardMode")}
        active={isCardMode}
        onClick={handleToggleCardMode}
      />
      <ToolbarToggleButton
        label={t("article.clozePractice")}
        active={isClozeEnabled}
        onClick={toggleCloze}
      />
      <ToolbarToggleButton
        label={t("article.maskTarget")}
        active={blurTarget}
        onClick={handleToggleBlurTarget}
      />
      <ToolbarToggleButton
        label={t("article.maskNative")}
        active={blurNative}
        onClick={handleToggleBlurNative}
      />
    </div>
  )
}
