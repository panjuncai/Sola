import { createTRPCReact } from "@trpc/react-query"

import type { AppRouter } from "@sola/api"

export const trpc = createTRPCReact<AppRouter>()
