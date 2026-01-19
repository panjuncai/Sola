import { atom, useAtom } from "jotai"
import type {
  AiInstructionType,
  AiProviderType as SharedAiProviderType,
} from "@sola/shared"

export type AiProviderType = SharedAiProviderType
export type InstructionType = AiInstructionType

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

export type AiProviderEditing = {
  id: string
  providerType: AiProviderType
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

const aiInstructionAddModelAtom = atom<string | null>(null)
const aiInstructionEditingAtom = atom<AiInstruction | null>(null)
const aiInstructionDeleteIdAtom = atom<string | null>(null)
const aiInstructionAddProviderIdAtom = atom<string | null>(null)
const newAiProviderNameAtom = atom("")
const newAiProviderTypeAtom = atom<AiProviderType>("openai")
const newAiProviderApiUrlAtom = atom("")
const newAiProviderModelsAtom = atom("")
const newAiProviderEnabledAtom = atom(true)
const newAiProviderApiKeyAtom = atom("")
const newAiProviderKeyVisibleAtom = atom(false)
const aiProviderEditingAtom = atom<AiProviderEditing | null>(null)
const aiProviderEditKeyVisibleAtom = atom(false)
const aiProviderEditModelsAtom = atom("")
const aiProgressAtom = atom<AiProgressState>(null)
const aiLastInstructionIdAtom = atom<string | null>(null)

export const useAiManagementState = () => {
  const [aiInstructionAddModel, setAiInstructionAddModel] = useAtom(
    aiInstructionAddModelAtom
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

  return {
    aiInstructionAddModel,
    setAiInstructionAddModel,
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
  }
}
