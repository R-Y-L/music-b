import { useCallback, useEffect, useState } from 'react'
import { trackManager, type AudioTrack, type TrackConfig, type TrackType, type PatternNote, type DrumPattern } from '../../audio/trackManager'

export const useTracks = () => {
  const [tracks, setTracks] = useState<AudioTrack[]>([])
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null)

  // 刷新轨道列表
  const refreshTracks = useCallback(() => {
    setTracks(trackManager.getAllTracks())
  }, [])

  // 获取选中的轨道
  const selectedTrack = tracks.find(t => t.config.id === selectedTrackId) || null

  // 选择轨道
  const selectTrack = useCallback((id: string | null) => {
    setSelectedTrackId(id)
  }, [])

  // 创建新轨道
  const createTrack = useCallback((config: Omit<TrackConfig, 'id'>) => {
    const id = `track-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const fullConfig: TrackConfig = { ...config, id }
    trackManager.createTrack(fullConfig)
    refreshTracks()
    setSelectedTrackId(id)  // 自动选中新创建的轨道
    return id
  }, [refreshTracks])

  // 删除轨道
  const deleteTrack = useCallback((id: string) => {
    trackManager.deleteTrack(id)
    if (selectedTrackId === id) {
      setSelectedTrackId(null)
    }
    refreshTracks()
  }, [refreshTracks, selectedTrackId])

  // 更新轨道音量
  const updateTrackVolume = useCallback((id: string, volume: number) => {
    const track = trackManager.getTrack(id)
    if (track) {
      track.updateVolume(volume)
      refreshTracks()
    }
  }, [refreshTracks])

  // 更新轨道声像
  const updateTrackPan = useCallback((id: string, pan: number) => {
    const track = trackManager.getTrack(id)
    if (track) {
      track.updatePan(pan)
      refreshTracks()
    }
  }, [refreshTracks])

  // 切换静音
  const toggleTrackMute = useCallback((id: string) => {
    const track = trackManager.getTrack(id)
    if (track) {
      track.toggleMute()
      refreshTracks()
    }
  }, [refreshTracks])

  // 切换独奏
  const toggleTrackSolo = useCallback((id: string) => {
    trackManager.toggleTrackSolo(id)
    refreshTracks()
  }, [refreshTracks])

  // 更新轨道的 pattern 音符
  const updateTrackNotes = useCallback((trackId: string, notes: PatternNote[]) => {
    const track = trackManager.getTrack(trackId)
    if (track) {
      const pattern = track.getCurrentPattern()
      track.updatePatternNotes(pattern.id, notes)
      refreshTracks()
    }
  }, [refreshTracks])

  // 更新轨道的鼓机 pattern
  const updateTrackDrumPattern = useCallback((trackId: string, drumPattern: DrumPattern) => {
    const track = trackManager.getTrack(trackId)
    if (track) {
      const pattern = track.getCurrentPattern()
      track.updateDrumPattern(pattern.id, drumPattern)
      refreshTracks()
    }
  }, [refreshTracks])

  // 清空所有轨道
  const clearAllTracks = useCallback(() => {
    trackManager.clearAllTracks()
    setSelectedTrackId(null)
    refreshTracks()
  }, [refreshTracks])

  // 创建特定类型的轨道
  const createTypedTrack = useCallback((type: TrackType, name?: string, instrument?: string) => {
    const colors: Record<TrackType, string> = {
      'instrument': '#1f9bff',
      'drums': '#30c48d',
      'audio': '#ff7b5f'
    }
    const defaultNames: Record<TrackType, string> = {
      'instrument': 'Synth',
      'drums': 'Drums',
      'audio': 'Audio'
    }
    
    // 使用 trackManager 的实时状态计数，而非本地 tracks 状态
    const allTracks = trackManager.getAllTracks()
    const sameTypeCount = allTracks.filter(t => t.config.type === type).length
    
    return createTrack({
      name: name || `${defaultNames[type]} ${sameTypeCount + 1}`,
      type,
      color: colors[type],
      volume: -6,
      pan: 0,
      muted: false,
      solo: false,
      effects: [],
      instrument: type === 'instrument' ? (instrument || 'synth') : undefined
    })
  }, [createTrack])

  // 创建默认轨道
  const createDefaultTracks = useCallback(() => {
    createTypedTrack('drums', 'Drums')
    createTypedTrack('instrument', 'Lead Synth')
  }, [createTypedTrack])

  // 初始化默认轨道 - 只在首次挂载且无轨道时执行
  useEffect(() => {
    const existingTracks = trackManager.getAllTracks()
    if (existingTracks.length === 0) {
      createDefaultTracks()
    } else {
      // 如果已有轨道，同步到状态
      setTracks(existingTracks)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    tracks,
    selectedTrack,
    selectedTrackId,
    selectTrack,
    createTrack,
    createTypedTrack,
    deleteTrack,
    updateTrackVolume,
    updateTrackPan,
    toggleTrackMute,
    toggleTrackSolo,
    updateTrackNotes,
    updateTrackDrumPattern,
    clearAllTracks,
    createDefaultTracks,
    refreshTracks
  }
}