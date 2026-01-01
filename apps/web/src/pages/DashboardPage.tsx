import * as React from "react"

import { Button, ResponsiveOverlay } from "@sola/ui"

import { trpc } from "@/lib/trpc"
import { usePlayerStore } from "@/stores/usePlayerStore"

export function DashboardPage() {
  const { data, isLoading } = trpc.health.useQuery()
  const [overlayOpen, setOverlayOpen] = React.useState(false)
  const { play } = usePlayerStore((state) => state.actions)

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          tRPC health check + responsive overlay demo.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button className="bg-blue-500 hover:bg-blue-700" disabled={isLoading}>
          {isLoading ? "Connecting..." : data}
        </Button>
        <Button variant="outline" type="button" onClick={() => setOverlayOpen(true)}>
          Open Responsive Overlay
        </Button>
        <Button type="button" variant="secondary" onClick={() => play(1)}>
          Play Demo Article #1
        </Button>
      </div>

      <ResponsiveOverlay
        open={overlayOpen}
        onOpenChange={setOverlayOpen}
        title="ResponsiveOverlay"
        description="Mobile uses Drawer; desktop uses Dialog."
      >
        <div className="space-y-2 text-sm">
          <p>This content is shared across breakpoints.</p>
          <p className="text-muted-foreground">
            Try resizing the window to see Drawer/Dialog switch at <code>md</code>.
          </p>
        </div>
      </ResponsiveOverlay>
    </div>
  )
}
