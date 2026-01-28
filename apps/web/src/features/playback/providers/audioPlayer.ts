export class AudioPlayer {
  private audio: HTMLAudioElement | null = null

  stop() {
    if (this.audio) {
      this.audio.pause()
      this.audio.currentTime = 0
      this.audio = null
    }
  }

  async play(url: string) {
    return new Promise<boolean>((resolve) => {
      if (this.audio) {
        this.audio.pause()
      }
      let retried = false
      let started = false
      const play = (src: string) => {
        const audio = new Audio(src)
        this.audio = audio
        const cleanup = () => {
          audio.onended = null
          audio.onerror = null
          audio.onplay = null
        }
        const finalize = () => {
          cleanup()
          resolve(true)
        }
        const fail = () => {
          cleanup()
          if (started) {
            resolve(true)
            return
          }
          if (!retried) {
            retried = true
            play(url)
            return
          }
          resolve(false)
        }
        audio.onended = finalize
        audio.onerror = fail
        audio.onplay = () => {
          started = true
        }
        audio
          .play()
          .catch(() => {
            fail()
          })
      }
      play(url)
    })
  }
}
