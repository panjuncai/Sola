import { TRPCError } from "@trpc/server"
import { z } from "zod"

import { auth, applySetCookieHeaders } from "./auth.js"

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

export async function callAuthEndpoint<T>(
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

export async function requireAuthSession(ctx: {
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

export { authSessionResponseSchema }
