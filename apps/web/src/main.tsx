import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from "react-router-dom"
import { QueryClient } from '@tanstack/react-query'
import { QueryClientAtomProvider } from "jotai-tanstack-query/react"
import { TRPCClientError, httpLink } from '@trpc/client'
import './index.css'
import "./i18n"
import App from './App.tsx'
import { trpc } from './lib/trpc'
import { toast, Toaster } from "@sola/ui"
import { trpcUrl } from "./lib/trpcClient"

const handleGlobalError = (error: unknown) => {
  if (error instanceof TRPCClientError) {
    const code = error.data?.code
    if (code === "UNAUTHORIZED") {
      toast.error("请先登录")
      return
    }
    if (code === "FORBIDDEN") {
      toast.error("没有权限执行该操作")
      return
    }
    if (code === "INTERNAL_SERVER_ERROR") {
      toast.error("服务器异常，请稍后再试")
      return
    }
    if (error.message) {
      toast.error(error.message)
      return
    }
  }
  if (error instanceof Error) {
    toast.error(error.message)
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      onError: handleGlobalError,
    },
    mutations: {
      onError: handleGlobalError,
    },
  },
})
const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: trpcUrl,
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: "include",
        })
      },
    }),
  ],
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientAtomProvider client={queryClient}>
          <App />
          <Toaster />
        </QueryClientAtomProvider>
      </trpc.Provider>
    </HashRouter>
  </StrictMode>,
)
