import { useTranslation } from "react-i18next"
import { useQueryClient } from "@tanstack/react-query"
import { AI_INSTRUCTION_TYPES, type AiInstructionType } from "@sola/shared"

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
  DialogAddButton,
  DialogCancelButton,
  DialogCloseButton,
  DialogDeleteButton,
  DialogSaveButton,
} from "@sola/ui"
import {
  AiInstructionAddDialogDescription,
  AiInstructionAddDialogTitle,
  AiInstructionDeleteDialogDescription,
  AiInstructionDeleteDialogTitle,
  AiInstructionEditDialogTitle,
  AiInstructionsDialogDescription,
  AiInstructionsDialogTitle,
} from "./AiDialogStates"
import { AiNoInstructionsState, AiNoPublicInstructionsState } from "./AiStates"
import { useAiManagementRequired } from "../hooks/init/useInitAiManagement"
import { refreshAiInstructions } from "@/lib/queryRefresh"

type AiInstructionDraft = ReturnType<
  typeof useAiManagementRequired
>["aiInstructionEditing"]

export const AiInstructionPanel = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const {
    aiInstructionDialogOpen,
    setAiInstructionDialogOpen,
    setAiInstructionEditOpen,
    setAiInstructionEditing,
    setAiInstructionDeleteId,
    setAiInstructionDeleteOpen,
    setAiInstructionAddOpen,
    aiInstructionEditOpen,
    aiInstructionEditing,
    updateInstruction,
    aiInstructionQuery,
    aiInstructionAddOpen,
    publicAiInstructionQuery,
    aiInstructionAddProviderId,
    setAiInstructionAddProviderId,
    aiInstructionAddModel,
    setAiInstructionAddModel,
    aiProvidersQuery,
    resolveProviderModels,
    createInstructionFromPublic,
    aiInstructionDeleteOpen,
    aiInstructionDeleteId,
    deleteInstruction,
  } = useAiManagementRequired()
  const aiProviders = aiProvidersQuery.data ?? []
  const aiInstructions = aiInstructionQuery.data ?? []
  const publicAiInstructions = publicAiInstructionQuery.data ?? []
  return (
    <>
      <Dialog open={aiInstructionDialogOpen} onOpenChange={setAiInstructionDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              <AiInstructionsDialogTitle />
            </DialogTitle>
            <DialogDescription>
              <AiInstructionsDialogDescription />
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-sm">
            <div className="space-y-2">
              {aiInstructions.length === 0 ? (
                <AiNoInstructionsState />
              ) : (
                aiInstructions
                  .slice()
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((instruction) => (
                    <div
                      key={instruction.id}
                      className="flex items-center justify-between rounded-md border px-3 py-2"
                    >
                      <div className="space-y-1">
                        <div className="text-sm font-semibold">{instruction.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {instruction.instructionType}
                          {instruction.isDefault ? ` · ${t("common.default")}` : ""}
                          {!instruction.enabled ? ` · ${t("common.disabled")}` : ""}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="h-7"
                          onClick={() => {
                            setAiInstructionEditing({ ...instruction })
                            setAiInstructionEditOpen(true)
                          }}
                        >
                          {t("common.edit")}
                        </Button>
                        <DialogDeleteButton
                          label={t("common.delete")}
                          variant="outline"
                          className="h-7"
                          onClick={() => {
                            setAiInstructionDeleteId(instruction.id)
                            setAiInstructionDeleteOpen(true)
                          }}
                        />
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

          <DialogFooter className="justify-between">
            <DialogAddButton
              label={t("common.add")}
              variant="outline"
              onClick={() => setAiInstructionAddOpen(true)}
            />
            <DialogClose asChild>
              <DialogCloseButton label={t("common.close")} />
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={aiInstructionEditOpen} onOpenChange={setAiInstructionEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              <AiInstructionEditDialogTitle />
            </DialogTitle>
          </DialogHeader>

          {aiInstructionEditing ? (
            <div className="space-y-3 text-sm">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">
                  {t("ai.instructionName")}
                </label>
                <input
                  className="h-9 w-full rounded-md border bg-background px-2 text-sm"
                  value={aiInstructionEditing.name}
                  onChange={(event) =>
                    setAiInstructionEditing((prev: AiInstructionDraft) =>
                      prev ? { ...prev, name: event.target.value } : prev
                    )
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">
                  {t("ai.instructionType")}
                </label>
                <select
                  className="h-9 w-full rounded-md border bg-background px-2 text-sm"
                  value={aiInstructionEditing.instructionType}
                  onChange={(event) =>
                    setAiInstructionEditing((prev: AiInstructionDraft) =>
                      prev
                        ? {
                            ...prev,
                            instructionType: event.target.value as AiInstructionType,
                          }
                        : prev
                    )
                  }
                >
                  {AI_INSTRUCTION_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">
                  {t("ai.provider")}
                </label>
                <select
                  className="h-9 w-full rounded-md border bg-background px-2 text-sm"
                  value={
                    aiInstructionEditing.userAiProviderId ??
                    aiProviders.find((item) => item.isDefault)?.id ??
                    ""
                  }
                  onChange={(event) =>
                    setAiInstructionEditing((prev: AiInstructionDraft) =>
                      prev
                        ? {
                            ...prev,
                            userAiProviderId: event.target.value || null,
                          }
                        : prev
                    )
                  }
                >
                  <option value="">{t("ai.defaultProvider")}</option>
                  {aiProviders.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.providerType}
                      {item.isDefault ? `(${t("common.default")})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">{t("ai.model")}</label>
                <select
                  className="h-9 w-full rounded-md border bg-background px-2 text-sm"
                  value={aiInstructionEditing.model ?? ""}
                  onChange={(event) =>
                    setAiInstructionEditing((prev: AiInstructionDraft) =>
                      prev
                        ? {
                            ...prev,
                            model: event.target.value || null,
                          }
                        : prev
                    )
                  }
                >
                  <option value="">{t("ai.modelAuto")}</option>
                  {resolveProviderModels(
                    aiInstructionEditing.userAiProviderId ??
                      aiProviders.find((item) => item.isDefault)?.id ??
                      null
                  ).map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">
                  {t("ai.systemPrompt")}
                </label>
                <textarea
                  rows={3}
                  className="w-full rounded-md border bg-background px-2 py-1 text-xs"
                  value={aiInstructionEditing.systemPrompt}
                  onChange={(event) =>
                    setAiInstructionEditing((prev: AiInstructionDraft) =>
                      prev ? { ...prev, systemPrompt: event.target.value } : prev
                    )
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">
                  {t("ai.userPrompt")}
                </label>
                <textarea
                  rows={3}
                  className="w-full rounded-md border bg-background px-2 py-1 text-xs"
                  value={aiInstructionEditing.userPromptTemplate}
                  onChange={(event) =>
                    setAiInstructionEditing((prev: AiInstructionDraft) =>
                      prev ? { ...prev, userPromptTemplate: event.target.value } : prev
                    )
                  }
                />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">
                    {t("ai.inputSchema")}
                  </label>
                  <textarea
                    rows={3}
                    className="w-full rounded-md border bg-background px-2 py-1 text-xs"
                    value={aiInstructionEditing.inputSchemaJson ?? ""}
                    onChange={(event) =>
                      setAiInstructionEditing((prev: AiInstructionDraft) =>
                        prev ? { ...prev, inputSchemaJson: event.target.value } : prev
                      )
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">
                    {t("ai.outputSchema")}
                  </label>
                  <textarea
                    rows={3}
                    className="w-full rounded-md border bg-background px-2 py-1 text-xs"
                    value={aiInstructionEditing.outputSchemaJson ?? ""}
                    onChange={(event) =>
                      setAiInstructionEditing((prev: AiInstructionDraft) =>
                        prev ? { ...prev, outputSchemaJson: event.target.value } : prev
                      )
                    }
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={aiInstructionEditing.isDefault}
                    onChange={(event) =>
                      setAiInstructionEditing((prev: AiInstructionDraft) =>
                        prev ? { ...prev, isDefault: event.target.checked } : prev
                      )
                    }
                  />
                  {t("ai.defaultInstruction")}
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={aiInstructionEditing.enabled}
                    onChange={(event) =>
                      setAiInstructionEditing((prev: AiInstructionDraft) =>
                        prev ? { ...prev, enabled: event.target.checked } : prev
                      )
                    }
                  />
                  {t("common.enabled")}
                </label>
              </div>
            </div>
          ) : null}

          <DialogFooter className="gap-2 sm:gap-2">
            <DialogClose asChild>
              <DialogCancelButton label={t("common.cancel")} />
            </DialogClose>
            <DialogClose asChild>
              <DialogSaveButton
                label={t("common.save")}
                onClick={async () => {
                  if (!aiInstructionEditing) return
                  await updateInstruction({
                    ...aiInstructionEditing,
                    inputSchemaJson: aiInstructionEditing.inputSchemaJson || null,
                    outputSchemaJson: aiInstructionEditing.outputSchemaJson || null,
                  })
                  await refreshAiInstructions(queryClient)
                }}
              />
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={aiInstructionAddOpen} onOpenChange={setAiInstructionAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <AiInstructionAddDialogTitle />
            </DialogTitle>
            <DialogDescription>
              <AiInstructionAddDialogDescription />
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 text-sm">
            {publicAiInstructions.length === 0 ? (
              <AiNoPublicInstructionsState />
            ) : (
              <>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">
                    {t("ai.provider")}
                  </label>
                  <select
                    className="h-9 w-full rounded-md border bg-background px-2 text-sm"
                    value={aiInstructionAddProviderId ?? ""}
                    onChange={(event) => {
                      setAiInstructionAddProviderId(event.target.value || null)
                    }}
                  >
                    <option value="">{t("ai.defaultProvider")}</option>
                    {(aiProvidersQuery.data ?? []).map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.providerType}
                        {item.isDefault ? `(${t("common.default")})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">{t("ai.model")}</label>
                  <select
                    className="h-9 w-full rounded-md border bg-background px-2 text-sm"
                    value={aiInstructionAddModel ?? ""}
                    onChange={(event) => {
                      setAiInstructionAddModel(event.target.value || null)
                    }}
                  >
                    <option value="">{t("ai.modelAuto")}</option>
                    {resolveProviderModels(
                      aiInstructionAddProviderId ??
                        aiProviders.find((item) => item.isDefault)?.id ??
                        null
                    ).map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  {publicAiInstructions
                    .slice()
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((instruction) => (
                      <div
                        key={instruction.id}
                        className="flex items-center justify-between rounded-md border px-3 py-2"
                      >
                        <div>
                          <div className="font-semibold">{instruction.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {instruction.instructionType}
                          </div>
                        </div>
                        <DialogAddButton
                          label={t("common.add")}
                          variant="outline"
                          className="h-7"
                          onClick={async () => {
                            await createInstructionFromPublic({
                              publicAiInstructionId: instruction.id,
                              userAiProviderId: aiInstructionAddProviderId ?? null,
                              model: aiInstructionAddModel ?? null,
                            })
                            await refreshAiInstructions(queryClient)
                            setAiInstructionAddOpen(false)
                          }}
                        />
                      </div>
                    ))}
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <DialogCloseButton label={t("common.close")} variant="outline" />
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={aiInstructionDeleteOpen} onOpenChange={setAiInstructionDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <AiInstructionDeleteDialogTitle />
            </DialogTitle>
            <DialogDescription>
              <AiInstructionDeleteDialogDescription />
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <DialogClose asChild>
              <DialogCancelButton label={t("common.cancel")} />
            </DialogClose>
            <DialogClose asChild>
              <DialogDeleteButton
                label={t("common.delete")}
                onClick={async () => {
                  if (!aiInstructionDeleteId) return
                  await deleteInstruction({ id: aiInstructionDeleteId })
                  setAiInstructionDeleteId(null)
                  await refreshAiInstructions(queryClient)
                }}
              />
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
