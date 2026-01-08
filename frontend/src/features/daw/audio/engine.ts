import * as Tone from 'tone'
import { trackManager } from './trackManager'

export interface AudioEngine {
  isInitialized: boolean
  transport: typeof Tone.Transport
  context: typeof Tone.context
  initialize: () => Promise<void>
  scheduleAllTracks: () => void
  clearSchedule: () => void
  dispose: () => void
}

class DAWAudioEngine implements AudioEngine {
  private static instance: DAWAudioEngine | null = null
  public isInitialized: boolean = false
  private scheduledParts: Tone.Part[] = []

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
      this.scheduleAllTracks()
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
      this.clearSchedule()
    }
  }

  scheduleAllTracks(): void {
    this.clearSchedule()
    
    const tracks = trackManager.getAllTracks()
    
    tracks.forEach(track => {
      // 跳过静音或没有合成器的轨道
      if (track.config.muted || !track.synth) return
      
      track.patterns.forEach(pattern => {
        // 只处理有音符的pattern
        if (!pattern.notes || pattern.notes.length === 0) return
        
        // 创建 Tone.Part 来调度音符
        const part = new Tone.Part((time, note) => {
          if (track.synth && 'triggerAttackRelease' in track.synth) {
            const duration = Tone.Time(note.duration, 's').toSeconds()
            track.synth.triggerAttackRelease(
              note.note, 
              duration, 
              time, 
              note.velocity / 127
            )
          }
        }, pattern.notes.map(n => [n.time, n]))
        
        part.start(pattern.startTime)
        part.loop = true
        part.loopEnd = pattern.duration
        
        this.scheduledParts.push(part)
      })
    })
  }

  clearSchedule(): void {
    this.scheduledParts.forEach(part => {
      part.stop()
      part.dispose()
    })
    this.scheduledParts = []
  }

  getCurrentTime(): number {
    return this.isInitialized ? Tone.Transport.seconds : 0
  }

  dispose(): void {
    if (this.isInitialized) {
      Tone.Transport.stop()
      this.clearSchedule()
      // 可以在这里清理其他资源
      this.isInitialized = false
    }
  }
}

export const audioEngine = DAWAudioEngine.getInstance()