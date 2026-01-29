import { ArticleBulkDeleteDialog } from "./dialogs/ArticleBulkDeleteDialog"
import { SentenceEditDialog } from "./dialogs/SentenceEditDialog"
import { SentenceDeleteDialog } from "./dialogs/SentenceDeleteDialog"
import { DeleteAccountDialog } from "../../settings/components/DeleteAccountDialog"
import { LanguageSettingsDialog } from "./LanguageSettingsDialog"
import { ShadowingDialog } from "./ShadowingDialog"

export const ArticlesDialogs = () => {
  return (
    <>
      <ArticleBulkDeleteDialog />
      <SentenceEditDialog />
      <SentenceDeleteDialog />
      <DeleteAccountDialog />
      <LanguageSettingsDialog />
      <ShadowingDialog />
    </>
  )
}
