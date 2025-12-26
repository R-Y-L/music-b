import { useCallback, useEffect, useState } from 'react'
import { trackManager, type AudioTrack, type TrackConfig } from '../../audio/trackManager'

export const useTracks = () => {
  const [tracks, setTracks] = useState<AudioTrack[]>([])

  // 刷新轨道列表
  const refreshTracks = useCallback(() => {
    setTracks(trackManager.getAllTracks())
  }, [])

  // 创建新轨道
  const createTrack = useCallback((config: Omit<TrackConfig, 'id'>) => {
    const id = `track-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const fullConfig: TrackConfig = { ...config, id }
    trackManager.createTrack(fullConfig)
    refreshTracks()
    return id
  }, [refreshTracks])

  // 删除轨道
  const deleteTrack = useCallback((id: string) => {
    trackManager.deleteTrack(id)
    refreshTracks()
  }, [refreshTracks])

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

  // 清空所有轨道
  const clearAllTracks = useCallback(() => {
    trackManager.clearAllTracks()
    refreshTracks()
  }, [refreshTracks])

  // 创建默认轨道
  const createDefaultTracks = useCallback(() => {
    const defaultTracks = [
      { name: 'Drums', color: '#30c48d', volume: -6, pan: 0, muted: false, solo: false, effects: [] },
      { name: 'Bass', color: '#1f9bff', volume: -8, pan: -20, muted: false, solo: false, effects: [] },
      { name: 'Lead', color: '#ff7b5f', volume: -10, pan: 20, muted: false, solo: false, effects: [] },
      { name: 'Pads', color: '#b58cff', volume: -12, pan: 0, muted: false, solo: false, effects: [] },
    ]

    defaultTracks.forEach(trackConfig => createTrack(trackConfig))
  }, [createTrack])

  // 初始化默认轨道
  useEffect(() => {
    if (tracks.length === 0) {
      createDefaultTracks()
    }
  }, [tracks.length, createDefaultTracks])

  return {
    tracks,
    createTrack,
    deleteTrack,
    updateTrackVolume,
    updateTrackPan,
    toggleTrackMute,
    toggleTrackSolo,
    clearAllTracks,
    createDefaultTracks,
    refreshTracks
  }
}