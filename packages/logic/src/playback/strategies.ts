import type { PlaybackMode, NextIndexStrategy } from "./scheduler.js"

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
