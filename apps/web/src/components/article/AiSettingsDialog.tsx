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
  cn,
} from "@sola/ui"

type TranslateFn = TFunction<"translation">

type AiProviderDraft = {
  id: string
  providerType: string
  name: string | null
  apiKey: string | null
  models: string[]
  isDefault: boolean
  apiUrl: string
  enabled: boolean
  isPublic: boolean
}

type AiSettingsDialogProps = {
  t: TranslateFn
  open: boolean
  onOpenChange: (open: boolean) => void
  useAiUserKey: boolean
  onUsePublic: () => void
  onUsePrivate: () => void
  aiProvidersDraft: AiProviderDraft[]
  onSetDefault: (id: string) => void
  onEdit: (provider: AiProviderDraft) => void
  onDelete: (id: string) => void
  onReset: () => void
  onAddCustom: () => void
  onSave: () => Promise<void>
}

export const AiSettingsDialog: React.FC<AiSettingsDialogProps> = ({
  t,
  open,
  onOpenChange,
  useAiUserKey,
  onUsePublic,
  onUsePrivate,
  aiProvidersDraft,
  onSetDefault,
  onEdit,
  onDelete,
  onReset,
  onAddCustom,
  onSave,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("ai.settingsTitle")}</DialogTitle>
          <DialogDescription>{t("ai.settingsDesc")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="space-y-2 rounded-md border px-3 py-2">
            <div className="text-xs font-semibold text-muted-foreground">
              {t("ai.quotaTitle")}
            </div>
            <div className="flex items-center gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input type="radio" checked={!useAiUserKey} onChange={onUsePublic} />
                {t("ai.quotaPublic")}
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" checked={useAiUserKey} onChange={onUsePrivate} />
                {t("ai.quotaPrivate")}
              </label>
            </div>
          </div>
          {aiProvidersDraft.length === 0 ? (
            <div className="text-sm text-muted-foreground">{t("ai.noProviders")}</div>
          ) : (
            aiProvidersDraft.map((provider) => (
              <div
                key={provider.id}
                className={cn(
                  "rounded-lg border px-3 py-2 space-y-2",
                  provider.isDefault && "border-primary/60 bg-primary/5"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="text-sm font-semibold">
                      {(provider.providerType || (provider.name ?? "custom")) +
                        (provider.models.length > 0 ? ` · ${provider.models[0]}...` : "")}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant={provider.isDefault ? "secondary" : "outline"}
                      className="h-7"
                      onClick={() => onSetDefault(provider.id)}
                    >
                      {provider.isDefault ? t("common.default") : t("ai.setDefault")}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-7"
                      onClick={() => onEdit(provider)}
                    >
                      {t("common.edit")}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-7"
                      onClick={() => onDelete(provider.id)}
                    >
                      {t("common.delete")}
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" className="h-9" onClick={onReset}>
              {t("ai.resetToDefault")}
            </Button>
            <Button type="button" variant="outline" className="h-9" onClick={onAddCustom}>
              {t("ai.addCustomProvider")}
            </Button>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              {t("common.cancel")}
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button type="button" onClick={onSave}>
              {t("common.save")}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
