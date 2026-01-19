import { ToolbarLoopGroup } from "./toolbar/desktop/ToolbarLoopGroup"
import { ToolbarModeGroup } from "./toolbar/desktop/ToolbarModeGroup"
import { ToolbarAiGroup } from "./toolbar/desktop/ToolbarAiGroup"
import { ToolbarProgress } from "./toolbar/desktop/ToolbarProgress"

export const ArticleToolbarDesktop = () => {
  return (
    <div className="hidden md:block">
      <div className="fixed top-0 left-0 right-0 md:left-72 z-40 border-b bg-background/95 px-4 md:px-12 py-2 backdrop-blur">
        <div className="flex flex-col items-center gap-2">
          <ToolbarLoopGroup />
          <ToolbarModeGroup />
          <ToolbarAiGroup />
          <ToolbarProgress />
        </div>
      </div>
      <div className="h-28 md:h-24" />
    </div>
  )
}
