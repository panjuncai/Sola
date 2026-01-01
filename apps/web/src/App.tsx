import { Navigate, Outlet, Route, Routes } from "react-router-dom"

import { ArticleList } from "./pages/ArticleList"
import { ArticleDetail } from "./pages/ArticleDetail"
import { SettingsPage } from "./pages/SettingsPage"
import { AuthLayout } from "./pages/auth/AuthLayout"
import { LoginPage } from "./pages/auth/LoginPage"
import { SignUpPage } from "./pages/auth/SignUpPage"
import { AuthGuard } from "./components/auth/AuthGuard"
import { GlobalPlayer } from "./components/GlobalPlayer"

function AppFrame() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Outlet />
      <GlobalPlayer />
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
        <Route path="/articles/:articleId" element={<ArticleDetail />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/dashboard" element={<Navigate to="/articles" replace />} />
      </Route>
    </Routes>
  )
}
