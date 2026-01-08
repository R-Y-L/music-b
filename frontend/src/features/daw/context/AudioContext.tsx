import React, { createContext, useContext, useCallback, useState, useEffect, useRef } from 'react'
import * as Tone from 'tone'
import { audioEngine } from '../audio/engine'

// 共享音频状态
interface AudioContextState {
  isInitialized: boolean
  isPlaying: boolean
  isPaused: boolean
  currentTime: number
  bpm: number
  timeSignature: [number, number]
}

interface AudioContextValue extends AudioContextState {
  // 初始化
  initialize: () => Promise<void>
  
  // 传输控制
  play: () => void
  pause: () => void
  stop: () => void
  togglePlayback: () => void
  
  // 参数控制
  setBPM: (bpm: number) => void
  setTimeSignature: (numerator: number, denominator: number) => void
  seekTo: (time: number) => void
  
  // 音符播放
  playNote: (note: string, duration?: string, velocity?: number) => void
  triggerAttack: (note: string, velocity?: number) => void
  triggerRelease: (note: string) => void
  
  // 共享合成器
  synth: Tone.PolySynth | null
}

const DAWAudioContext = createContext<AudioContextValue | null>(null)

export const useDAWAudio = () => {
  const context = useContext(DAWAudioContext)
  if (!context) {
    throw new Error('useDAWAudio must be used within a DAWAudioProvider')
  }
  return context
}

interface DAWAudioProviderProps {
  children: React.ReactNode
}

export const DAWAudioProvider: React.FC<DAWAudioProviderProps> = ({ children }) => {
  const [state, setState] = useState<AudioContextState>({
    isInitialized: false,
    isPlaying: false,
    isPaused: false,
    currentTime: 0,
    bpm: 120,
    timeSignature: [4, 4]
  })
  
  const synthRef = useRef<Tone.PolySynth | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  // 初始化音频引擎和共享合成器
  const initialize = useCallback(async () => {
    if (state.isInitialized) return
    
    try {
      // 必须在用户交互后调用 Tone.start()
      await Tone.start()
      await audioEngine.initialize()
      
      // 创建共享的PolySynth
      const newSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: {
          attack: 0.02,
          decay: 0.1,
          sustain: 0.3,
          release: 0.8
        }
      }).toDestination()
      
      synthRef.current = newSynth
      
      setState(prev => ({
        ...prev,
        isInitialized: true,
        bpm: Tone.Transport.bpm.value
      }))
      
      console.log('DAW Audio initialized successfully')
    } catch (error) {
      console.error('Failed to initialize DAW audio:', error)
    }
  }, [state.isInitialized])

  // 时间更新循环
  useEffect(() => {
    const updateTime = () => {
      if (state.isInitialized && state.isPlaying) {
        setState(prev => ({
          ...prev,
          currentTime: Tone.Transport.seconds
        }))
      }
      animationFrameRef.current = requestAnimationFrame(updateTime)
    }
    
    animationFrameRef.current = requestAnimationFrame(updateTime)
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [state.isInitialized, state.isPlaying])

  // 清理
  useEffect(() => {
    return () => {
      if (synthRef.current) {
        synthRef.current.dispose()
      }
    }
  }, [])

  // 传输控制
  const play = useCallback(() => {
    if (!state.isInitialized) return
    Tone.Transport.start()
    setState(prev => ({ ...prev, isPlaying: true, isPaused: false }))
  }, [state.isInitialized])

  const pause = useCallback(() => {
    if (!state.isInitialized) return
    Tone.Transport.pause()
    setState(prev => ({ ...prev, isPlaying: false, isPaused: true }))
  }, [state.isInitialized])

  const stop = useCallback(() => {
    if (!state.isInitialized) return
    Tone.Transport.stop()
    Tone.Transport.position = 0
    setState(prev => ({ ...prev, isPlaying: false, isPaused: false, currentTime: 0 }))
  }, [state.isInitialized])

  const togglePlayback = useCallback(async () => {
    if (!state.isInitialized) {
      await initialize()
    }
    
    if (state.isPlaying) {
      pause()
    } else {
      play()
    }
  }, [state.isInitialized, state.isPlaying, initialize, play, pause])

  // 参数控制
  const setBPM = useCallback((bpm: number) => {
    Tone.Transport.bpm.value = bpm
    setState(prev => ({ ...prev, bpm }))
  }, [])

  const setTimeSignature = useCallback((numerator: number, denominator: number) => {
    Tone.Transport.timeSignature = [numerator, denominator]
    setState(prev => ({ ...prev, timeSignature: [numerator, denominator] }))
  }, [])

  const seekTo = useCallback((time: number) => {
    Tone.Transport.seconds = time
    setState(prev => ({ ...prev, currentTime: time }))
  }, [])

  // 音符播放 - 确保先初始化
  const playNote = useCallback(async (note: string, duration: string = '8n', velocity: number = 0.8) => {
    if (!state.isInitialized) {
      await initialize()
    }
    
    if (synthRef.current) {
      synthRef.current.triggerAttackRelease(note, duration, undefined, velocity)
    }
  }, [state.isInitialized, initialize])

  const triggerAttack = useCallback(async (note: string, velocity: number = 0.8) => {
    if (!state.isInitialized) {
      await initialize()
    }
    
    if (synthRef.current) {
      synthRef.current.triggerAttack(note, undefined, velocity)
    }
  }, [state.isInitialized, initialize])

  const triggerRelease = useCallback((note: string) => {
    if (synthRef.current) {
      synthRef.current.triggerRelease(note)
    }
  }, [])

  const value: AudioContextValue = {
    ...state,
    initialize,
    play,
    pause,
    stop,
    togglePlayback,
    setBPM,
    setTimeSignature,
    seekTo,
    playNote,
    triggerAttack,
    triggerRelease,
    synth: synthRef.current
  }

  return (
    <DAWAudioContext.Provider value={value}>
      {children}
    </DAWAudioContext.Provider>
  )
}
