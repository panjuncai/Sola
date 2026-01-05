import type { AiManagementApi } from "@/hooks/useAiManagement"
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai"

export type AiProviderType = "volcengine" | "qwen" | "openai" | "gemini" | "aihubmix"

export type InstructionType = "translate" | "explain" | "custom"

export type AiInstruction = {
  id: string
  name: string
  instructionType: InstructionType
  systemPrompt: string
  userPromptTemplate: string
  model: string | null
  inputSchemaJson: string | null
  outputSchemaJson: string | null
  enabled: boolean
  isDefault: boolean
  userAiProviderId: string | null
}

export type PublicAiInstruction = Omit<AiInstruction, "userAiProviderId">

export type AiProviderDraft = {
  id: string
  providerType: string
  apiUrl: string
  name: string | null
  apiKey: string | null
  models: string[]
  availableModels: string[]
  isDefault: boolean
  enabled: boolean
  isPublic: boolean
}

export type AiProviderEditing = {
  id: string
  providerType: string
  name: string | null
  apiUrl: string
  apiKey: string | null
  models: string[]
  enabled: boolean
  isPublic: boolean
}

export type AiProgressState = {
  instructionId: string
  total: number
  completed: number
  running: boolean
} | null

export const aiInstructionAddModelAtom = atom<string | null>(null)
export const aiProvidersDraftAtom = atom<AiProviderDraft[]>([])
export const aiInstructionDraftsAtom = atom<AiInstruction[]>([])
export const aiInstructionEditingAtom = atom<AiInstruction | null>(null)
export const aiInstructionDeleteIdAtom = atom<string | null>(null)
export const aiInstructionAddProviderIdAtom = atom<string | null>(null)
export const newAiProviderNameAtom = atom("")
export const newAiProviderTypeAtom = atom<AiProviderType>("openai")
export const newAiProviderApiUrlAtom = atom("")
export const newAiProviderModelsAtom = atom("")
export const newAiProviderEnabledAtom = atom(true)
export const newAiProviderApiKeyAtom = atom("")
export const newAiProviderKeyVisibleAtom = atom(false)
export const aiProviderEditingAtom = atom<AiProviderEditing | null>(null)
export const aiProviderEditKeyVisibleAtom = atom(false)
export const aiProviderEditModelsAtom = atom("")
export const aiProgressAtom = atom<AiProgressState>(null)
export const aiLastInstructionIdAtom = atom<string | null>(null)
export const publicAiInstructionsAtom = atom<PublicAiInstruction[]>([])

export const aiManagementApiAtom = atom<AiManagementApi | null>(null)

export const useAiManagementState = () => {
  const [aiInstructionAddModel, setAiInstructionAddModel] = useAtom(
    aiInstructionAddModelAtom
  )
  const [aiProvidersDraft, setAiProvidersDraft] = useAtom(aiProvidersDraftAtom)
  const [aiInstructionDrafts, setAiInstructionDrafts] = useAtom(
    aiInstructionDraftsAtom
  )
  const [aiInstructionEditing, setAiInstructionEditing] = useAtom(
    aiInstructionEditingAtom
  )
  const [aiInstructionDeleteId, setAiInstructionDeleteId] = useAtom(
    aiInstructionDeleteIdAtom
  )
  const [aiInstructionAddProviderId, setAiInstructionAddProviderId] = useAtom(
    aiInstructionAddProviderIdAtom
  )
  const [newAiProviderName, setNewAiProviderName] = useAtom(newAiProviderNameAtom)
  const [newAiProviderType, setNewAiProviderType] = useAtom(newAiProviderTypeAtom)
  const [newAiProviderApiUrl, setNewAiProviderApiUrl] = useAtom(
    newAiProviderApiUrlAtom
  )
  const [newAiProviderModels, setNewAiProviderModels] = useAtom(
    newAiProviderModelsAtom
  )
  const [newAiProviderEnabled, setNewAiProviderEnabled] = useAtom(
    newAiProviderEnabledAtom
  )
  const [newAiProviderApiKey, setNewAiProviderApiKey] = useAtom(
    newAiProviderApiKeyAtom
  )
  const [newAiProviderKeyVisible, setNewAiProviderKeyVisible] = useAtom(
    newAiProviderKeyVisibleAtom
  )
  const [aiProviderEditing, setAiProviderEditing] = useAtom(aiProviderEditingAtom)
  const [aiProviderEditKeyVisible, setAiProviderEditKeyVisible] = useAtom(
    aiProviderEditKeyVisibleAtom
  )
  const [aiProviderEditModels, setAiProviderEditModels] = useAtom(
    aiProviderEditModelsAtom
  )
  const [aiProgress, setAiProgress] = useAtom(aiProgressAtom)
  const [aiLastInstructionId, setAiLastInstructionId] = useAtom(
    aiLastInstructionIdAtom
  )
  const [publicAiInstructions, setPublicAiInstructions] = useAtom(
    publicAiInstructionsAtom
  )

  return {
    aiInstructionAddModel,
    setAiInstructionAddModel,
    aiProvidersDraft,
    setAiProvidersDraft,
    aiInstructionDrafts,
    setAiInstructionDrafts,
    aiInstructionEditing,
    setAiInstructionEditing,
    aiInstructionDeleteId,
    setAiInstructionDeleteId,
    aiInstructionAddProviderId,
    setAiInstructionAddProviderId,
    newAiProviderName,
    setNewAiProviderName,
    newAiProviderType,
    setNewAiProviderType,
    newAiProviderApiUrl,
    setNewAiProviderApiUrl,
    newAiProviderModels,
    setNewAiProviderModels,
    newAiProviderEnabled,
    setNewAiProviderEnabled,
    newAiProviderApiKey,
    setNewAiProviderApiKey,
    newAiProviderKeyVisible,
    setNewAiProviderKeyVisible,
    aiProviderEditing,
    setAiProviderEditing,
    aiProviderEditKeyVisible,
    setAiProviderEditKeyVisible,
    aiProviderEditModels,
    setAiProviderEditModels,
    aiProgress,
    setAiProgress,
    aiLastInstructionId,
    setAiLastInstructionId,
    publicAiInstructions,
    setPublicAiInstructions,
  }
}

export const useAiManagementApi = () => useAtomValue(aiManagementApiAtom)

export const useSetAiManagementApi = () => useSetAtom(aiManagementApiAtom)
