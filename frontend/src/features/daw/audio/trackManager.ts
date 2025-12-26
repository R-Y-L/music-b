import * as Tone from 'tone'

export interface TrackConfig {
  id: string
  name: string
  color: string
  volume: number
  pan: number
  muted: boolean
  solo: boolean
  effects: string[]
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
  public channel: Tone.Channel
  private effects: Tone.ToneAudioNode[] = []

  constructor(config: TrackConfig) {
    this.config = config
    // 确保pan值在Tone.js允许的范围内[-1, 1]
    const normalizedPan = Math.max(-1, Math.min(1, config.pan))
    this.channel = new Tone.Channel({
      volume: config.volume,
      pan: normalizedPan,
      mute: config.muted
    }).toDestination()
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