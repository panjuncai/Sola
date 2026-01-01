import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"

import { db, users, sessions, accounts, verifications } from "@sola/db"

const baseURL = process.env.BETTER_AUTH_URL ?? "http://localhost:6001"
const basePath = process.env.BETTER_AUTH_BASE_PATH ?? "/api/auth"
const secret =
  process.env.BETTER_AUTH_SECRET ??
  "better-auth-secret-that-is-long-enough-for-dev"

const trustedOrigins = (() => {
  const env = process.env.BETTER_AUTH_TRUSTED_ORIGINS
  if (env) return env.split(",").map((s) => s.trim()).filter(Boolean)
  if (process.env.NODE_ENV === "production") return undefined
  return ["http://localhost:5173", "http://127.0.0.1:5173"]
})()

export const auth = betterAuth({
  baseURL,
  basePath,
  secret,
  trustedOrigins,
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: {
      users,
      sessions,
      accounts,
      verifications,
    },
    usePlural: true,
    camelCase: true,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 1,
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    sendVerificationEmail: async ({ user, url, token }) => {
      console.log("[BetterAuth] verification email (mock)", {
        to: user.email,
        url,
        token,
      })
    },
  },
})

export function applySetCookieHeaders(
  response: Response,
  res: import("node:http").ServerResponse
) {
  const anyHeaders = response.headers as unknown as {
    getSetCookie?: () => string[]
  }

  const setCookies =
    typeof anyHeaders.getSetCookie === "function"
      ? anyHeaders.getSetCookie()
      : (() => {
          const header = response.headers.get("set-cookie")
          return header ? [header] : []
        })()

  if (setCookies.length === 0) return

  const existing = res.getHeader("set-cookie")
  if (!existing) {
    res.setHeader("set-cookie", setCookies)
    return
  }
  const existingArray = Array.isArray(existing) ? existing : [String(existing)]
  res.setHeader("set-cookie", [...existingArray, ...setCookies])
}
