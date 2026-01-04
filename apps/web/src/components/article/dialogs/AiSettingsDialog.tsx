import { useTranslation } from "react-i18next"

import { AiSettingsDialog as AiSettingsDialogView } from "@/components/article/AiSettingsDialog"
import { useAiManagement } from "@/hooks/useAiManagement"
import { useSettings } from "@/hooks/useSettings"

export const AiSettingsDialog = () => {
  const { t } = useTranslation()
  const { useAiUserKey, setUseAiUserKey, persistSettings } = useSettings()
  const {
    aiDialogOpen,
    setAiDialogOpen,
    aiProvidersDraft,
    setAiProvidersDraft,
    setAiProviderAddOpen,
    setAiProviderEditOpen,
    setAiProviderEditing,
    setAiProviderEditModels,
    setAiProviderEditKeyVisible,
    setAiProviderDeleteId,
    setAiProviderResetOpen,
    saveAiProvidersDraft,
  } = useAiManagement()

  return (
    <AiSettingsDialogView
      t={t}
      open={aiDialogOpen}
      onOpenChange={setAiDialogOpen}
      useAiUserKey={useAiUserKey}
      onUsePublic={() => {
        setUseAiUserKey(false)
        persistSettings({ useAiUserKey: false })
      }}
      onUsePrivate={() => {
        setUseAiUserKey(true)
        persistSettings({ useAiUserKey: true })
      }}
      aiProvidersDraft={aiProvidersDraft}
      onSetDefault={(id) => {
        setAiProvidersDraft((prev) => {
          const next = prev.map((item) => ({
            ...item,
            isDefault: item.id === id,
          }))
          return [...next].sort((a, b) => Number(b.isDefault) - Number(a.isDefault))
        })
      }}
      onEdit={(provider) => {
        setAiProviderEditing({ ...provider })
        setAiProviderEditModels(provider.models.join(", "))
        setAiProviderEditKeyVisible(false)
        setAiProviderEditOpen(true)
      }}
      onDelete={(id) => setAiProviderDeleteId(id)}
      onReset={() => setAiProviderResetOpen(true)}
      onAddCustom={() => setAiProviderAddOpen(true)}
      onSave={saveAiProvidersDraft}
    />
  )
}
