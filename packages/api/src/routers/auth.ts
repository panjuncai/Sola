import { TRPCError } from "@trpc/server"
import { and, asc, desc, eq, ne } from "drizzle-orm"
import { z } from "zod"

import { router, publicProcedure } from "../trpc.js"
import {
  authSessionResponseSchema,
  callAuthEndpoint,
  requireAuthSession,
} from "../auth-session.js"

import { db, sessions, users } from "@sola/db"


export const authRouter = router({
  signUp: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(1),
        name: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return callAuthEndpoint(ctx, "/sign-up/email", {
        method: "POST",
        json: {
          email: input.email,
          password: input.password,
          name: input.name,
        },
      })
    }),

  signIn: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Device limit (max 3 sessions): before creating a new session, evict the oldest one.
      const user = await db.query.users
        .findFirst({
          where: eq(users.email, input.email),
          columns: { id: true },
        })
        .execute()

      if (user) {
        const existing = await db.query.sessions
          .findMany({
            where: eq(sessions.userId, user.id),
            orderBy: asc(sessions.createdAt),
            columns: { id: true },
          })
          .execute()

        if (existing.length >= 3) {
          await db.delete(sessions).where(eq(sessions.id, existing[0]!.id)).run()
        }
      }

      return callAuthEndpoint(ctx, "/sign-in/email", {
        method: "POST",
        json: {
          email: input.email,
          password: input.password,
        },
      })
    }),

  signOut: publicProcedure.mutation(async ({ ctx }) => {
    return callAuthEndpoint(ctx, "/sign-out", {
      method: "POST",
    })
  }),

  getSession: publicProcedure
    .output(authSessionResponseSchema)
    .query(async ({ ctx }) => {
      const result = await callAuthEndpoint(ctx, "/get-session", {
        method: "GET",
      })
      return authSessionResponseSchema.parse(result)
    }),

  getMySessions: publicProcedure
    .output(
      z.array(
        z.object({
          id: z.string(),
          ipAddress: z.string().nullable().optional(),
          userAgent: z.string().nullable().optional(),
          createdAt: z.number(),
          isCurrent: z.boolean(),
        })
      )
    )
    .query(async ({ ctx }) => {
      const session = await requireAuthSession(ctx)
      const currentToken = (session.session as any)?.token as string | undefined

      const rows = await db.query.sessions
        .findMany({
          where: eq(sessions.userId, session.user.id),
          orderBy: desc(sessions.createdAt),
        })
        .execute()

      return rows.map((row) => ({
        id: row.id,
        ipAddress: row.ipAddress ?? null,
        userAgent: row.userAgent ?? null,
        createdAt: row.createdAt instanceof Date ? row.createdAt.getTime() : Number(row.createdAt),
        isCurrent: currentToken ? row.token === currentToken : false,
      }))
    }),

  signOutOtherDevices: publicProcedure.mutation(async ({ ctx }) => {
    const session = await requireAuthSession(ctx)
    const currentToken = (session.session as any)?.token as string | undefined
    if (!currentToken) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Unable to resolve current session token",
      })
    }

    db.delete(sessions)
      .where(and(eq(sessions.userId, session.user.id), ne(sessions.token, currentToken)))
      .run()

    return { ok: true }
  }),
})
