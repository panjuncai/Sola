import { useTranslation } from "react-i18next"

import { useCardModeState } from "@/features/card-mode"
import { useAiManagementRequired } from "@/features/ai-management"
import { useArticleToolbarRequired } from "@/features/playback"
import { useSettingsView, useToolbarView } from "@/features/articles"

export const useArticleToolbarView = () => {
  const { t } = useTranslation()
  const toolbar = useArticleToolbarRequired()
  const { isCardMode } = useCardModeState()
  const settings = useSettingsView()
  const ai = useAiManagementRequired()
  const mobile = useToolbarView()

  return {
    t,
    toolbar,
    isCardMode,
    settings,
    ai,
    mobile,
  }
}
