import { useTranslation } from "react-i18next"
import { DialogCloseButton } from "@sola/ui"
import { useArticleToolbarRequired } from "../../../hooks/init/useInitArticleToolbar"
import { ToolbarIconButton } from "./ToolbarIconButton"

type ToolbarLoopGroupProps = {
  closeMobileToolbar: () => void
}

export const ToolbarLoopGroup = ({ closeMobileToolbar }: ToolbarLoopGroupProps) => {
  const { t } = useTranslation()
  const toolbar = useArticleToolbarRequired()
  const {
    stopLoopPlayback,
    startLoopAll,
    startLoopTarget,
    startLoopSingle,
    handleToggleShadowing,
  } = toolbar
  const { isLoopingAll, isLoopingTarget, isLoopingSingle, isLoopingShadowing } =
    toolbar

  return (
    <>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          {t("article.loopAll")}
        </span>
        <DialogCloseButton
          label={t("common.close")}
          variant="ghost"
          className="text-xs text-muted-foreground"
          onClick={closeMobileToolbar}
        />
      </div>
      <div className="flex items-center justify-center gap-2 rounded-full bg-muted/40 px-3 py-2">
        <ToolbarIconButton
          active={isLoopingAll}
          label={t("article.loopAll")}
          onClick={() => {
            if (isLoopingAll) stopLoopPlayback()
            else startLoopAll()
          }}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 12a9 9 0 0 1 15.5-6.4" />
            <path d="M18.5 5.6H21V3" />
            <path d="M21 12a9 9 0 0 1-15.5 6.4" />
            <path d="M5.5 18.4H3V21" />
          </svg>
        </ToolbarIconButton>
        <ToolbarIconButton
          active={isLoopingTarget}
          label={t("article.loopTarget")}
          onClick={() => {
            if (isLoopingTarget) stopLoopPlayback()
            else startLoopTarget()
          }}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="7" />
            <path d="M12 5v2" />
            <circle cx="12" cy="12" r="2.5" />
          </svg>
        </ToolbarIconButton>
        <ToolbarIconButton
          active={isLoopingSingle}
          label={t("article.loopSingle")}
          onClick={() => {
            if (isLoopingSingle) stopLoopPlayback()
            else startLoopSingle()
          }}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 7h9a4 4 0 0 1 4 4v6" />
            <path d="M7 10 4 7l3-3" />
            <path d="M20 17H11a4 4 0 0 1-4-4V7" />
            <path d="M17 14l3 3-3 3" />
          </svg>
        </ToolbarIconButton>
        <ToolbarIconButton
          active={isLoopingShadowing}
          label={t("article.shadowing")}
          onClick={handleToggleShadowing}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 16c3.5 0 3.5-4 7-4s3.5 4 7 4 3.5-4 7-4" />
            <path d="M3 20c3.5 0 3.5-4 7-4s3.5 4 7 4 3.5-4 7-4" />
          </svg>
        </ToolbarIconButton>
      </div>
    </>
  )
}
