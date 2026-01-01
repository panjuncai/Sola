import type { AppRouter } from "@sola/api"
import type { inferRouterOutputs } from "@trpc/server"

type RouterOutput = inferRouterOutputs<AppRouter>

export type AuthSession = RouterOutput["auth"]["getSession"]
export type User = NonNullable<AuthSession>["user"]

