import { useTranslation } from "react-i18next"

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

import {
  DialogCancelButton,
  DialogDeleteButton,
} from "@sola/ui"
import { AiNoProvidersState, useAiManagementRequired } from "@/features/ai-management"
import { useSettings } from "@/stores/useSettings"

export const AiSettingsDialog = () => {
  const { t } = useTranslation()
  const { useAiUserKey, setUseAiUserKey, persistSettings } = useSettings()
  const {
    aiDialogOpen,
    setAiDialogOpen,
    setAiProviderAddOpen,
    setAiProviderEditOpen,
    setAiProviderEditing,
    setAiProviderEditModels,
    setAiProviderEditKeyVisible,
    setAiProviderDeleteId,
    setAiProviderResetOpen,
    setDefaultProvider,
    aiProvidersQuery,
  } = useAiManagementRequired()
  const aiProviders = (aiProvidersQuery.data ?? [])
    .slice()
    .sort((a, b) => Number(b.isDefault) - Number(a.isDefault))

  return (
    <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
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
                <input
                  type="radio"
                  checked={!useAiUserKey}
                  onChange={() => {
                    setUseAiUserKey(false)
                    persistSettings({ useAiUserKey: false })
                  }}
                />
                {t("ai.quotaPublic")}
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={useAiUserKey}
                  onChange={() => {
                    setUseAiUserKey(true)
                    persistSettings({ useAiUserKey: true })
                  }}
                />
                {t("ai.quotaPrivate")}
              </label>
            </div>
          </div>
          {aiProviders.length === 0 ? (
            <AiNoProvidersState />
          ) : (
            aiProviders.map((provider) => (
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
                      onClick={() => {
                        setDefaultProvider(provider.id)
                      }}
                    >
                      {provider.isDefault ? t("common.default") : t("ai.setDefault")}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-7"
                      onClick={() => {
                        setAiProviderEditing({ ...provider })
                        setAiProviderEditModels(provider.models.join(", "))
                        setAiProviderEditKeyVisible(false)
                        setAiProviderEditOpen(true)
                      }}
                    >
                      {t("common.edit")}
                    </Button>
                    <DialogDeleteButton
                      label={t("common.delete")}
                      variant="outline"
                      className="h-7"
                      onClick={() => setAiProviderDeleteId(provider.id)}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-9"
              onClick={() => setAiProviderResetOpen(true)}
            >
              {t("ai.resetToDefault")}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-9"
              onClick={() => setAiProviderAddOpen(true)}
            >
              {t("ai.addCustomProvider")}
            </Button>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <DialogClose asChild>
            <DialogCancelButton label={t("common.close")} />
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
