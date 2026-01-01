import { Card, CardContent, CardHeader, CardTitle } from "@sola/ui"

import { LoginForm } from "@/components/auth/LoginForm"

export function LoginPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
    </Card>
  )
}

