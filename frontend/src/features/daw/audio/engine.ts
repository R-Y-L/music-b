import * as Tone from 'tone'

export interface AudioEngine {
  isInitialized: boolean
  transport: typeof Tone.Transport
  context: typeof Tone.context
  initialize: () => Promise<void>
  dispose: () => void
}

class DAWAudioEngine implements AudioEngine {
  private static instance: DAWAudioEngine | null = null
  public isInitialized: boolean = false

  private constructor() {}

  static getInstance(): DAWAudioEngine {
    if (!DAWAudioEngine.instance) {
      DAWAudioEngine.instance = new DAWAudioEngine()
    }
    return DAWAudioEngine.instance
  }

  get transport() {
    return Tone.Transport
  }

  get context() {
    return Tone.context
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    if (Tone.context.state !== 'running') {
      await Tone.start()
    }
    
    // 设置默认参数
    Tone.Transport.bpm.value = 120
    Tone.Transport.timeSignature = [4, 4]
    
    this.isInitialized = true
  }

  setBPM(bpm: number): void {
    Tone.Transport.bpm.value = bpm
  }

  setTimeSignature(numerator: number, denominator: number): void {
    Tone.Transport.timeSignature = [numerator, denominator]
  }

  play(): void {
    if (this.isInitialized) {
      Tone.Transport.start()
    }
  }

  pause(): void {
    if (this.isInitialized) {
      Tone.Transport.pause()
    }
  }

  stop(): void {
    if (this.isInitialized) {
      Tone.Transport.stop()
    }
  }

  getCurrentTime(): number {
    return this.isInitialized ? Tone.Transport.seconds : 0
  }

  dispose(): void {
    if (this.isInitialized) {
      Tone.Transport.stop()
      // 可以在这里清理其他资源
      this.isInitialized = false
    }
  }
}

export const audioEngine = DAWAudioEngine.getInstance()