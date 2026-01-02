import { Button, Card, CardContent, CardHeader, CardTitle } from "@sola/ui"
import { useTranslation } from "react-i18next"

import { trpc } from "@/lib/trpc"

function formatUserAgent(userAgent: string | null | undefined, fallback: string) {
  if (!userAgent) return fallback
  const short = userAgent.replace(/\s+/g, " ").trim()
  return short.length > 48 ? `${short.slice(0, 48)}…` : short
}

function formatTime(ms: number) {
  try {
    return new Date(ms).toLocaleString()
  } catch {
    return String(ms)
  }
}

export function SettingsPage() {
  const { t } = useTranslation()
  const utils = trpc.useUtils()
  const { data, isLoading, isError } = trpc.auth.getMySessions.useQuery()
  const signOutOtherDevices = trpc.auth.signOutOtherDevices.useMutation({
    onSuccess: async () => {
      await utils.auth.getMySessions.invalidate()
    },
  })

  const sessions = data ?? []

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">{t("settingsPage.title")}</h1>

      <Card>
        <CardHeader className="space-y-1">
          <CardTitle>{t("settingsPage.deviceTitle")}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {t("settingsPage.deviceSubtitle")}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-end">
            <Button
              variant="outline"
              disabled={signOutOtherDevices.isPending || sessions.length === 0}
              onClick={() => signOutOtherDevices.mutate()}
            >
              {t("settingsPage.signOutOther")}
            </Button>
          </div>

          {isLoading ? (
            <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
          ) : isError ? (
            <p className="text-sm text-destructive">{t("settingsPage.loadFailed")}</p>
          ) : sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("settingsPage.noSessions")}
            </p>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-start justify-between gap-3 rounded-md border p-3"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {t("settingsPage.deviceLabel")}
                      </span>
                      {session.isCurrent ? (
                        <span className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">
                          {t("settingsPage.current")}
                        </span>
                      ) : null}
                    </div>
                    <p className="break-words text-sm text-muted-foreground">
                      {formatUserAgent(session.userAgent, t("settingsPage.unknownDevice"))}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("settingsPage.signedInAt", {
                        time: formatTime(session.createdAt),
                      })}
                    </p>
                  </div>

                  <div className="text-right text-xs text-muted-foreground">
                    {session.ipAddress ? (
                      <div>
                        {t("settingsPage.ipLabel")}: {session.ipAddress}
                      </div>
                    ) : (
                      <div>{t("settingsPage.ipLabel")}: —</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
