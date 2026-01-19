import { zodResolver } from "@hookform/resolvers/zod"
import { useLocation, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useTranslation } from "react-i18next"

import { toast } from "@sola/ui"

import { loginSchema } from "@/lib/schemas"
import { trpc } from "@/lib/trpc"
import { useAuthStore } from "@/stores/useAuthStore"

export const useLoginFormView = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const utils = trpc.useUtils()

  const signIn = trpc.auth.signIn.useMutation({
    onSuccess: async () => {
      const session = await utils.auth.getSession.fetch().catch(() => null)
      useAuthStore.getState().setUser(session?.user ?? null)
      utils.auth.getSession.invalidate()
      toast.success(t("auth.signInSuccess"))
      const from = (location.state as { from?: string } | null)?.from
      navigate(from || "/", { replace: true })
    },
    onError: (err) => {
      if (err.message === "User not found") {
        toast.error("用户不存在")
        return
      }
      if (err.message === "Incorrect password") {
        toast.error("密码错误")
        return
      }
      toast.error(err.message)
    },
  })

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onBlur",
  })

  const onSubmit = form.handleSubmit((data) => {
    signIn.mutate(data)
  })

  return {
    t,
    form,
    onSubmit,
    isSubmitting: form.formState.isSubmitting,
    isPending: signIn.isPending,
  }
}
