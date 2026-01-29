import type { PlaybackRole } from "./engine.js"

export type PlaybackMode = "loop-all" | "loop-target" | "single" | "shadowing" | "random"
export type SchedulerStatus = "idle" | "playing" | "paused"

export type SchedulerSnapshot = {
  status: SchedulerStatus
  mode: PlaybackMode
  currentIndex: number
  currentSentenceId: string | null
  currentRole: PlaybackRole | null
}

export type NextIndexStrategy = (current: number, total: number) => number

export type PlaybackStrategy = {
  nextIndex: NextIndexStrategy
  getRoleOrder: (baseOrder: PlaybackRole[]) => PlaybackRole[]
}
