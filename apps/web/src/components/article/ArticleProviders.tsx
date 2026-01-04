import * as React from "react"

import { AiManagementProvider } from "@/hooks/useAiManagement"
import { PlaybackProvider } from "@/hooks/usePlayback"
import { SettingsDialogsProvider } from "@/hooks/useSettingsDialogs"
import { SentenceOperationsProvider } from "@/hooks/useSentenceOperations"
import { ArticlesProvider } from "@/hooks/useArticles"
import { ArticleToolbarProvider } from "@/hooks/useArticleToolbar"
import { CardModeProvider } from "@/hooks/useCardMode"
import type { useAiManagement } from "@/hooks/useAiManagement"
import type { usePlayback } from "@/hooks/usePlayback"
import type { useSettingsDialogs } from "@/hooks/useSettingsDialogs"
import type { useSentenceOperations } from "@/hooks/useSentenceOperations"
import type { useArticles } from "@/hooks/useArticles"
import type { useArticleToolbar } from "@/hooks/useArticleToolbar"
import type { useCardMode } from "@/hooks/useCardMode"

type ArticleProvidersProps = {
  aiManagement: ReturnType<typeof useAiManagement>
  articles: ReturnType<typeof useArticles>
  articleToolbar: ReturnType<typeof useArticleToolbar>
  cardMode: ReturnType<typeof useCardMode>
  playback: ReturnType<typeof usePlayback>
  settingsDialogs: ReturnType<typeof useSettingsDialogs>
  sentenceOperations: ReturnType<typeof useSentenceOperations>
  children: React.ReactNode
}

export function ArticleProviders({
  aiManagement,
  articles,
  articleToolbar,
  cardMode,
  playback,
  settingsDialogs,
  sentenceOperations,
  children,
}: ArticleProvidersProps) {
  return (
    <AiManagementProvider value={aiManagement}>
      <ArticlesProvider value={articles}>
        <PlaybackProvider value={playback}>
          <ArticleToolbarProvider value={articleToolbar}>
            <CardModeProvider value={cardMode}>
              <SettingsDialogsProvider value={settingsDialogs}>
                <SentenceOperationsProvider value={sentenceOperations}>
                  {children}
                </SentenceOperationsProvider>
              </SettingsDialogsProvider>
            </CardModeProvider>
          </ArticleToolbarProvider>
        </PlaybackProvider>
      </ArticlesProvider>
    </AiManagementProvider>
  )
}
