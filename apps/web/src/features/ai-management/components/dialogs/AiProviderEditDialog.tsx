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
} from "@sola/ui"

import {
  DialogCancelButton,
  DialogSaveButton,
} from "@sola/ui"
import {
  AiProviderEditDialogDescription,
  AiProviderEditDialogTitle,
  useAiManagementRequired,
} from "@/features/ai-management"
import { useSettings } from "@/stores/useSettings"

export const AiProviderEditDialog = () => {
  const { t } = useTranslation()
  const { useAiUserKey } = useSettings()
  const {
    aiProviderEditOpen,
    setAiProviderEditOpen,
    aiProviderEditing,
    setAiProviderEditing,
    aiProviderEditKeyVisible,
    setAiProviderEditKeyVisible,
    aiProviderEditModels,
    setAiProviderEditModels,
    updateAiProvider,
  } = useAiManagementRequired()
  return (
    <Dialog open={aiProviderEditOpen} onOpenChange={setAiProviderEditOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <AiProviderEditDialogTitle />
          </DialogTitle>
          <DialogDescription>
            <AiProviderEditDialogDescription />
          </DialogDescription>
        </DialogHeader>
        {aiProviderEditing ? (
          <div className="grid gap-3 text-sm">
            <input
              className="h-9 rounded-md border bg-background px-2 text-sm"
              placeholder={t("ai.providerNamePlaceholder")}
              value={aiProviderEditing.name ?? ""}
              disabled={aiProviderEditing.isPublic}
              onChange={(event) =>
                setAiProviderEditing({
                  ...aiProviderEditing,
                  name: event.target.value,
                })
              }
            />
            <input
              className="h-9 rounded-md border bg-background px-2 text-sm"
              value={aiProviderEditing.providerType}
              disabled
            />
            <input
              className="h-9 rounded-md border bg-background px-2 text-sm"
              placeholder="Base URL"
              value={aiProviderEditing.apiUrl}
              onChange={(event) =>
                setAiProviderEditing({
                  ...aiProviderEditing,
                  apiUrl: event.target.value,
                })
              }
            />
            {useAiUserKey ? (
              <div className="flex items-center gap-2">
                <input
                  className="h-9 flex-1 rounded-md border bg-background px-2 text-sm"
                  placeholder="API Key"
                  type={aiProviderEditKeyVisible ? "text" : "password"}
                  value={aiProviderEditing.apiKey ?? ""}
                  onChange={(event) =>
                    setAiProviderEditing({
                      ...aiProviderEditing,
                      apiKey: event.target.value,
                    })
                  }
                />
                <Button
                  type="button"
                  variant="outline"
                  className="h-9"
                  onClick={() => setAiProviderEditKeyVisible((prev) => !prev)}
                >
                  {aiProviderEditKeyVisible ? t("common.hide") : t("common.show")}
                </Button>
              </div>
            ) : null}
            <input
              className="h-9 rounded-md border bg-background px-2 text-sm"
              placeholder={t("ai.modelsPlaceholder")}
              value={aiProviderEditModels}
              onChange={(event) => setAiProviderEditModels(event.target.value)}
            />
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={aiProviderEditing.enabled}
                onChange={(event) =>
                  setAiProviderEditing({
                    ...aiProviderEditing,
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
            <DialogCancelButton label={t("common.cancel")} />
          </DialogClose>
          <DialogSaveButton label={t("common.save")} onClick={updateAiProvider} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
