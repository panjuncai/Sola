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

import { useSettingsDialogs } from "@/hooks/useSettingsDialogs"

export const ShadowingDialog = () => {
  const { t } = useTranslation()
  const {
    shadowingDialogOpen,
    setShadowingDialogOpen,
    shadowingDraftEnabled,
    setShadowingDraftEnabled,
    shadowingDraftSpeeds,
    setShadowingDraftSpeeds,
    confirmShadowingDraft,
  } = useSettingsDialogs()

  return (
    <Dialog open={shadowingDialogOpen} onOpenChange={setShadowingDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("shadowing.title")}</DialogTitle>
          <DialogDescription>{t("shadowing.desc")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="flex items-center justify-between">
            <span>{t("shadowing.label")}</span>
            <button
              type="button"
              className={cn(
                "relative h-5 w-10 rounded-full transition",
                shadowingDraftEnabled ? "bg-primary" : "bg-muted"
              )}
              onClick={() => setShadowingDraftEnabled((prev: boolean) => !prev)}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-4 w-4 rounded-full bg-background shadow transition",
                  shadowingDraftEnabled ? "left-5" : "left-1"
                )}
              />
            </button>
          </div>

          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">
              {t("shadowing.speedList")}
            </div>
            {shadowingDraftSpeeds.map((speed: number, index: number) => (
              <div key={`${speed}-${index}`} className="flex items-center gap-2">
                <input
                  type="number"
                  step={0.1}
                  min={0.1}
                  max={2}
                  className="h-9 w-24 rounded-md border bg-background px-2 text-sm"
                  value={speed}
                  onChange={(event) => {
                    const value = Number(event.target.value)
                    setShadowingDraftSpeeds((prev: number[]) => {
                      const next = [...prev]
                      next[index] = Number.isFinite(value) ? value : 0
                      return next
                    })
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 w-9 p-0"
                  onClick={() =>
                    setShadowingDraftSpeeds((prev: number[]) =>
                      prev.filter((_: number, itemIndex: number) => itemIndex !== index)
                    )
                  }
                >
                  —
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              className="h-9 w-full justify-center"
              onClick={() => {
                setShadowingDraftSpeeds((prev: number[]) => {
                  const base = prev[prev.length - 1] ?? 0.2
                  const next = Math.round((base + 0.2) * 10) / 10
                  return [...prev, next]
                })
              }}
            >
              + {t("shadowing.addSpeed")}
            </Button>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              {t("common.cancel")}
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button type="button" onClick={confirmShadowingDraft}>
              OK
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
