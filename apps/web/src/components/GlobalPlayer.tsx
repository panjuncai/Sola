import { Button, Card, CardContent } from "@sola/ui"

import { usePlayerStore } from "@/stores/usePlayerStore"

export function GlobalPlayer() {
  const currentArticleId = usePlayerStore((state) => state.currentArticleId)
  const isPlaying = usePlayerStore((state) => state.isPlaying)
  const { pause, play } = usePlayerStore((state) => state.actions)

  if (currentArticleId == null) return null

  return (
    <div className="fixed inset-x-0 bottom-16 md:bottom-0 z-50 pb-safe">
      <div className="mx-auto w-full max-w-2xl p-3">
        <Card className="shadow-lg">
          <CardContent className="flex items-center justify-between gap-3 py-3">
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">
                Playing Article: {currentArticleId}
              </div>
              <div className="text-xs text-muted-foreground">
                {isPlaying ? "Playing" : "Paused"}
              </div>
            </div>

            <Button
              type="button"
              onClick={() => {
                if (isPlaying) pause()
                else play(currentArticleId)
              }}
            >
              {isPlaying ? "Pause" : "Play"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
