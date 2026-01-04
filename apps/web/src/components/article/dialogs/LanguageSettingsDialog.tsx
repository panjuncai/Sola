import { useTranslation } from "react-i18next"

import { LanguageSettingsDialog as LanguageSettingsDialogView } from "@/components/article/LanguageSettingsDialog"
import { useSettingsDialogs } from "@/hooks/useSettingsDialogs"

type LanguageOption = "zh-CN" | "en-US" | "fr-FR"

export const LanguageSettingsDialog = () => {
  const { t } = useTranslation()
  const {
    languageDialogOpen,
    setLanguageDialogOpen,
    nativeLanguageSetting,
    targetLanguageSetting,
    nativeVoiceId,
    targetVoiceId,
    nativeVoiceOptions,
    targetVoiceOptions,
    handleNativeLanguageChange,
    handleTargetLanguageChange,
    handleNativeVoiceChange,
    handleTargetVoiceChange,
  } = useSettingsDialogs()

  const languages = [
    { value: "zh-CN" as LanguageOption, label: t("lang.zhCN") },
    { value: "en-US" as LanguageOption, label: t("lang.enUS") },
    { value: "fr-FR" as LanguageOption, label: t("lang.frFR") },
  ]

  const voiceLabel = (voice: { gender?: string | null }) =>
    voice.gender === "Female"
      ? t("settings.voiceFemale")
      : voice.gender === "Male"
        ? t("settings.voiceMale")
        : t("settings.voice")

  return (
    <LanguageSettingsDialogView
      t={t}
      open={languageDialogOpen}
      onOpenChange={setLanguageDialogOpen}
      languages={languages}
      nativeLanguageSetting={nativeLanguageSetting}
      targetLanguageSetting={targetLanguageSetting}
      onNativeLanguageChange={handleNativeLanguageChange}
      onTargetLanguageChange={handleTargetLanguageChange}
      nativeVoiceId={nativeVoiceId}
      targetVoiceId={targetVoiceId}
      nativeVoiceOptions={nativeVoiceOptions}
      targetVoiceOptions={targetVoiceOptions}
      onNativeVoiceChange={handleNativeVoiceChange}
      onTargetVoiceChange={handleTargetVoiceChange}
      voiceLabel={voiceLabel}
    />
  )
}
