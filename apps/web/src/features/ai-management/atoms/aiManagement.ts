import { atom, useAtom } from "jotai"
import type {
  AiInstructionType,
  AiProviderType as SharedAiProviderType,
} from "@sola/shared"

type AiProviderType = SharedAiProviderType
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

type AiProviderEditing = {
  id: string
  providerType: AiProviderType
  name: string | null
  apiUrl: string
  apiKey: string | null
  models: string[]
  enabled: boolean
  isPublic: boolean
}

type AiProgressState = {
  instructionId: string
  total: number
  completed: number
  running: boolean
} | null

const uiAiInstructionAddModelAtom = atom<string | null>(null)
const uiAiInstructionEditingAtom = atom<AiInstruction | null>(null)
const uiAiInstructionDeleteIdAtom = atom<string | null>(null)
const uiAiInstructionAddProviderIdAtom = atom<string | null>(null)
const uiNewAiProviderNameAtom = atom("")
const uiNewAiProviderTypeAtom = atom<AiProviderType>("openai")
const uiNewAiProviderApiUrlAtom = atom("")
const uiNewAiProviderModelsAtom = atom("")
const uiNewAiProviderEnabledAtom = atom(true)
const uiNewAiProviderApiKeyAtom = atom("")
const uiNewAiProviderKeyVisibleAtom = atom(false)
const uiAiProviderEditingAtom = atom<AiProviderEditing | null>(null)
const uiAiProviderEditKeyVisibleAtom = atom(false)
const uiAiProviderEditModelsAtom = atom("")
const uiAiProgressAtom = atom<AiProgressState>(null)
const uiAiLastInstructionIdAtom = atom<string | null>(null)

export const useAiManagementState = () => {
  const [aiInstructionAddModel, setAiInstructionAddModel] = useAtom(
    uiAiInstructionAddModelAtom
  )
  const [aiInstructionEditing, setAiInstructionEditing] = useAtom(
    uiAiInstructionEditingAtom
  )
  const [aiInstructionDeleteId, setAiInstructionDeleteId] = useAtom(
    uiAiInstructionDeleteIdAtom
  )
  const [aiInstructionAddProviderId, setAiInstructionAddProviderId] = useAtom(
    uiAiInstructionAddProviderIdAtom
  )
  const [newAiProviderName, setNewAiProviderName] = useAtom(
    uiNewAiProviderNameAtom
  )
  const [newAiProviderType, setNewAiProviderType] = useAtom(
    uiNewAiProviderTypeAtom
  )
  const [newAiProviderApiUrl, setNewAiProviderApiUrl] = useAtom(
    uiNewAiProviderApiUrlAtom
  )
  const [newAiProviderModels, setNewAiProviderModels] = useAtom(
    uiNewAiProviderModelsAtom
  )
  const [newAiProviderEnabled, setNewAiProviderEnabled] = useAtom(
    uiNewAiProviderEnabledAtom
  )
  const [newAiProviderApiKey, setNewAiProviderApiKey] = useAtom(
    uiNewAiProviderApiKeyAtom
  )
  const [newAiProviderKeyVisible, setNewAiProviderKeyVisible] = useAtom(
    uiNewAiProviderKeyVisibleAtom
  )
  const [aiProviderEditing, setAiProviderEditing] = useAtom(uiAiProviderEditingAtom)
  const [aiProviderEditKeyVisible, setAiProviderEditKeyVisible] = useAtom(
    uiAiProviderEditKeyVisibleAtom
  )
  const [aiProviderEditModels, setAiProviderEditModels] = useAtom(
    uiAiProviderEditModelsAtom
  )
  const [aiProgress, setAiProgress] = useAtom(uiAiProgressAtom)
  const [aiLastInstructionId, setAiLastInstructionId] = useAtom(
    uiAiLastInstructionIdAtom
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
