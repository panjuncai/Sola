import { Navigate, Outlet, Route, Routes } from "react-router-dom"

import { ArticleListPage } from "./pages/ArticleListPage"
import { AuthGuard, AuthLayout, LoginPage, SignUpPage } from "./features/auth"

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
        <Route path="/articles" element={<ArticleListPage />} />
        <Route path="/articles/:articleId" element={<ArticleListPage />} />
      </Route>
    </Routes>
  )
}
