import { Card, CardContent, CardHeader, CardTitle } from "@sola/ui"

import { SignUpForm } from "@/components/auth/SignUpForm"

export function SignUpPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create account</CardTitle>
      </CardHeader>
      <CardContent>
        <SignUpForm />
      </CardContent>
    </Card>
  )
}

