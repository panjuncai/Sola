import {
  ArticleBulkDeleteDialog,
  SentenceEditDialog,
  SentenceDeleteDialog,
  DeleteAccountDialog,
  LanguageSettingsDialog,
  ShadowingDialog,
} from "@/features/articles"

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
