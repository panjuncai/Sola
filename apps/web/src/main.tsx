import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from "react-router-dom"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpLink } from '@trpc/client'
import './index.css'
import "./i18n"
import App from './App.tsx'
import { trpc } from './lib/trpc'
import { Toaster } from "@sola/ui"

const queryClient = new QueryClient()
const apiBaseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, "")
const trpcUrl = apiBaseUrl
  ? `${apiBaseUrl}/trpc`
  : import.meta.env.DEV
    ? "http://localhost:6001/trpc"
    : "/trpc"
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
        <QueryClientProvider client={queryClient}>
          <App />
          <Toaster />
        </QueryClientProvider>
      </trpc.Provider>
    </HashRouter>
  </StrictMode>,
)
