import { Button, Card, CardContent, CardHeader, CardTitle } from "@sola/ui"

import { trpc } from "@/lib/trpc"

function formatUserAgent(userAgent: string | null | undefined) {
  if (!userAgent) return "Unknown device"
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
      <h1 className="text-2xl font-semibold">Settings</h1>

      <Card>
        <CardHeader className="space-y-1">
          <CardTitle>Device Management</CardTitle>
          <p className="text-sm text-muted-foreground">Active Devices (Max 3)</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-end">
            <Button
              variant="outline"
              disabled={signOutOtherDevices.isPending || sessions.length === 0}
              onClick={() => signOutOtherDevices.mutate()}
            >
              Sign out other devices
            </Button>
          </div>

          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading devices…</p>
          ) : isError ? (
            <p className="text-sm text-destructive">Failed to load devices.</p>
          ) : sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active sessions.</p>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-start justify-between gap-3 rounded-md border p-3"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Device</span>
                      {session.isCurrent ? (
                        <span className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">
                          Current
                        </span>
                      ) : null}
                    </div>
                    <p className="break-words text-sm text-muted-foreground">
                      {formatUserAgent(session.userAgent)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Signed in: {formatTime(session.createdAt)}
                    </p>
                  </div>

                  <div className="text-right text-xs text-muted-foreground">
                    {session.ipAddress ? <div>IP: {session.ipAddress}</div> : <div>IP: —</div>}
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
