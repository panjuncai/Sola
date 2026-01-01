import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink } from '@trpc/client'
import './index.css'
import App from './App.tsx'
import { trpc } from './lib/trpc'
import { Toaster } from "@sola/ui"

const queryClient = new QueryClient()
const apiBaseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, "")
const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: !import.meta.env.DEV && apiBaseUrl ? `${apiBaseUrl}/trpc` : "/trpc",
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
    <BrowserRouter>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <App />
          <Toaster />
        </QueryClientProvider>
      </trpc.Provider>
    </BrowserRouter>
  </StrictMode>,
)
