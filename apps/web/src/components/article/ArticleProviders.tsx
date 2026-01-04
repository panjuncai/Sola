import * as React from "react"

import { AiManagementProvider } from "@/hooks/useAiManagement"
import { PlaybackProvider } from "@/hooks/usePlayback"
import { SettingsDialogsProvider } from "@/hooks/useSettingsDialogs"
import { SentenceOperationsProvider } from "@/hooks/useSentenceOperations"
import { ArticlesProvider } from "@/hooks/useArticles"
import type { useAiManagement } from "@/hooks/useAiManagement"
import type { usePlayback } from "@/hooks/usePlayback"
import type { useSettingsDialogs } from "@/hooks/useSettingsDialogs"
import type { useSentenceOperations } from "@/hooks/useSentenceOperations"
import type { useArticles } from "@/hooks/useArticles"

type ArticleProvidersProps = {
  aiManagement: ReturnType<typeof useAiManagement>
  articles: ReturnType<typeof useArticles>
  playback: ReturnType<typeof usePlayback>
  settingsDialogs: ReturnType<typeof useSettingsDialogs>
  sentenceOperations: ReturnType<typeof useSentenceOperations>
  children: React.ReactNode
}

export function ArticleProviders({
  aiManagement,
  articles,
  playback,
  settingsDialogs,
  sentenceOperations,
  children,
}: ArticleProvidersProps) {
  return (
    <AiManagementProvider value={aiManagement}>
      <ArticlesProvider value={articles}>
        <PlaybackProvider value={playback}>
          <SettingsDialogsProvider value={settingsDialogs}>
            <SentenceOperationsProvider value={sentenceOperations}>
              {children}
            </SentenceOperationsProvider>
          </SettingsDialogsProvider>
        </PlaybackProvider>
      </ArticlesProvider>
    </AiManagementProvider>
  )
}
