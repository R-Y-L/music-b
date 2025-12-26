import { useCallback, useEffect, useState } from 'react'
import * as Tone from 'tone'
import { audioEngine } from '../audio/engine'
import { instrumentPresets } from '../audio/presets'

export interface AudioEngineState {
  isPlaying: boolean
  isPaused: boolean
  currentTime: number
  bpm: number
  volume: number
  tracks: Track[]
  selectedTrackId: string | null
  loopEnabled: boolean
  loopStart: number
  loopEnd: number
}

export interface Track {
  id: string
  name: string
  type: 'instrument' | 'audio' | 'master'
  instrument: string
  volume: number
  pan: number
  mute: boolean
  solo: boolean
  effects: Effect[]
  patterns: Pattern[]
  audioClips: AudioClip[]
}

export interface Pattern {
  id: string
  name: string
  trackId: string
  startTime: number
  duration: number
  notes: Note[]
}

export interface Note {
  id: string
  patternId: string
  pitch: number
  velocity: number
  startTime: number
  duration: number
}

export interface AudioClip {
  id: string
  name: string
  trackId: string
  startTime: number
  duration: number
  gain: number
  fadeIn: number
  fadeOut: number
}

export interface Effect {
  id: string
  type: string
  name: string
  enabled: boolean
  parameters: { [key: string]: number | string | boolean }
}

export function useAudioEngine() {
  const [state, setState] = useState<AudioEngineState>({
    isPlaying: false,
    isPaused: false,
    currentTime: 0,
    bpm: 120,
    volume: 0.8,
    tracks: [],
    selectedTrackId: null,
    loopEnabled: false,
    loopStart: 0,
    loopEnd: 16
  })

  // 初始化音频引擎
  useEffect(() => {
    const initAudio = async () => {
      try {
        await audioEngine.initialize()
        console.log('Audio engine initialized')
        
        // 创建初始轨道
        const masterTrack: Track = {
          id: 'master',
          name: 'Master',
          type: 'master',
          instrument: 'none',
          volume: 0.8,
          pan: 0,
          mute: false,
          solo: false,
          effects: [],
          patterns: [],
          audioClips: []
        }

        setState(prev => ({
          ...prev,
          tracks: [masterTrack]
        }))
      } catch (error) {
        console.error('Failed to initialize audio engine:', error)
      }
    }

    initAudio()
  }, [])

  // 播放控制
  const play = useCallback(() => {
    audioEngine.play()
    setState(prev => ({ ...prev, isPlaying: true, isPaused: false }))
  }, [])

  const pause = useCallback(() => {
    audioEngine.pause()
    setState(prev => ({ ...prev, isPlaying: false, isPaused: true }))
  }, [])

  const stop = useCallback(() => {
    audioEngine.stop()
    setState(prev => ({ ...prev, isPlaying: false, isPaused: false, currentTime: 0 }))
  }, [])

  const record = useCallback(() => {
    console.log('Record started')
    // TODO: 实现录音功能
  }, [])

  // 时间控制
  const seekTo = useCallback((time: number) => {
    Tone.Transport.position = time
    setState(prev => ({ ...prev, currentTime: time }))
  }, [])

  const setBPM = useCallback((bpm: number) => {
    Tone.Transport.bpm.value = bpm
    setState(prev => ({ ...prev, bpm }))
  }, [])

  // 轨道管理
  const createTrack = useCallback((type: 'instrument' | 'audio' = 'instrument', instrument = 'synth') => {
    const trackId = `track_${Date.now()}`
    const newTrack: Track = {
      id: trackId,
      name: `${type} ${state.tracks.length}`,
      type,
      instrument,
      volume: 0.7,
      pan: 0,
      mute: false,
      solo: false,
      effects: [],
      patterns: [],
      audioClips: []
    }

    setState(prev => ({
      ...prev,
      tracks: [...prev.tracks, newTrack],
      selectedTrackId: trackId
    }))

    return trackId
  }, [state.tracks.length])

  const deleteTrack = useCallback((trackId: string) => {
    if (trackId === 'master') return

    setState(prev => ({
      ...prev,
      tracks: prev.tracks.filter(track => track.id !== trackId),
      selectedTrackId: prev.selectedTrackId === trackId ? null : prev.selectedTrackId
    }))
  }, [])

  const updateTrack = useCallback((trackId: string, updates: Partial<Track>) => {
    setState(prev => ({
      ...prev,
      tracks: prev.tracks.map(track =>
        track.id === trackId ? { ...track, ...updates } : track
      )
    }))
  }, [])

  const selectTrack = useCallback((trackId: string | null) => {
    setState(prev => ({ ...prev, selectedTrackId: trackId }))
  }, [])

  // 音符管理
  const createPattern = useCallback((trackId: string, startTime = 0, duration = 4) => {
    const patternId = `pattern_${Date.now()}`
    const newPattern: Pattern = {
      id: patternId,
      name: `Pattern ${Date.now() % 1000}`,
      trackId,
      startTime,
      duration,
      notes: []
    }

    setState(prev => ({
      ...prev,
      tracks: prev.tracks.map(track =>
        track.id === trackId
          ? { ...track, patterns: [...track.patterns, newPattern] }
          : track
      )
    }))

    return patternId
  }, [])

  const addNote = useCallback((patternId: string, pitch: number, velocity = 127, startTime = 0, duration = 0.5) => {
    const noteId = `note_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
    const newNote: Note = {
      id: noteId,
      patternId,
      pitch,
      velocity,
      startTime,
      duration
    }

    setState(prev => ({
      ...prev,
      tracks: prev.tracks.map(track => ({
        ...track,
        patterns: track.patterns.map(pattern =>
          pattern.id === patternId
            ? { ...pattern, notes: [...pattern.notes, newNote] }
            : pattern
        )
      }))
    }))

    // 播放音符预览
    const selectedTrack = state.tracks.find(track => 
      track.patterns.some(pattern => pattern.id === patternId)
    )
    if (selectedTrack) {
      playNotePreview(pitch, velocity, selectedTrack.instrument)
    }

    return noteId
  }, [state.tracks])

  const removeNote = useCallback((noteId: string) => {
    setState(prev => ({
      ...prev,
      tracks: prev.tracks.map(track => ({
        ...track,
        patterns: track.patterns.map(pattern => ({
          ...pattern,
          notes: pattern.notes.filter(note => note.id !== noteId)
        }))
      }))
    }))
  }, [])

  const updateNote = useCallback((noteId: string, updates: Partial<Note>) => {
    setState(prev => ({
      ...prev,
      tracks: prev.tracks.map(track => ({
        ...track,
        patterns: track.patterns.map(pattern => ({
          ...pattern,
          notes: pattern.notes.map(note =>
            note.id === noteId ? { ...note, ...updates } : note
          )
        }))
      }))
    }))
  }, [])

  // 效果器管理
  const addEffect = useCallback((trackId: string, effectType: string) => {
    const effectId = `effect_${Date.now()}`
    const newEffect: Effect = {
      id: effectId,
      type: effectType,
      name: effectType.charAt(0).toUpperCase() + effectType.slice(1),
      enabled: true,
      parameters: {}
    }

    setState(prev => ({
      ...prev,
      tracks: prev.tracks.map(track =>
        track.id === trackId
          ? { ...track, effects: [...track.effects, newEffect] }
          : track
      )
    }))

    return effectId
  }, [])

  const removeEffect = useCallback((trackId: string, effectId: string) => {
    setState(prev => ({
      ...prev,
      tracks: prev.tracks.map(track =>
        track.id === trackId
          ? { ...track, effects: track.effects.filter(effect => effect.id !== effectId) }
          : track
      )
    }))
  }, [])

  const updateEffect = useCallback((trackId: string, effectId: string, parameters: any) => {
    setState(prev => ({
      ...prev,
      tracks: prev.tracks.map(track =>
        track.id === trackId
          ? {
              ...track,
              effects: track.effects.map(effect =>
                effect.id === effectId
                  ? { ...effect, parameters: { ...effect.parameters, ...parameters } }
                  : effect
              )
            }
          : track
      )
    }))
  }, [])

  // 实时演奏
  const playNotePreview = useCallback((pitch: number, velocity: number, instrumentType: string) => {
    try {
      const freq = Tone.Frequency(pitch, 'midi').toFrequency()
      const preset = instrumentPresets[instrumentType as keyof typeof instrumentPresets] as any
      
      if (preset) {
        const synthOptions = preset.settings || preset.options || {}
        const synth = new Tone.Synth(synthOptions)
        synth.toDestination()
        synth.triggerAttackRelease(freq, '8n', '+0', velocity / 127)
      }
    } catch (error) {
      console.error('Error playing note preview:', error)
    }
  }, [])

  const playChord = useCallback((pitches: number[], velocity = 127, instrumentType = 'synth') => {
    pitches.forEach(pitch => {
      playNotePreview(pitch, velocity, instrumentType)
    })
  }, [playNotePreview])

  // 循环控制
  const setLoop = useCallback((enabled: boolean, start = 0, end = 16) => {
    setState(prev => ({
      ...prev,
      loopEnabled: enabled,
      loopStart: start,
      loopEnd: end
    }))
    
    if (enabled) {
      Tone.Transport.setLoopPoints(start, end)
      Tone.Transport.loop = true
    } else {
      Tone.Transport.loop = false
    }
  }, [])

  // 导出功能
  const exportProject = useCallback(() => {
    const projectData = {
      version: '1.0',
      bpm: state.bpm,
      tracks: state.tracks,
      loopEnabled: state.loopEnabled,
      loopStart: state.loopStart,
      loopEnd: state.loopEnd,
      createdAt: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `project_${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [state])

  const loadProject = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const projectData = JSON.parse(e.target?.result as string)
        setState(prev => ({
          ...prev,
          bpm: projectData.bpm || 120,
          tracks: projectData.tracks || [],
          loopEnabled: projectData.loopEnabled || false,
          loopStart: projectData.loopStart || 0,
          loopEnd: projectData.loopEnd || 16
        }))
        setBPM(projectData.bpm || 120)
      } catch (error) {
        console.error('Failed to load project:', error)
      }
    }
    reader.readAsText(file)
  }, [setBPM])

  return {
    // State
    ...state,
    
    // Transport controls
    play,
    pause,
    stop,
    record,
    seekTo,
    setBPM,
    
    // Track management
    createTrack,
    deleteTrack,
    updateTrack,
    selectTrack,
    
    // Pattern & Note management
    createPattern,
    addNote,
    removeNote,
    updateNote,
    
    // Effects management
    addEffect,
    removeEffect,
    updateEffect,
    
    // Real-time performance
    playNotePreview,
    playChord,
    
    // Loop control
    setLoop,
    
    // Project management
    exportProject,
    loadProject
  }
}