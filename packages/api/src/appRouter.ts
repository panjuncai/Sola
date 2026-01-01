import { router, publicProcedure } from "./trpc.js"
import { authRouter } from "./routers/auth.js"

export const appRouter = router({
  health: publicProcedure.query(() => "Sola API (Fastify) is running"),
  auth: authRouter,
})

export type AppRouter = typeof appRouter
