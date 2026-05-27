import { Howl, Howler } from 'howler'

type SoundName = 'jazz' | 'dice' | 'chip' | 'win' | 'lose' | 'sevenOut'

class AudioManager {
  private sounds: Partial<Record<SoundName, Howl>> = {}
  private initialized = false
  private _jazzVolume = 0.3
  private _muted = false

  init() {
    if (this.initialized || typeof window === 'undefined') return
    this.initialized = true

    this.sounds.jazz = new Howl({ src: ['/audio/jazz.mp3'], loop: true, volume: this._jazzVolume })
    this.sounds.dice = new Howl({ src: ['/audio/dice.mp3'], volume: 0.8 })
    this.sounds.chip = new Howl({ src: ['/audio/chip.mp3'], volume: 0.6 })
    this.sounds.win = new Howl({ src: ['/audio/win.mp3'], volume: 0.7 })
    this.sounds.lose = new Howl({ src: ['/audio/lose.mp3'], volume: 0.5 })
    this.sounds.sevenOut = new Howl({ src: ['/audio/seven-out.mp3'], volume: 0.7 })
  }

  startJazz() {
    if (!this.initialized) this.init()
    const jazz = this.sounds.jazz
    if (jazz && !jazz.playing()) jazz.play()
  }

  play(name: Exclude<SoundName, 'jazz'>) {
    if (this._muted) return
    if (!this.initialized) this.init()
    this.sounds[name]?.play()
  }

  setJazzVolume(volume: number) {
    this._jazzVolume = volume
    this.sounds.jazz?.volume(volume)
  }

  muteAll() {
    this._muted = true
    Howler.mute(true)
  }

  unmuteAll() {
    this._muted = false
    Howler.mute(false)
  }

  isMuted() {
    return this._muted
  }
}

export const audio = new AudioManager()
