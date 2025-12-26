import type { AudioTrack } from '../../audio/trackManager'

interface TrackHeaderProps {
  track: AudioTrack
  onVolumeChange: (volume: number) => void
  onPanChange: (pan: number) => void
  onToggleMute: () => void
  onToggleSolo: () => void
  onDelete: () => void
}

export const TrackHeader = ({ 
  track, 
  onVolumeChange, 
  onPanChange, 
  onToggleMute, 
  onToggleSolo, 
  onDelete 
}: TrackHeaderProps) => {
  const { config } = track

  return (
    <div className="track-header">
      {/* 轨道信息 */}
      <div className="track-info">
        <h4 style={{ color: config.color }}>{config.name}</h4>
        <div className="track-controls">
          <button 
            className={`btn tiny ${config.muted ? 'danger' : 'ghost'}`}
            onClick={onToggleMute}
            title="静音"
          >
            M
          </button>
          <button 
            className={`btn tiny ${config.solo ? 'primary' : 'ghost'}`}
            onClick={onToggleSolo}
            title="独奏"
          >
            S
          </button>
          <button 
            className="btn tiny ghost"
            onClick={onDelete}
            title="删除轨道"
          >
            ×
          </button>
        </div>
      </div>

      {/* 音量控制 */}
      <div className="track-volume">
        <label>
          <span>音量</span>
          <input 
            type="range" 
            min="-60" 
            max="12" 
            step="0.5"
            value={config.volume}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            className="volume-slider"
          />
          <span className="volume-value">{config.volume}dB</span>
        </label>
      </div>

      {/* 声像控制 */}
      <div className="track-pan">
        <label>
          <span>声像</span>
          <input 
            type="range" 
            min="-100" 
            max="100" 
            step="1"
            value={config.pan}
            onChange={(e) => onPanChange(Number(e.target.value))}
            className="pan-slider"
          />
          <span className="pan-value">
            {config.pan > 0 ? `R${config.pan}` : config.pan < 0 ? `L${Math.abs(config.pan)}` : 'C'}
          </span>
        </label>
      </div>

      {/* 效果器插槽 */}
      <div className="track-effects">
        <span className="muted small">FX: {config.effects.length}</span>
        <button className="btn tiny ghost" title="添加效果器">
          +
        </button>
      </div>
    </div>
  )
}