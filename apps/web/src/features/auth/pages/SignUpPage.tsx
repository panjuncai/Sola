import { AuthCard } from "../components/AuthCard"
import { SignUpForm } from "../components/SignUpForm"

export function SignUpPage() {
  return (
    <AuthCard titleKey="auth.createAccount">
      <SignUpForm />
    </AuthCard>
  )
}
