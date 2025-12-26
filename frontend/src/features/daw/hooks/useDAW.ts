import { useCallback, useEffect, useRef, useState } from 'react'
import * as Tone from 'tone'

interface Track {
  id: string
  name: string
  color: string
  clips: AudioClip[]
  muted: boolean
  volume: number
  panner: number
}

interface AudioClip {
  id: string
  start: number
  duration: number
  buffer?: Tone.ToneAudioBuffer
  url?: string
}

const initialTracks: Track[] = [
  { id: 'drums', name: 'Drums', color: '#30c48d', clips: [], muted: false, volume: -6, panner: 0 },
  { id: 'bass', name: 'Bass', color: '#1f9bff', clips: [], muted: false, volume: -8, panner: -20 },
  { id: 'lead', name: 'Lead', color: '#ff7b5f', clips: [], muted: false, volume: -10, panner: 20 },
  { id: 'pads', name: 'Pads', color: '#b58cff', clips: [], muted: false, volume: -12, panner: 0 },
]

export const useDAW = () => {
  const [tracks, setTracks] = useState<Track[]>(initialTracks)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [bpm, setBpm] = useState(120)
  const [currentTime, setCurrentTime] = useState(0)
  const [isInitialized, setIsInitialized] = useState(false)
  
  const recorderRef = useRef<Tone.Recorder | null>(null)
  const micInputRef = useRef<Tone.UserMedia | null>(null)
  const animationRef = useRef<number | undefined>(undefined)

  // Initialize audio context
  const initializeAudio = useCallback(async () => {
    if (Tone.context.state !== 'running') {
      await Tone.start()
    }
    setIsInitialized(true)
    Tone.Transport.bpm.value = bpm
  }, [bpm])

  // Update transport BPM
  useEffect(() => {
    if (isInitialized) {
      Tone.Transport.bpm.value = bpm
    }
  }, [bpm, isInitialized])

  // Update current time
  const updateTime = useCallback(() => {
    if (isInitialized) {
      setCurrentTime(Tone.Transport.seconds)
      animationRef.current = requestAnimationFrame(updateTime)
    }
  }, [isInitialized])

  useEffect(() => {
    if (isPlaying && isInitialized) {
      updateTime()
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying, isInitialized, updateTime])

  // Play/Pause
  const togglePlayback = useCallback(async () => {
    if (!isInitialized) {
      await initializeAudio()
    }
    
    if (isPlaying) {
      Tone.Transport.pause()
      setIsPlaying(false)
    } else {
      Tone.Transport.start()
      setIsPlaying(true)
    }
  }, [isPlaying, isInitialized, initializeAudio])

  // Stop
  const stop = useCallback(() => {
    Tone.Transport.stop()
    setIsPlaying(false)
    setCurrentTime(0)
  }, [])

  // Start/Stop Recording
  const toggleRecording = useCallback(async () => {
    if (!isInitialized) {
      await initializeAudio()
    }

    if (isRecording) {
      // Stop recording
      if (recorderRef.current) {
        const recording = await recorderRef.current.stop()
        const url = URL.createObjectURL(recording)
        
        // Add recorded clip to first track
        const newClip: AudioClip = {
          id: `rec-${Date.now()}`,
          start: 0,
          duration: currentTime,
          url,
        }
        
        setTracks(prev => prev.map(track => 
          track.id === 'drums' 
            ? { ...track, clips: [...track.clips, newClip] }
            : track
        ))
        
        recorderRef.current.dispose()
        recorderRef.current = null
      }
      
      if (micInputRef.current) {
        await micInputRef.current.close()
        micInputRef.current = null
      }
      
      setIsRecording(false)
    } else {
      // Start recording
      try {
        micInputRef.current = new Tone.UserMedia()
        await micInputRef.current.open()
        
        recorderRef.current = new Tone.Recorder()
        micInputRef.current.connect(recorderRef.current)
        recorderRef.current.start()
        
        setIsRecording(true)
      } catch (error) {
        console.error('Failed to start recording:', error)
        alert('无法访问麦克风，请检查权限设置')
      }
    }
  }, [isRecording, isInitialized, initializeAudio, currentTime])

  // Load sample clips (demo)
  const loadSampleClips = useCallback(async () => {
    if (!isInitialized) {
      await initializeAudio()
    }

    const samples = [
      { trackId: 'drums', url: '/samples/kick.wav', start: 0, duration: 4 },
      { trackId: 'bass', url: '/samples/bass.wav', start: 4, duration: 8 },
      { trackId: 'lead', url: '/samples/lead.wav', start: 8, duration: 4 },
    ]

    // In a real app, you would load actual audio files
    // For demo purposes, create empty clips
    setTracks(prev => prev.map(track => {
      const trackSamples = samples.filter(s => s.trackId === track.id)
      const newClips = trackSamples.map(sample => ({
        id: `sample-${Date.now()}-${Math.random()}`,
        start: sample.start,
        duration: sample.duration,
      }))
      return { ...track, clips: [...track.clips, ...newClips] }
    }))
  }, [isInitialized, initializeAudio])

  // Mute/unmute track
  const toggleTrackMute = useCallback((trackId: string) => {
    setTracks(prev => prev.map(track => 
      track.id === trackId 
        ? { ...track, muted: !track.muted }
        : track
    ))
  }, [])

  // Update track volume
  const updateTrackVolume = useCallback((trackId: string, volume: number) => {
    setTracks(prev => prev.map(track => 
      track.id === trackId 
        ? { ...track, volume }
        : track
    ))
  }, [])

  // Clear all clips
  const clearAllClips = useCallback(() => {
    setTracks(prev => prev.map(track => ({ ...track, clips: [] })))
  }, [])

  // Export (placeholder)
  const exportAudio = useCallback(async () => {
    alert('导出功能演示：实际开发中可使用 Tone.Offline 或 Web Audio 录制混音结果')
  }, [])

  return {
    tracks,
    isPlaying,
    isRecording,
    bpm,
    currentTime,
    isInitialized,
    setBpm,
    togglePlayback,
    stop,
    toggleRecording,
    loadSampleClips,
    toggleTrackMute,
    updateTrackVolume,
    clearAllClips,
    exportAudio,
    initializeAudio,
  }
}