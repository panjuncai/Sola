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

type AiProviderType = "volcengine" | "qwen" | "openai" | "gemini" | "aihubmix"

import { useAiManagement } from "@/hooks/useAiManagement"
import { useSettings } from "@/hooks/useSettings"

export const AiProviderAddDialog = () => {
  const { t } = useTranslation()
  const { useAiUserKey } = useSettings()
  const {
    aiProviderAddOpen,
    setAiProviderAddOpen,
    newAiProviderName,
    setNewAiProviderName,
    newAiProviderType,
    setNewAiProviderType,
    newAiProviderApiUrl,
    setNewAiProviderApiUrl,
    newAiProviderApiKey,
    setNewAiProviderApiKey,
    newAiProviderKeyVisible,
    setNewAiProviderKeyVisible,
    newAiProviderModels,
    setNewAiProviderModels,
    newAiProviderEnabled,
    setNewAiProviderEnabled,
    addAiProvider,
  } = useAiManagement()
  return (
    <Dialog open={aiProviderAddOpen} onOpenChange={setAiProviderAddOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("ai.addCustomTitle")}</DialogTitle>
          <DialogDescription>{t("ai.addCustomDesc")}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 text-sm">
          <input
            className="h-9 rounded-md border bg-background px-2 text-sm"
            placeholder={t("ai.providerNamePlaceholder")}
            value={newAiProviderName}
            onChange={(event) => setNewAiProviderName(event.target.value)}
          />
          <select
            className="h-9 rounded-md border bg-background px-2 text-sm"
            value={newAiProviderType}
            onChange={(event) =>
              setNewAiProviderType(event.target.value as AiProviderType)
            }
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
            value={newAiProviderApiUrl}
            onChange={(event) => setNewAiProviderApiUrl(event.target.value)}
          />
          {useAiUserKey ? (
            <div className="flex items-center gap-2">
              <input
                className="h-9 flex-1 rounded-md border bg-background px-2 text-sm"
                placeholder="API Key"
                type={newAiProviderKeyVisible ? "text" : "password"}
                value={newAiProviderApiKey}
                onChange={(event) => setNewAiProviderApiKey(event.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                className="h-9"
                onClick={() => setNewAiProviderKeyVisible((prev) => !prev)}
              >
                {newAiProviderKeyVisible ? t("common.hide") : t("common.show")}
              </Button>
            </div>
          ) : null}
          <input
            className="h-9 rounded-md border bg-background px-2 text-sm"
            placeholder={t("ai.modelsPlaceholder")}
            value={newAiProviderModels}
            onChange={(event) => setNewAiProviderModels(event.target.value)}
          />
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={newAiProviderEnabled}
              onChange={(event) => setNewAiProviderEnabled(event.target.checked)}
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
          <Button type="button" onClick={addAiProvider}>
            {t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
