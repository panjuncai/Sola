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

type AiProviderDraft = {
  id: string
  providerType: string
  name: string | null
  apiUrl: string
  apiKey: string | null
  models: string[]
  enabled: boolean
  isPublic: boolean
}

type AiProviderEditDialogProps = {
  t: TranslateFn
  open: boolean
  onOpenChange: (open: boolean) => void
  useAiUserKey: boolean
  provider: AiProviderDraft | null
  apiKeyVisible: boolean
  onToggleApiKeyVisible: () => void
  modelsValue: string
  onModelsChange: (value: string) => void
  onChangeProvider: (provider: AiProviderDraft) => void
  onSave: () => void
}

export const AiProviderEditDialog: React.FC<AiProviderEditDialogProps> = ({
  t,
  open,
  onOpenChange,
  useAiUserKey,
  provider,
  apiKeyVisible,
  onToggleApiKeyVisible,
  modelsValue,
  onModelsChange,
  onChangeProvider,
  onSave,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("ai.editProviderTitle")}</DialogTitle>
          <DialogDescription>{t("ai.editProviderDesc")}</DialogDescription>
        </DialogHeader>
        {provider ? (
          <div className="grid gap-3 text-sm">
            <input
              className="h-9 rounded-md border bg-background px-2 text-sm"
              placeholder={t("ai.providerNamePlaceholder")}
              value={provider.name ?? ""}
              disabled={provider.isPublic}
              onChange={(event) =>
                onChangeProvider({
                  ...provider,
                  name: event.target.value,
                })
              }
            />
            <input
              className="h-9 rounded-md border bg-background px-2 text-sm"
              value={provider.providerType}
              disabled
            />
            <input
              className="h-9 rounded-md border bg-background px-2 text-sm"
              placeholder="Base URL"
              value={provider.apiUrl}
              onChange={(event) =>
                onChangeProvider({
                  ...provider,
                  apiUrl: event.target.value,
                })
              }
            />
            {useAiUserKey ? (
              <div className="flex items-center gap-2">
                <input
                  className="h-9 flex-1 rounded-md border bg-background px-2 text-sm"
                  placeholder="API Key"
                  type={apiKeyVisible ? "text" : "password"}
                  value={provider.apiKey ?? ""}
                  onChange={(event) =>
                    onChangeProvider({
                      ...provider,
                      apiKey: event.target.value,
                    })
                  }
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
              value={modelsValue}
              onChange={(event) => onModelsChange(event.target.value)}
            />
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={provider.enabled}
                onChange={(event) =>
                  onChangeProvider({
                    ...provider,
                    enabled: event.target.checked,
                  })
                }
              />
              {t("common.enabled")}
            </label>
          </div>
        ) : null}
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
