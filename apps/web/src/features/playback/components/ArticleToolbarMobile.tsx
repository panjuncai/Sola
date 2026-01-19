import { useArticleToolbarView } from "../hooks/view/useArticleToolbarView"
import { ToolbarLoopGroup } from "./toolbar/mobile/ToolbarLoopGroup"
import { ToolbarModeGroup } from "./toolbar/mobile/ToolbarModeGroup"
import { ToolbarAiGroup } from "./toolbar/mobile/ToolbarAiGroup"
import { ToolbarProgress } from "./toolbar/mobile/ToolbarProgress"

export const ArticleToolbarMobile = () => {
  const {
    t,
    mobile,
  } = useArticleToolbarView()
  const { mobileToolbarOpen, toggleMobileToolbar } = mobile

  return (
    <div className="md:hidden">
      <button
        type="button"
        className="fixed bottom-6 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-background shadow-lg"
        onClick={toggleMobileToolbar}
        aria-label={t("common.open")}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 12h16" />
          <path d="M12 4v16" />
        </svg>
      </button>
      {mobileToolbarOpen ? (
        <div className="fixed bottom-20 right-4 z-50 w-[min(92vw,320px)] rounded-2xl border bg-background/95 p-3 shadow-2xl backdrop-blur">
          <div className="flex flex-col gap-3">
            <ToolbarLoopGroup />
            <ToolbarModeGroup />
            <ToolbarAiGroup />
            <ToolbarProgress />
          </div>
        </div>
      ) : null}
    </div>
  )
}
