export const AI_INSTRUCTION_TYPES = ["translate", "explain", "custom"] as const
export type AiInstructionType = (typeof AI_INSTRUCTION_TYPES)[number]

export const AI_PROVIDER_TYPES = [
  "volcengine",
  "qwen",
  "openai",
  "gemini",
  "aihubmix",
] as const
export type AiProviderType = (typeof AI_PROVIDER_TYPES)[number]
