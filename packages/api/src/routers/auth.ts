import { TRPCError } from "@trpc/server"
import { and, asc, desc, eq, ne } from "drizzle-orm"
import { z } from "zod"

import { auth, applySetCookieHeaders } from "../auth.js"
import { router, publicProcedure } from "../trpc.js"

import { db, sessions, users } from "@sola/db"

const authUserSchema = z
  .object({
    id: z.string(),
    email: z.string().email(),
    name: z.string(),
    image: z.string().nullable().optional(),
    emailVerified: z.boolean().optional(),
    createdAt: z.unknown().optional(),
    updatedAt: z.unknown().optional(),
  })
  .passthrough()

const authSessionSchema = z.object({}).passthrough()

const authSessionResponseSchema = z
  .object({
    session: authSessionSchema,
    user: authUserSchema,
  })
  .nullable()

async function requireAuthSession(ctx: {
  req: import("node:http").IncomingMessage
  res: import("node:http").ServerResponse
}) {
  const result = await callAuthEndpoint(ctx, "/get-session", { method: "GET" })
  const parsed = authSessionResponseSchema.parse(result)
  if (!parsed) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" })
  }
  return parsed
}

function toHeaders(input: import("node:http").IncomingHttpHeaders) {
  const headers = new Headers()
  for (const [key, value] of Object.entries(input)) {
    if (value == null) continue
    if (Array.isArray(value)) headers.set(key, value.join(","))
    else headers.set(key, value)
  }
  return headers
}

function resolveAuthUrl(path: string) {
  const baseURL = auth.options.baseURL ?? "http://localhost:6001"
  const basePath = auth.options.basePath ?? "/api/auth"
  const normalizedBase = baseURL.replace(/\/$/, "")
  const normalizedPath = `${basePath.replace(/\/$/, "")}${path.startsWith("/") ? "" : "/"}${path}`
  return `${normalizedBase}${normalizedPath}`
}

async function callAuthEndpoint<T>(
  ctx: { req: import("node:http").IncomingMessage; res: import("node:http").ServerResponse },
  path: string,
  init: RequestInit & { json?: unknown } = {}
): Promise<T> {
  const headers = toHeaders(ctx.req.headers)

  if (init.json !== undefined) {
    headers.set("content-type", "application/json")
  }

  const request = new Request(resolveAuthUrl(path), {
    method: init.method ?? "GET",
    headers,
    ...(init.json !== undefined
      ? { body: JSON.stringify(init.json) }
      : init.body !== undefined
        ? { body: init.body }
        : {}),
  })

  const response = await auth.handler(request)
  applySetCookieHeaders(response, ctx.res)

  const text = await response.text()
  const data = text ? (JSON.parse(text) as unknown) : null

  if (!response.ok) {
    const message =
      (data &&
        typeof data === "object" &&
        "message" in data &&
        typeof (data as any).message === "string" &&
        (data as any).message) ||
      `Auth request failed (${response.status})`

    throw new TRPCError({
      code: "BAD_REQUEST",
      message,
    })
  }

  return data as T
}

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
