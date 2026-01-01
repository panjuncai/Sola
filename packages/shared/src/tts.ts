export interface TtsCacheKeyInput {
  userId: string
  sentenceId: string
  languageCode: string
  providerType: string
  voiceId: string
  region?: string | null
  speed?: number | null
}

export function normalizeTtsSpeed(speed?: number | null) {
  const value = Number.isFinite(speed) ? Number(speed) : 1
  return value
}

export function buildTtsCacheKey(input: TtsCacheKeyInput) {
  const speed = normalizeTtsSpeed(input.speed)
  return [
    input.userId,
    input.sentenceId,
    input.languageCode,
    input.providerType,
    input.voiceId,
    input.region ?? "",
    speed.toFixed(2),
  ].join(":")
}
