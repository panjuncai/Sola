import type { PlaybackRole, PlaybackSentence } from "./engine.js"

export type AudioSourceProvider = {
  prefetch: (sentence: PlaybackSentence, role: PlaybackRole) => void
}
