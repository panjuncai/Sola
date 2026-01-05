import * as React from "react"

import { AiManagementProvider } from "@/hooks/useAiManagement"
import { PlaybackProvider } from "@/hooks/usePlayback"
import { ArticlesProvider } from "@/hooks/useArticles"
import type { useAiManagement } from "@/hooks/useAiManagement"
import type { usePlayback } from "@/hooks/usePlayback"
import type { useArticles } from "@/hooks/useArticles"

type ArticleProvidersProps = {
  aiManagement: ReturnType<typeof useAiManagement>
  articles: ReturnType<typeof useArticles>
  playback: ReturnType<typeof usePlayback>
  children: React.ReactNode
}

export function ArticleProviders({
  aiManagement,
  articles,
  playback,
  children,
}: ArticleProvidersProps) {
  return (
    <AiManagementProvider value={aiManagement}>
      <ArticlesProvider value={articles}>
        <PlaybackProvider value={playback}>
          {children}
        </PlaybackProvider>
      </ArticlesProvider>
    </AiManagementProvider>
  )
}
