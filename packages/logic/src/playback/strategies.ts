import type { PlaybackMode, NextIndexStrategy, PlaybackStrategy } from "./types.js"

export const loopAllStrategy: NextIndexStrategy = (current, total) =>
  total <= 0 ? 0 : (current + 1) % total

export const loopSingleStrategy: NextIndexStrategy = (current) => current

export const loopTargetStrategy: NextIndexStrategy = (current, total) =>
  total <= 0 ? 0 : (current + 1) % total

export const randomStrategy: NextIndexStrategy = (current, total) => {
  if (total <= 1) return current
  let next = current
  while (next === current) {
    next = Math.floor(Math.random() * total)
  }
  return next
}

export const getStrategyForMode = (mode: PlaybackMode): NextIndexStrategy => {
  switch (mode) {
    case "single":
      return loopSingleStrategy
    case "random":
      return randomStrategy
    case "loop-target":
      return loopTargetStrategy
    case "shadowing":
    case "loop-all":
    default:
      return loopAllStrategy
  }
}

export const playbackStrategies: Record<PlaybackMode, PlaybackStrategy> = {
  "loop-all": {
    nextIndex: loopAllStrategy,
    getRoleOrder: (baseOrder) => baseOrder,
  },
  "loop-target": {
    nextIndex: loopTargetStrategy,
    getRoleOrder: () => ["target"],
  },
  single: {
    nextIndex: loopSingleStrategy,
    getRoleOrder: (baseOrder) => baseOrder,
  },
  shadowing: {
    nextIndex: loopAllStrategy,
    getRoleOrder: (baseOrder) => baseOrder,
  },
  random: {
    nextIndex: randomStrategy,
    getRoleOrder: (baseOrder) => baseOrder,
  },
}

export const getPlaybackStrategyForMode = (mode: PlaybackMode): PlaybackStrategy =>
  playbackStrategies[mode] ?? playbackStrategies["loop-all"]
