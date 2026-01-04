import { Navigate, Outlet, Route, Routes } from "react-router-dom"

import { ArticleList } from "./pages/ArticleList"
import { AuthLayout } from "./pages/auth/AuthLayout"
import { LoginPage } from "./pages/auth/LoginPage"
import { SignUpPage } from "./pages/auth/SignUpPage"
import { AuthGuard } from "./components/auth/AuthGuard"

function AppFrame() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Outlet />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <AuthGuard>
            <Navigate to="/articles" replace />
          </AuthGuard>
        }
      />

      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="sign-up" element={<SignUpPage />} />
      </Route>

      <Route element={<AuthGuard><AppFrame /></AuthGuard>}>
        <Route path="/articles" element={<ArticleList />} />
      </Route>
    </Routes>
  )
}
