import { ArticleSidebarPanel } from "../shared/ArticleSidebarPanel"

export const ArticleSidebarDesktop = () => {
  return (
    <aside className="hidden md:flex md:w-72 md:flex-col md:border-r md:bg-muted/30 md:sticky md:top-0 md:h-screen md:overflow-hidden">
      <div className="h-16 px-5 flex items-center border-b">
        <div className="text-sm font-semibold tracking-wide">Sola</div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <ArticleSidebarPanel />
      </div>
    </aside>
  )
}
