import type { PlaybackEngine, PlaybackRole, PlaybackSentence, PlaybackRepeat } from "./engine.js"
import { getStrategyForMode } from "./strategies.js"
import type {
  NextIndexStrategy,
  PlaybackMode,
  SchedulerSnapshot,
  SchedulerStatus,
} from "./types.js"

export type PlaybackSchedulerOptions = {
  pauseMs: number
  repeats: PlaybackRepeat
  getShadowingSpeeds?: (role: PlaybackRole) => number[]
  shouldStop?: () => boolean
  onSentenceChange?: (sentenceId: string) => void
  onRoleChange?: (role: PlaybackRole | null) => void
  onStatusChange?: (status: SchedulerStatus) => void
  prefetchNext?: (sentence: PlaybackSentence) => void
  nextIndex?: NextIndexStrategy
}

export class PlaybackScheduler {
  private readonly engine: PlaybackEngine
  private readonly options: PlaybackSchedulerOptions
  private nextIndex: NextIndexStrategy
  private queue: PlaybackSentence[] = []
  private currentIndex = 0
  private status: SchedulerStatus = "idle"
  private currentRole: PlaybackRole | null = null
  private mode: PlaybackMode = "loop-all"
  private runId = 0
  private listeners = new Set<(snapshot: SchedulerSnapshot) => void>()

  constructor(engine: PlaybackEngine, options: PlaybackSchedulerOptions) {
    this.engine = engine
    this.options = options
    this.nextIndex = options.nextIndex ?? getStrategyForMode("loop-all")
  }

  loadPlaylist(sentences: PlaybackSentence[], startIndex = 0) {
    this.queue = sentences.slice()
    this.currentIndex = Math.max(0, Math.min(startIndex, sentences.length - 1))
    this.emit()
  }

  setMode(mode: PlaybackMode) {
    this.mode = mode
    this.nextIndex = getStrategyForMode(mode)
    this.emit()
  }

  updateOptions(next: Partial<PlaybackSchedulerOptions>) {
    Object.assign(this.options, next)
    if (next.nextIndex) {
      this.nextIndex = next.nextIndex
    }
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
    this.runId += 1
    const runId = this.runId
    this.options.onStatusChange?.(this.status)
    this.emit()
    await this.runLoop(roleOrder, runId)
  }

  stop() {
    this.status = "idle"
    this.currentRole = null
    this.runId += 1
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
    if (this.mode === "single") {
      this.emit()
      return
    }
    this.currentIndex = this.nextIndex(this.currentIndex, total)
    this.emit()
  }

  private emit() {
    const snapshot = this.getSnapshot()
    for (const listener of this.listeners) {
      listener(snapshot)
    }
  }

  private async runLoop(roleOrder: PlaybackRole[], runId: number) {
    if (this.queue.length === 0) {
      this.stop()
      return
    }
    while (this.status === "playing" && this.runId === runId) {
      const sentence = this.queue[this.currentIndex]
      if (!sentence) {
        this.stop()
        return
      }
      this.options.onSentenceChange?.(sentence.id)
      this.options.prefetchNext?.(sentence)
      this.emit()

      for (const role of roleOrder) {
        if (this.status !== "playing" || this.runId !== runId) return
        this.currentRole = role
        this.options.onRoleChange?.(role)
        this.emit()
        const repeatTimes =
          role === "native" ? this.options.repeats.native : this.options.repeats.target
        const ok = await this.engine.playWithShadowing(sentence, role, repeatTimes, {
          pauseMs: this.options.pauseMs,
          shadowingSpeeds: this.options.getShadowingSpeeds?.(role) ?? [1],
          getShadowingSpeeds: this.options.getShadowingSpeeds ?? (() => [1]),
          shouldStop: () =>
            this.status !== "playing" ||
            this.runId !== runId ||
            this.options.shouldStop?.() === true,
        })
        if (!ok) {
          this.stop()
          return
        }
        if (this.options.pauseMs > 0) {
          await new Promise((resolve) => setTimeout(resolve, this.options.pauseMs))
        }
      }

      this.advance()
      if (this.options.shouldStop?.()) {
        this.stop()
        return
      }
    }
  }
}
