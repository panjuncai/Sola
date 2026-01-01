import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const signUpSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(1),
  nativeLanguage: z.enum(["zh-CN", "en-US", "fr-FR"]),
  targetLanguage: z.enum(["zh-CN", "en-US", "fr-FR"]),
})
