export function normalizeTextForCompare(value: string, language: string) {
  let text = value.trim().toLowerCase()
  if (language.toLowerCase().startsWith("fr")) {
    text = text.normalize("NFD").replace(/\p{Diacritic}/gu, "")
  }
  text = text.replace(/[^\p{L}\p{N}\s]+/gu, "")
  return text.replace(/\s+/g, " ").trim()
}

export function splitSentenceForCloze(value: string, language: string) {
  const normalized = normalizeTextForCompare(value, language)
  if (!normalized) return []
  return normalized.split(" ")
}
