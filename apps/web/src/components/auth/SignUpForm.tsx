import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useNavigate } from "react-router-dom"
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

import { signUpSchema } from "@/lib/schemas"
import { trpc } from "@/lib/trpc"

export function SignUpForm() {
  const navigate = useNavigate()
  const signUp = trpc.auth.signUp.useMutation({
    onSuccess: () => {
      toast.success("Account created. Check your email to verify.")
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
    console.log(data)
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
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Your name" autoComplete="name" {...field} />
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
          Create account
        </Button>

        <div className="text-sm text-muted-foreground text-center">
          Already have an account?{" "}
          <Link to="/auth/login" className="text-foreground underline underline-offset-4">
            Sign in
          </Link>
        </div>
      </form>
    </Form>
  )
}
