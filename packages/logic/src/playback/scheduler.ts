import type { PlaybackEngine, PlaybackRole, PlaybackSentence, PlaybackRepeat } from "./engine.js"

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

export type PlaybackSchedulerOptions = {
  pauseMs: number
  repeats: PlaybackRepeat
  getShadowingSpeeds?: (role: PlaybackRole) => number[]
  shouldStop?: () => boolean
  onSentenceChange?: (sentenceId: string) => void
  onRoleChange?: (role: PlaybackRole | null) => void
  onStatusChange?: (status: SchedulerStatus) => void
  prefetchNext?: (sentence: PlaybackSentence) => void
  nextIndex: NextIndexStrategy
}

export class PlaybackScheduler {
  private readonly engine: PlaybackEngine
  private readonly options: PlaybackSchedulerOptions
  private queue: PlaybackSentence[] = []
  private currentIndex = 0
  private status: SchedulerStatus = "idle"
  private currentRole: PlaybackRole | null = null
  private mode: PlaybackMode = "loop-all"
  private listeners = new Set<(snapshot: SchedulerSnapshot) => void>()

  constructor(engine: PlaybackEngine, options: PlaybackSchedulerOptions) {
    this.engine = engine
    this.options = options
  }

  loadPlaylist(sentences: PlaybackSentence[], startIndex = 0) {
    this.queue = sentences.slice()
    this.currentIndex = Math.max(0, Math.min(startIndex, sentences.length - 1))
    this.emit()
  }

  setMode(mode: PlaybackMode) {
    this.mode = mode
    this.emit()
  }

  getSnapshot(): SchedulerSnapshot {
    const currentSentence = this.queue[this.currentIndex]
    return {
      status: this.status,
      mode: this.mode,
      currentIndex: this.currentIndex,
      currentSentenceId: currentSentence?.id ?? null,
      currentRole: this.currentRole,
    }
  }

  subscribe(listener: (snapshot: SchedulerSnapshot) => void) {
    this.listeners.add(listener)
    listener(this.getSnapshot())
    return () => {
      this.listeners.delete(listener)
    }
  }

  async start(roleOrder: PlaybackRole[]) {
    if (this.status === "playing") return
    this.status = "playing"
    this.options.onStatusChange?.(this.status)
    this.emit()
    // TODO: Stage 1 will move the playback loop here.
    // For now, this is a placeholder for control-flow migration.
    if (this.queue.length === 0) {
      this.stop()
      return
    }
    const current = this.queue[this.currentIndex]
    this.options.prefetchNext?.(current)
    this.currentRole = roleOrder[0] ?? null
    this.options.onRoleChange?.(this.currentRole)
    this.options.onSentenceChange?.(current.id)
    this.emit()
  }

  stop() {
    this.status = "idle"
    this.currentRole = null
    this.options.onStatusChange?.(this.status)
    this.options.onRoleChange?.(null)
    this.emit()
  }

  pause() {
    if (this.status !== "playing") return
    this.status = "paused"
    this.options.onStatusChange?.(this.status)
    this.emit()
  }

  resume() {
    if (this.status !== "paused") return
    this.status = "playing"
    this.options.onStatusChange?.(this.status)
    this.emit()
  }

  protected advance() {
    const total = this.queue.length
    this.currentIndex = this.options.nextIndex(this.currentIndex, total)
    this.emit()
  }

  private emit() {
    const snapshot = this.getSnapshot()
    for (const listener of this.listeners) {
      listener(snapshot)
    }
  }
}
