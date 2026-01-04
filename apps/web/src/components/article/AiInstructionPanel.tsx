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

type InstructionType = "translate" | "explain" | "custom"

type TranslateFn = TFunction<"translation">

type AiInstructionDraft = {
  id: string
  name: string
  instructionType: InstructionType
  isDefault: boolean
  enabled: boolean
  userAiProviderId: string | null
  model: string | null
  systemPrompt: string
  userPromptTemplate: string
  inputSchemaJson: string | null
  outputSchemaJson: string | null
}

type PublicAiInstruction = {
  id: string
  name: string
  instructionType: InstructionType
}

type AiProviderOption = {
  id: string
  providerType: string
  isDefault: boolean
}

type AiInstructionPanelProps = {
  t: TranslateFn
  aiInstructionDialogOpen: boolean
  setAiInstructionDialogOpen: (open: boolean) => void
  aiInstructionDrafts: AiInstructionDraft[]
  setAiInstructionEditOpen: (open: boolean) => void
  setAiInstructionEditing: React.Dispatch<React.SetStateAction<AiInstructionDraft | null>>
  setAiInstructionDeleteId: (id: string | null) => void
  setAiInstructionDeleteOpen: (open: boolean) => void
  setAiInstructionAddOpen: (open: boolean) => void
  aiInstructionEditOpen: boolean
  setAiInstructionEditOpenState: (open: boolean) => void
  aiInstructionEditing: AiInstructionDraft | null
  updateInstruction: (payload: AiInstructionDraft) => Promise<unknown>
  refetchInstructions: () => Promise<unknown>
  aiInstructionAddOpen: boolean
  publicAiInstructions: PublicAiInstruction[]
  aiInstructionAddProviderId: string | null
  setAiInstructionAddProviderId: (value: string | null) => void
  aiInstructionAddModel: string | null
  setAiInstructionAddModel: (value: string | null) => void
  aiProviders: AiProviderOption[]
  resolveProviderModels: (providerId: string | null) => string[]
  createFromPublic: (payload: {
    publicAiInstructionId: string
    userAiProviderId: string | null
    model: string | null
  }) => Promise<unknown>
  aiInstructionDeleteOpen: boolean
  setAiInstructionDeleteOpenState: (open: boolean) => void
  aiInstructionDeleteId: string | null
  deleteInstruction: (payload: { id: string }) => Promise<unknown>
}

export const AiInstructionPanel: React.FC<AiInstructionPanelProps> = ({
  t,
  aiInstructionDialogOpen,
  setAiInstructionDialogOpen,
  aiInstructionDrafts,
  setAiInstructionEditOpen,
  setAiInstructionEditing,
  setAiInstructionDeleteId,
  setAiInstructionDeleteOpen,
  setAiInstructionAddOpen,
  aiInstructionEditOpen,
  setAiInstructionEditOpenState,
  aiInstructionEditing,
  updateInstruction,
  refetchInstructions,
  aiInstructionAddOpen,
  publicAiInstructions,
  aiInstructionAddProviderId,
  setAiInstructionAddProviderId,
  aiInstructionAddModel,
  setAiInstructionAddModel,
  aiProviders,
  resolveProviderModels,
  createFromPublic,
  aiInstructionDeleteOpen,
  setAiInstructionDeleteOpenState,
  aiInstructionDeleteId,
  deleteInstruction,
}) => {
  return (
    <>
      <Dialog open={aiInstructionDialogOpen} onOpenChange={setAiInstructionDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("ai.instructionsTitle")}</DialogTitle>
            <DialogDescription>{t("ai.instructionsDesc")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-sm">
            <div className="space-y-2">
              {aiInstructionDrafts.length === 0 ? (
                <div className="text-muted-foreground">{t("ai.noInstructions")}</div>
              ) : (
                aiInstructionDrafts
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
                        <Button
                          type="button"
                          variant="outline"
                          className="h-7"
                          onClick={() => {
                            setAiInstructionDeleteId(instruction.id)
                            setAiInstructionDeleteOpen(true)
                          }}
                        >
                          {t("common.delete")}
                        </Button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

          <DialogFooter className="justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setAiInstructionAddOpen(true)}
            >
              {t("common.add")}
            </Button>
            <DialogClose asChild>
              <Button type="button">{t("common.close")}</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={aiInstructionEditOpen} onOpenChange={setAiInstructionEditOpenState}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("ai.editInstructionTitle")}</DialogTitle>
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
                    setAiInstructionEditing((prev) =>
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
                    setAiInstructionEditing((prev) =>
                      prev
                        ? {
                            ...prev,
                            instructionType: event.target.value as InstructionType,
                          }
                        : prev
                    )
                  }
                >
                  <option value="translate">translate</option>
                  <option value="explain">explain</option>
                  <option value="custom">custom</option>
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
                    setAiInstructionEditing((prev) =>
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
                    setAiInstructionEditing((prev) =>
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
                    setAiInstructionEditing((prev) =>
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
                    setAiInstructionEditing((prev) =>
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
                      setAiInstructionEditing((prev) =>
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
                      setAiInstructionEditing((prev) =>
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
                      setAiInstructionEditing((prev) =>
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
                      setAiInstructionEditing((prev) =>
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
              <Button type="button" variant="outline">
                {t("common.cancel")}
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button
                type="button"
                onClick={async () => {
                  if (!aiInstructionEditing) return
                  await updateInstruction({
                    ...aiInstructionEditing,
                    inputSchemaJson: aiInstructionEditing.inputSchemaJson || null,
                    outputSchemaJson: aiInstructionEditing.outputSchemaJson || null,
                  })
                  await refetchInstructions()
                }}
              >
                {t("common.save")}
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={aiInstructionAddOpen} onOpenChange={setAiInstructionAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("ai.addInstructionTitle")}</DialogTitle>
            <DialogDescription>{t("ai.addInstructionDesc")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-2 text-sm">
            {publicAiInstructions.length === 0 ? (
              <div className="text-muted-foreground">{t("ai.noPublicInstructions")}</div>
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
                        <Button
                          type="button"
                          variant="outline"
                          className="h-7"
                          onClick={async () => {
                            await createFromPublic({
                              publicAiInstructionId: instruction.id,
                              userAiProviderId: aiInstructionAddProviderId ?? null,
                              model: aiInstructionAddModel ?? null,
                            })
                            await refetchInstructions()
                            setAiInstructionAddOpen(false)
                          }}
                        >
                          {t("common.add")}
                        </Button>
                      </div>
                    ))}
                </div>
              </>
            )}
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

      <Dialog open={aiInstructionDeleteOpen} onOpenChange={setAiInstructionDeleteOpenState}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("ai.deleteInstructionTitle")}</DialogTitle>
            <DialogDescription>{t("ai.deleteInstructionDesc")}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {t("common.cancel")}
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button
                type="button"
                variant="destructive"
                onClick={async () => {
                  if (!aiInstructionDeleteId) return
                  await deleteInstruction({ id: aiInstructionDeleteId })
                  setAiInstructionDeleteId(null)
                  await refetchInstructions()
                }}
              >
                {t("common.delete")}
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
