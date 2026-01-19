import * as React from "react"
import { useTranslation } from "react-i18next"

import { Card, CardContent, CardHeader, CardTitle } from "@sola/ui"

type AuthCardProps = {
  titleKey: string
  children: React.ReactNode
}

export function AuthCard({ titleKey, children }: AuthCardProps) {
  const { t } = useTranslation()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t(titleKey)}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
