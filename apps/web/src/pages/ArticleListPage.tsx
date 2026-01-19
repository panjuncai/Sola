import { ArticleContentView } from "@/features/articles"
import {
  ArticleSidebar,
  ArticleMain,
  MobileHeader,
} from "@/features/articles"
import { ArticlesDialogs } from "@/features/articles"
import { AiDialogs } from "@/features/ai-management"
import { PlaybackDialogs } from "@/features/playback"
import { useArticleListPageView } from "@/features/articles"

export function ArticleListPage() {
  useArticleListPageView()

  return (
    <div className="w-full">
      <MobileHeader />

      <div className="md:flex">
        <ArticleSidebar />

        <ArticleMain>
          <ArticleContentView />
        </ArticleMain>
      </div>

      <ArticlesDialogs />
      <AiDialogs />
      <PlaybackDialogs />
    </div>
  )
}
