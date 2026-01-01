import { router, publicProcedure } from "./trpc.js"
import { authRouter } from "./routers/auth.js"
import { articleRouter } from "./routers/article.js"

export const appRouter = router({
  health: publicProcedure.query(() => "Sola API (Fastify) is running"),
  auth: authRouter,
  article: articleRouter,
})

export type AppRouter = typeof appRouter
