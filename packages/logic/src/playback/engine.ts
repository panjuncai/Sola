import type { ArticleSentence, DisplayOrder } from "@sola/shared"

export type PlaybackRole = "native" | "target"

export type PlaybackSentence = Pick<ArticleSentence, "id" | "nativeText" | "targetText">

export type PlaybackRepeat = {
  native: number
  target: number
}

export type PlaybackEngineOptions = {
  pauseMs: number
  shadowingSpeeds: number[]
  getShadowingSpeeds?: (role: PlaybackRole) => number[]
  shouldStop?: () => boolean
}

export type PlayRole = (
  sentence: PlaybackSentence,
  role: PlaybackRole,
  speed?: number
) => Promise<boolean>

export function buildRoleOrder(displayOrder: DisplayOrder): PlaybackRole[] {
  return displayOrder === "native_first" ? ["native", "target"] : ["target", "native"]
}

export class PlaybackEngine {
  private readonly playRole: PlayRole

  constructor(playRole: PlayRole) {
    this.playRole = playRole
  }

  async playSentence(
    sentence: PlaybackSentence,
    roleOrder: PlaybackRole[],
    repeats: PlaybackRepeat,
    options: PlaybackEngineOptions
  ) {
    for (const role of roleOrder) {
      const repeatTimes = role === "native" ? repeats.native : repeats.target
      const ok = await this.playWithShadowing(sentence, role, repeatTimes, options)
      if (!ok || options.shouldStop?.()) return false
      if (options.pauseMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, options.pauseMs))
      }
    }
    return true
  }

  async playWithShadowing(
    sentence: PlaybackSentence,
    role: PlaybackRole,
    repeatTimes: number,
    options: PlaybackEngineOptions
  ) {
    const roleSpeeds =
      options.getShadowingSpeeds?.(role) ?? options.shadowingSpeeds
    const times = Math.max(1, repeatTimes)
    for (let i = 0; i < times; i += 1) {
      const speed = roleSpeeds[i] ?? roleSpeeds.at(-1)
      const ok = await this.playRole(sentence, role, speed)
      if (!ok || options.shouldStop?.()) return false
      if (options.pauseMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, options.pauseMs))
      }
    }
    return true
  }
}
