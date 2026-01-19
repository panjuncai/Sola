import * as React from "react"
import { useTranslation } from "react-i18next"

import type { LanguageOption } from "@sola/shared"

export const useLanguageOptions = () => {
  const { t } = useTranslation()

  return React.useMemo(
    () =>
      [
        { value: "zh-CN", label: t("lang.zhCN") },
        { value: "en-US", label: t("lang.enUS") },
        { value: "fr-FR", label: t("lang.frFR") },
      ] as { value: LanguageOption; label: string }[],
    [t]
  )
}
