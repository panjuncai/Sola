import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useTranslation } from "react-i18next"

import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  toast,
} from "@sola/ui"

import { signUpSchema } from "@/lib/schemas"
import { trpc } from "@/lib/trpc"

export function SignUpForm() {
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

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("auth.name")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("auth.namePlaceholder")}
                  autoComplete="name"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("auth.email")}</FormLabel>
              <FormControl>
                <Input
                  placeholder="you@example.com"
                  autoComplete="email"
                  inputMode="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("auth.password")}</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="new-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nativeLanguage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>母语</FormLabel>
              <FormControl>
                <select
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  {...field}
                >
                  <option value="zh-CN">中文</option>
                  <option value="en-US">English</option>
                  <option value="fr-FR">Français</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="targetLanguage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>外语</FormLabel>
              <FormControl>
                <select
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  {...field}
                >
                  <option value="en-US">English</option>
                  <option value="zh-CN">中文</option>
                  <option value="fr-FR">Français</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting || signUp.isPending}
        >
          {t("auth.createAccount")}
        </Button>

        <div className="text-sm text-muted-foreground text-center">
          {t("auth.haveAccount")}{" "}
          <Link to="/auth/login" className="text-foreground underline underline-offset-4">
            {t("auth.signIn")}
          </Link>
        </div>
      </form>
    </Form>
  )
}
