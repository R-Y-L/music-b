import { TrackHeader } from './TrackHeader'
import { TrackLane } from './TrackLane'
import { useTracks } from './useTracks'

interface TrackListProps {
  currentTime: number
  timelineWidth?: number
  pixelsPerSecond?: number
}

export const TrackList = ({ 
  currentTime, 
  timelineWidth = 800, 
  pixelsPerSecond = 20 
}: TrackListProps) => {
  const {
    tracks,
    createTrack,
    deleteTrack,
    updateTrackVolume,
    updateTrackPan,
    toggleTrackMute,
    toggleTrackSolo,
    clearAllTracks
  } = useTracks()

  const handleCreateTrack = () => {
    const colors = ['#30c48d', '#1f9bff', '#ff7b5f', '#b58cff', '#ffd93d', '#ff6b9d']
    const randomColor = colors[Math.floor(Math.random() * colors.length)]
    
    createTrack({
      name: `Track ${tracks.length + 1}`,
      color: randomColor,
      volume: -12,
      pan: 0,
      muted: false,
      solo: false,
      effects: []
    })
  }

  return (
    <div className="track-list">
      {/* 轨道操作 */}
      <div className="track-actions">
        <div className="row gap">
          <button className="btn small outline" onClick={handleCreateTrack}>
            + 新建轨道
          </button>
          <button 
            className="btn small ghost" 
            onClick={clearAllTracks}
            disabled={tracks.length === 0}
          >
            清空轨道
          </button>
          <div className="track-count">
            <span className="muted">轨道数: {tracks.length}</span>
          </div>
        </div>
      </div>

      {/* 轨道列表 */}
      <div className="tracks-container">
        {tracks.length === 0 ? (
          <div className="empty-tracks">
            <p className="muted">暂无轨道，点击"新建轨道"开始创作</p>
          </div>
        ) : (
          tracks.map((track) => (
            <div key={track.config.id} className="track-row">
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
                  // TODO: 实现片段编辑功能
                }}
              />
            </div>
          ))
        )}
      </div>
    </div>
  )
}