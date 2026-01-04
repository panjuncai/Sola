import * as React from "react"
import type { TFunction } from "i18next"

import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@sola/ui"

type TranslateFn = TFunction<"translation">

type VoiceOption = {
  id: string
  gender?: string | null
  name?: string | null
  voiceId: string
}

type LanguageSettingsDialogProps = {
  t: TranslateFn
  open: boolean
  onOpenChange: (open: boolean) => void
  languages: { value: string; label: string }[]
  nativeLanguageSetting: string
  targetLanguageSetting: string
  onNativeLanguageChange: (value: string) => void
  onTargetLanguageChange: (value: string) => void
  nativeVoiceId: string | null
  targetVoiceId: string | null
  nativeVoiceOptions: VoiceOption[]
  targetVoiceOptions: VoiceOption[]
  onNativeVoiceChange: (value: string | null) => void
  onTargetVoiceChange: (value: string | null) => void
  voiceLabel: (voice: VoiceOption) => string
}

export const LanguageSettingsDialog: React.FC<LanguageSettingsDialogProps> = ({
  t,
  open,
  onOpenChange,
  languages,
  nativeLanguageSetting,
  targetLanguageSetting,
  onNativeLanguageChange,
  onTargetLanguageChange,
  nativeVoiceId,
  targetVoiceId,
  nativeVoiceOptions,
  targetVoiceOptions,
  onNativeVoiceChange,
  onTargetVoiceChange,
  voiceLabel,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                onChange={(event) => onNativeLanguageChange(event.target.value)}
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
                onChange={(event) => onNativeVoiceChange(event.target.value || null)}
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
                onChange={(event) => onTargetLanguageChange(event.target.value)}
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
                onChange={(event) => onTargetVoiceChange(event.target.value || null)}
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
            <Button type="button" variant="outline">
              {t("common.close")}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
