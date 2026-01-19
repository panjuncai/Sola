import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useTranslation } from "react-i18next"

import { toast } from "@sola/ui"

import { signUpSchema } from "@/lib/schemas"
import { trpc } from "@/lib/trpc"

export const useSignUpFormView = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const signUp = trpc.auth.signUp.useMutation({
    onSuccess: () => {
      toast.success(t("auth.signUpSuccess"))
      navigate("/auth/login", { replace: true })
    },
    onError: (err) => {
      toast.error(err.message)
    },
  })

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      nativeLanguage: "zh-CN",
      targetLanguage: "en-US",
    },
    mode: "onChange",
  })

  const onSubmit = form.handleSubmit((data) => {
    signUp.mutate(data)
  })

  return {
    t,
    form,
    onSubmit,
    isSubmitting: form.formState.isSubmitting,
    isPending: signUp.isPending,
  }
}
