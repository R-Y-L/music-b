import { TrackHeader } from './TrackHeader'
import { TrackLane } from './TrackLane'
import { useTracks } from './useTracks'

interface TrackListProps {
  currentTime: number
  timelineWidth?: number
  pixelsPerSecond?: number
  selectedTrackId?: string | null
  onTrackSelect?: (trackId: string) => void
}

export const TrackList = ({ 
  currentTime, 
  timelineWidth = 800, 
  pixelsPerSecond = 20,
  selectedTrackId,
  onTrackSelect
}: TrackListProps) => {
  const {
    tracks,
    createTypedTrack,
    deleteTrack,
    updateTrackVolume,
    updateTrackPan,
    toggleTrackMute,
    toggleTrackSolo,
    clearAllTracks
  } = useTracks()

  return (
    <div className="track-list">
      {/* 轨道操作 */}
      <div className="track-actions">
        <div className="row gap">
          <button className="btn small outline" onClick={() => createTypedTrack('instrument')}>
            + 合成器
          </button>
          <button className="btn small outline" onClick={() => createTypedTrack('drums')}>
            + 鼓机
          </button>
          <button 
            className="btn small ghost" 
            onClick={clearAllTracks}
            disabled={tracks.length === 0}
          >
            清空
          </button>
          <div className="track-count">
            <span className="muted">{tracks.length} 轨道</span>
          </div>
        </div>
      </div>

      {/* 轨道列表 */}
      <div className="tracks-container">
        {tracks.length === 0 ? (
          <div className="empty-tracks">
            <p className="muted">暂无轨道，点击上方按钮开始创作</p>
          </div>
        ) : (
          tracks.map((track) => (
            <div 
              key={track.config.id} 
              className={`track-row ${selectedTrackId === track.config.id ? 'selected' : ''}`}
              onClick={() => onTrackSelect?.(track.config.id)}
              style={{
                backgroundColor: selectedTrackId === track.config.id ? 'rgba(255,255,255,0.05)' : 'transparent',
                cursor: 'pointer',
                borderLeft: selectedTrackId === track.config.id ? `3px solid ${track.config.color}` : '3px solid transparent'
              }}
            >
              <TrackHeader
                track={track}
                onVolumeChange={(volume) => updateTrackVolume(track.config.id, volume)}
                onPanChange={(pan) => updateTrackPan(track.config.id, pan)}
                onToggleMute={() => toggleTrackMute(track.config.id)}
                onToggleSolo={() => toggleTrackSolo(track.config.id)}
                onDelete={() => deleteTrack(track.config.id)}
              />
              <TrackLane
                track={track}
                currentTime={currentTime}
                timelineWidth={timelineWidth}
                pixelsPerSecond={pixelsPerSecond}
                onClipClick={(clip) => {
                  console.log('Clip clicked:', clip)
                  onTrackSelect?.(track.config.id)
                }}
              />
            </div>
          ))
        )}
      </div>
    </div>
  )
}