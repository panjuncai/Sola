export type ArticleListItem = {
  id: string
  title: string | null
  sourceType: string
  nativeLanguage: string
  targetLanguage: string
  displayOrder: string
  createdAt: number
  updatedAt: number
}

export type ArticleDetail = {
  id: string
  title: string | null
  content: string
  sourceType: string
  nativeLanguage: string
  targetLanguage: string
  displayOrder: string
  createdAt: number
  updatedAt: number
}

export type ArticleSentence = {
  id: string
  orderIndex: number
  paragraphIndex: number
  targetText: string | null
  nativeText: string | null
}
