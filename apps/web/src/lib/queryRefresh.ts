import type { QueryClient } from "@tanstack/react-query"

type ArticleGetInput = { articleId?: string }
type TtsOptionsInput = { nativeLanguage: string; targetLanguage: string }

export const refreshArticleList = (queryClient: QueryClient) =>
  queryClient.invalidateQueries({ queryKey: ["article.list"] })

export const refreshArticleDetail = (
  queryClient: QueryClient,
  articleId: string
) =>
  queryClient.invalidateQueries({
    predicate: (query) => {
      const [key, input] = query.queryKey as [string, ArticleGetInput?]
      return key === "article.get" && input?.articleId === articleId
    },
  })

export const refreshAiProviders = (queryClient: QueryClient) =>
  queryClient.invalidateQueries({ queryKey: ["user.getAiProviders"] })

export const refreshUserAiInstructions = (queryClient: QueryClient) =>
  queryClient.invalidateQueries({ queryKey: ["user.getUserAiInstructions"] })

export const refreshPublicAiInstructions = (queryClient: QueryClient) =>
  queryClient.invalidateQueries({ queryKey: ["user.getPublicAiInstructions"] })

export const refreshAiInstructions = (queryClient: QueryClient) =>
  Promise.all([
    refreshUserAiInstructions(queryClient),
    refreshPublicAiInstructions(queryClient),
  ])

export const refreshSettings = (queryClient: QueryClient) =>
  queryClient.invalidateQueries({ queryKey: ["user.getSettings"] })

export const refreshTtsOptions = (
  queryClient: QueryClient,
  input: TtsOptionsInput
) =>
  queryClient.invalidateQueries({
    predicate: (query) => {
      const [key, params] = query.queryKey as [string, TtsOptionsInput?]
      return (
        key === "user.getTtsOptions" &&
        params?.nativeLanguage === input.nativeLanguage &&
        params?.targetLanguage === input.targetLanguage
      )
    },
  })
