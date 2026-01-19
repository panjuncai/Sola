import { Link } from "react-router-dom"

import { Button, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Input } from "@sola/ui"
import { useLoginFormView } from "../hooks/view/useLoginFormView"

export function LoginForm() {
  const { t, form, onSubmit, isSubmitting, isPending } = useLoginFormView()

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4">
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
                <Input type="password" autoComplete="current-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || isPending}
        >
          {t("auth.signIn")}
        </Button>

        <div className="text-sm text-muted-foreground text-center">
          {t("auth.noAccount")}{" "}
          <Link to="/auth/sign-up" className="text-foreground underline underline-offset-4">
            {t("auth.signUp")}
          </Link>
        </div>
      </form>
    </Form>
  )
}
