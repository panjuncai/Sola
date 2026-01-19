import { ArticleSidebarFooter } from "./ArticleSidebarFooter"
import { ArticleSidebarHeader } from "./ArticleSidebarHeader"
import { ArticleSidebarList } from "./ArticleSidebarList"

export const ArticleSidebarPanel = () => {
  return (
    <>
      <ArticleSidebarHeader />
      <ArticleSidebarList />
      <ArticleSidebarFooter />
    </>
  )
}
