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

type AiProviderType = "volcengine" | "qwen" | "openai" | "gemini" | "aihubmix"

type AiProviderAddDialogProps = {
  t: TranslateFn
  open: boolean
  onOpenChange: (open: boolean) => void
  useAiUserKey: boolean
  name: string
  onNameChange: (value: string) => void
  providerType: AiProviderType
  onProviderTypeChange: (value: AiProviderType) => void
  apiUrl: string
  onApiUrlChange: (value: string) => void
  apiKey: string
  onApiKeyChange: (value: string) => void
  apiKeyVisible: boolean
  onToggleApiKeyVisible: () => void
  models: string
  onModelsChange: (value: string) => void
  enabled: boolean
  onEnabledChange: (value: boolean) => void
  onSave: () => void
}

export const AiProviderAddDialog: React.FC<AiProviderAddDialogProps> = ({
  t,
  open,
  onOpenChange,
  useAiUserKey,
  name,
  onNameChange,
  providerType,
  onProviderTypeChange,
  apiUrl,
  onApiUrlChange,
  apiKey,
  onApiKeyChange,
  apiKeyVisible,
  onToggleApiKeyVisible,
  models,
  onModelsChange,
  enabled,
  onEnabledChange,
  onSave,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("ai.addCustomTitle")}</DialogTitle>
          <DialogDescription>{t("ai.addCustomDesc")}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 text-sm">
          <input
            className="h-9 rounded-md border bg-background px-2 text-sm"
            placeholder={t("ai.providerNamePlaceholder")}
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
          />
          <select
            className="h-9 rounded-md border bg-background px-2 text-sm"
            value={providerType}
            onChange={(event) => onProviderTypeChange(event.target.value as AiProviderType)}
          >
            {["volcengine", "qwen", "openai", "gemini", "aihubmix"].map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <input
            className="h-9 rounded-md border bg-background px-2 text-sm"
            placeholder="Base URL"
            value={apiUrl}
            onChange={(event) => onApiUrlChange(event.target.value)}
          />
          {useAiUserKey ? (
            <div className="flex items-center gap-2">
              <input
                className="h-9 flex-1 rounded-md border bg-background px-2 text-sm"
                placeholder="API Key"
                type={apiKeyVisible ? "text" : "password"}
                value={apiKey}
                onChange={(event) => onApiKeyChange(event.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                className="h-9"
                onClick={onToggleApiKeyVisible}
              >
                {apiKeyVisible ? t("common.hide") : t("common.show")}
              </Button>
            </div>
          ) : null}
          <input
            className="h-9 rounded-md border bg-background px-2 text-sm"
            placeholder={t("ai.modelsPlaceholder")}
            value={models}
            onChange={(event) => onModelsChange(event.target.value)}
          />
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(event) => onEnabledChange(event.target.checked)}
            />
            {t("common.enabled")}
          </label>
        </div>
        <DialogFooter className="gap-2 sm:gap-2">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              {t("common.cancel")}
            </Button>
          </DialogClose>
          <Button type="button" onClick={onSave}>
            {t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
