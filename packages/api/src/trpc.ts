import type { IncomingMessage, ServerResponse } from "node:http"
import { initTRPC } from "@trpc/server"

export type Context = {
  req: IncomingMessage
  res: ServerResponse
}

export const t = initTRPC.context<Context>().create()

export const router = t.router
export const publicProcedure = t.procedure
