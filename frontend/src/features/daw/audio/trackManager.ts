import * as Tone from 'tone'
import { instrumentPresets } from './presets'

export type TrackType = 'instrument' | 'drums' | 'audio'

export interface PatternNote {
  id: string
  note: string      // e.g., "C4", "D#5"
  velocity: number  // 0-127
  time: number      // in beats/steps
  duration: number  // in beats/steps
}

export interface DrumPattern {
  [key: string]: boolean[]  // e.g., { kick: [true, false, ...], snare: [...] }
}

export interface TrackPattern {
  id: string
  name: string
  notes: PatternNote[]
  drumPattern?: DrumPattern
  startTime: number  // where pattern starts on timeline
  duration: number   // pattern length in beats
}

export interface TrackConfig {
  id: string
  name: string
  type: TrackType
  color: string
  volume: number
  pan: number
  muted: boolean
  solo: boolean
  effects: string[]
  instrument?: string  // synth preset name
}

export interface AudioClip {
  id: string
  start: number
  duration: number
  buffer?: Tone.ToneAudioBuffer
  url?: string
  name?: string
}

export class AudioTrack {
  public config: TrackConfig
  public clips: AudioClip[] = []
  public patterns: TrackPattern[] = []
  public channel: Tone.Channel
  private effects: Tone.ToneAudioNode[] = []
  public synth: Tone.PolySynth | Tone.Synth | null = null

  constructor(config: TrackConfig) {
    this.config = config
    // 确保pan值在Tone.js允许的范围内[-1, 1]
    const normalizedPan = Math.max(-1, Math.min(1, config.pan))
    this.channel = new Tone.Channel({
      volume: config.volume,
      pan: normalizedPan,
      mute: config.muted
    }).toDestination()

    // 根据轨道类型创建合成器
    if (config.type === 'instrument') {
      // 使用配置的乐器预设
      const presetKey = config.instrument || 'synth'
      const preset = instrumentPresets[presetKey as keyof typeof instrumentPresets] as {
        name: string
        type: string
        settings?: Record<string, unknown>
        options?: Record<string, unknown>
      } | undefined
      
      // 获取预设配置 - 支持 settings 或 options
      const rawConfig = preset?.settings || preset?.options
      
      if (rawConfig) {
        // 只提取 Tone.Synth 支持的属性
        const synthOptions: Partial<Tone.SynthOptions> = {}
        
        if (rawConfig.oscillator) {
          synthOptions.oscillator = rawConfig.oscillator as Partial<Tone.OmniOscillatorOptions>
        }
        if (rawConfig.envelope) {
          synthOptions.envelope = rawConfig.envelope as Partial<Tone.EnvelopeOptions>
        }
        
        this.synth = new Tone.PolySynth(Tone.Synth, synthOptions).connect(this.channel)
      } else {
        // 默认合成器
        this.synth = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'triangle' },
          envelope: {
            attack: 0.02,
            decay: 0.1,
            sustain: 0.3,
            release: 0.8
          }
        }).connect(this.channel)
      }
    }
  }

  // 添加 pattern
  addPattern(pattern: Omit<TrackPattern, 'id'>): TrackPattern {
    const newPattern: TrackPattern = {
      ...pattern,
      id: `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
    }
    this.patterns.push(newPattern)
    return newPattern
  }

  // 获取当前 pattern (简化：取第一个或创建默认)
  getCurrentPattern(): TrackPattern {
    if (this.patterns.length === 0) {
      return this.addPattern({
        name: 'Pattern 1',
        notes: [],
        drumPattern: this.config.type === 'drums' ? {
          kick: Array(16).fill(false),
          snare: Array(16).fill(false),
          hihat: Array(16).fill(false),
          openhat: Array(16).fill(false)
        } : undefined,
        startTime: 0,
        duration: 4
      })
    }
    return this.patterns[0]
  }

  // 更新 pattern 音符
  updatePatternNotes(patternId: string, notes: PatternNote[]): void {
    const pattern = this.patterns.find(p => p.id === patternId)
    if (pattern) {
      pattern.notes = notes
    }
  }

  // 更新鼓机 pattern
  updateDrumPattern(patternId: string, drumPattern: DrumPattern): void {
    const pattern = this.patterns.find(p => p.id === patternId)
    if (pattern) {
      pattern.drumPattern = drumPattern
    }
  }

  addClip(clip: AudioClip): void {
    this.clips.push(clip)
  }

  removeClip(clipId: string): void {
    this.clips = this.clips.filter(clip => clip.id !== clipId)
  }

  updateVolume(volume: number): void {
    this.config.volume = volume
    this.channel.volume.value = volume
  }

  updatePan(pan: number): void {
    // 确保pan值在Tone.js允许的范围内[-1, 1]
    const normalizedPan = Math.max(-1, Math.min(1, pan))
    this.config.pan = normalizedPan
    this.channel.pan.value = normalizedPan
  }

  toggleMute(): void {
    this.config.muted = !this.config.muted
    this.channel.mute = this.config.muted
  }

  toggleSolo(): void {
    this.config.solo = !this.config.solo
    // Solo logic would be handled by TrackManager
  }

  dispose(): void {
    this.channel.dispose()
    this.effects.forEach(effect => effect.dispose())
    if (this.synth) {
      this.synth.dispose()
    }
  }
}

export class TrackManager {
  private static instance: TrackManager
  private tracks: Map<string, AudioTrack> = new Map()
  private soloedTracks: Set<string> = new Set()

  private constructor() {}

  static getInstance(): TrackManager {
    if (!TrackManager.instance) {
      TrackManager.instance = new TrackManager()
    }
    return TrackManager.instance
  }

  createTrack(config: TrackConfig): AudioTrack {
    const track = new AudioTrack(config)
    this.tracks.set(config.id, track)
    return track
  }

  getTrack(id: string): AudioTrack | undefined {
    return this.tracks.get(id)
  }

  getAllTracks(): AudioTrack[] {
    return Array.from(this.tracks.values())
  }

  deleteTrack(id: string): void {
    const track = this.tracks.get(id)
    if (track) {
      track.dispose()
      this.tracks.delete(id)
      this.soloedTracks.delete(id)
    }
  }

  toggleTrackSolo(trackId: string): void {
    const track = this.tracks.get(trackId)
    if (!track) return

    if (this.soloedTracks.has(trackId)) {
      this.soloedTracks.delete(trackId)
      track.config.solo = false
    } else {
      this.soloedTracks.add(trackId)
      track.config.solo = true
    }

    // 更新所有轨道的静音状态
    this.updateSoloState()
  }

  private updateSoloState(): void {
    const hasSolo = this.soloedTracks.size > 0

    this.tracks.forEach(track => {
      if (hasSolo) {
        // 如果有solo轨道，只播放solo的轨道
        const shouldMute = !this.soloedTracks.has(track.config.id) && !track.config.muted
        track.channel.mute = shouldMute
      } else {
        // 没有solo轨道时，恢复正常静音状态
        track.channel.mute = track.config.muted
      }
    })
  }

  clearAllTracks(): void {
    this.tracks.forEach(track => track.dispose())
    this.tracks.clear()
    this.soloedTracks.clear()
  }
}

export const trackManager = TrackManager.getInstance()