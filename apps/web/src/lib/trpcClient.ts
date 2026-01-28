import { createTRPCProxyClient, httpLink } from "@trpc/client"
import type { AppRouter } from "@sola/api"

export const trpcUrl = (() => {
  const apiBaseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, "")
  if (apiBaseUrl) {
    return `${apiBaseUrl}/trpc`
  }
  return import.meta.env.DEV ? "http://localhost:6001/trpc" : "/trpc"
})()

export const trpcClient = createTRPCProxyClient<AppRouter>({
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
