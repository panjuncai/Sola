import { ArticleSidebarDesktop } from "./desktop/ArticleSidebarDesktop"
import { ArticleSidebarMobile } from "./mobile/ArticleSidebarMobile"

export const ArticleSidebar = () => {
  return (
    <>
      <ArticleSidebarMobile />
      <ArticleSidebarDesktop />
    </>
  )
}
