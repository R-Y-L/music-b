import { useCallback, useEffect, useState } from 'react'
import { audioEngine } from '../../audio/engine'

interface TransportState {
  isPlaying: boolean
  isRecording: boolean
  currentTime: number
  bpm: number
  timeSignature: [number, number]
}

export const useTransport = () => {
  const [state, setState] = useState<TransportState>({
    isPlaying: false,
    isRecording: false,
    currentTime: 0,
    bpm: 120,
    timeSignature: [4, 4]
  })

  const [isInitialized, setIsInitialized] = useState(false)

  // 初始化音频引擎
  const initialize = useCallback(async () => {
    try {
      await audioEngine.initialize()
      setIsInitialized(true)
      setState(prev => ({ ...prev, bpm: audioEngine.transport.bpm.value }))
    } catch (error) {
      console.error('Failed to initialize audio engine:', error)
    }
  }, [])

  // 播放/暂停
  const togglePlayback = useCallback(async () => {
    if (!isInitialized) {
      await initialize()
    }

    if (state.isPlaying) {
      audioEngine.pause()
      setState(prev => ({ ...prev, isPlaying: false }))
    } else {
      audioEngine.play()
      setState(prev => ({ ...prev, isPlaying: true }))
    }
  }, [state.isPlaying, isInitialized, initialize])

  // 停止
  const stop = useCallback(() => {
    audioEngine.stop()
    setState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }))
  }, [])

  // 设置BPM
  const setBPM = useCallback((bpm: number) => {
    audioEngine.setBPM(bpm)
    setState(prev => ({ ...prev, bpm }))
  }, [])

  // 设置拍号
  const setTimeSignature = useCallback((numerator: number, denominator: number) => {
    audioEngine.setTimeSignature(numerator, denominator)
    setState(prev => ({ ...prev, timeSignature: [numerator, denominator] }))
  }, [])

  // 更新当前时间
  useEffect(() => {
    let animationFrame: number

    const updateTime = () => {
      if (isInitialized && state.isPlaying) {
        setState(prev => ({ ...prev, currentTime: audioEngine.getCurrentTime() }))
        animationFrame = requestAnimationFrame(updateTime)
      }
    }

    if (state.isPlaying) {
      updateTime()
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [state.isPlaying, isInitialized])

  return {
    ...state,
    isInitialized,
    initialize,
    togglePlayback,
    stop,
    setBPM,
    setTimeSignature
  }
}