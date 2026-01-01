import { create } from "zustand"

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
  targetText: string
  nativeText: string | null
}

interface ArticleState {
  articles: ArticleListItem[]
  currentArticle: ArticleDetail | null
  sentences: ArticleSentence[]
  setArticles: (articles: ArticleListItem[]) => void
  setCurrentArticle: (article: ArticleDetail, sentences: ArticleSentence[]) => void
  clearCurrentArticle: () => void
}

export const useArticleStore = create<ArticleState>((set) => ({
  articles: [],
  currentArticle: null,
  sentences: [],
  setArticles: (articles) => set({ articles }),
  setCurrentArticle: (article, sentences) => set({ currentArticle: article, sentences }),
  clearCurrentArticle: () => set({ currentArticle: null, sentences: [] }),
}))
