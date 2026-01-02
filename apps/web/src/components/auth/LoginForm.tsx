import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { z } from "zod"

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

import { loginSchema } from "@/lib/schemas"
import { trpc } from "@/lib/trpc"
import { useAuthStore } from "@/stores/useAuthStore"

export function LoginForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const utils = trpc.useUtils()
  const signIn = trpc.auth.signIn.useMutation({
    onSuccess: async () => {
      // Immediately sync session to avoid redirect loops (AuthGuard) and ensure navigation works.
      const session = await utils.auth.getSession.fetch().catch(() => null)
      useAuthStore.getState().setUser(session?.user ?? null)
      utils.auth.getSession.invalidate()
      toast.success("Signed in")
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

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
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
              <FormLabel>Password</FormLabel>
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
          disabled={form.formState.isSubmitting || signIn.isPending}
        >
          Sign in
        </Button>

        <div className="text-sm text-muted-foreground text-center">
          Don't have an account?{" "}
          <Link to="/auth/sign-up" className="text-foreground underline underline-offset-4">
            Sign up
          </Link>
        </div>
      </form>
    </Form>
  )
}
