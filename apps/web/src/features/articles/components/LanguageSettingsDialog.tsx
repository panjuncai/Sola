import { useTranslation } from "react-i18next"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@sola/ui"

import { DialogCloseButton } from "@sola/ui"
import { useLanguageOptions, useSettingsDialogs } from "@/features/articles"

type VoiceOption = {
  id: string
  gender?: string | null
  name?: string | null
  voiceId: string
}

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
  const languages = useLanguageOptions()

  const voiceLabel = (voice: VoiceOption) =>
    voice.gender === "Female"
      ? t("settings.voiceFemale")
      : voice.gender === "Male"
        ? t("settings.voiceMale")
        : t("settings.voice")

  return (
    <Dialog open={languageDialogOpen} onOpenChange={setLanguageDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("settings.languageSettings")}</DialogTitle>
          <DialogDescription>{t("settings.languageDialogDesc")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="space-y-2">
            <div className="text-xs font-semibold text-muted-foreground">
              {t("settings.nativeLanguage")}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                className="h-9 rounded-md border bg-background px-2 text-sm"
                value={nativeLanguageSetting}
                onChange={(event) => handleNativeLanguageChange(event.target.value)}
              >
                {languages.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
              <select
                className="h-9 min-w-[200px] rounded-md border bg-background px-2 text-sm"
                value={nativeVoiceId ?? ""}
                onChange={(event) =>
                  handleNativeVoiceChange(event.target.value || null)
                }
              >
                <option value="" disabled>
                  {t("settings.voice")}
                </option>
                {nativeVoiceOptions.map((voice) => (
                  <option key={voice.id} value={voice.id}>
                    {voiceLabel(voice)} · {voice.name ?? voice.voiceId}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-muted-foreground">
              {t("settings.targetLanguage")}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                className="h-9 rounded-md border bg-background px-2 text-sm"
                value={targetLanguageSetting}
                onChange={(event) => handleTargetLanguageChange(event.target.value)}
              >
                {languages.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
              <select
                className="h-9 min-w-[200px] rounded-md border bg-background px-2 text-sm"
                value={targetVoiceId ?? ""}
                onChange={(event) =>
                  handleTargetVoiceChange(event.target.value || null)
                }
              >
                <option value="" disabled>
                  {t("settings.voice")}
                </option>
                {targetVoiceOptions.map((voice) => (
                  <option key={voice.id} value={voice.id}>
                    {voiceLabel(voice)} · {voice.name ?? voice.voiceId}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <DialogCloseButton label={t("common.close")} variant="outline" />
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
