const normalizeTextForCompare = (value: string, language: string) => {
  let text = value.toLowerCase().trim()
  if (language.toLowerCase().startsWith("fr")) {
    text = text.normalize("NFD").replace(/\p{Diacritic}/gu, "")
  }
  text = text.replace(/[\p{P}\p{S}]/gu, " ")
  text = text.replace(/\s+/g, " ").trim()
  return text
}

export const splitSentenceForCloze = (value: string, language: string) => {
  const normalized = normalizeTextForCompare(value, language)
  if (!normalized) return []
  return normalized.split(" ")
}
