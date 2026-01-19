import { AuthCard } from "../components/AuthCard"
import { LoginForm } from "../components/LoginForm"

export function LoginPage() {
  return (
    <AuthCard titleKey="auth.signIn">
      <LoginForm />
    </AuthCard>
  )
}
