import { router, publicProcedure } from "./trpc.js"
import { authRouter } from "./routers/auth.js"
import { articleRouter } from "./routers/article.js"
import { userRouter } from "./routers/user.js"
import { ttsRouter } from "./routers/tts.js"

export const appRouter = router({
  health: publicProcedure.query(() => "Sola API (Fastify) is running"),
  auth: authRouter,
  article: articleRouter,
  user: userRouter,
  tts: ttsRouter,
})

export type AppRouter = typeof appRouter
