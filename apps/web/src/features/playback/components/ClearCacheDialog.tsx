import { useTranslation } from "react-i18next"

import {
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
  DialogConfirmButton,
} from "@sola/ui"
import {
  ClearCacheDialogDescription,
  ClearCacheDialogTitle,
  useSettingsDialogs,
} from "@/features/articles"
import { usePlaybackRequired } from "../hooks/init/useInitPlayback"

export const ClearCacheDialog = () => {
  const { t } = useTranslation()
  const { clearCacheOpen, setClearCacheOpen } = useSettingsDialogs()
  const { clearTtsCache } = usePlaybackRequired()

  return (
    <Dialog open={clearCacheOpen} onOpenChange={setClearCacheOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <ClearCacheDialogTitle />
          </DialogTitle>
          <DialogDescription>
            <ClearCacheDialogDescription />
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <DialogClose asChild>
            <DialogCancelButton label={t("common.cancel")} />
          </DialogClose>
          <DialogClose asChild>
            <DialogConfirmButton
              label={t("common.confirm")}
              onClick={() => {
                clearTtsCache().catch(() => {})
              }}
            />
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
