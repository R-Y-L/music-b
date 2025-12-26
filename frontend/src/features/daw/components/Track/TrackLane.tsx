import type { AudioClip, AudioTrack } from '../../audio/trackManager'

interface TrackLaneProps {
  track: AudioTrack
  currentTime: number
  timelineWidth: number
  pixelsPerSecond: number
  onClipClick?: (clip: AudioClip) => void
}

export const TrackLane = ({ 
  track, 
  currentTime, 
  timelineWidth,
  pixelsPerSecond,
  onClipClick 
}: TrackLaneProps) => {
  const { config, clips } = track

  return (
    <div 
      className="track-lane" 
      style={{ 
        opacity: config.muted ? 0.5 : 1,
        width: timelineWidth
      }}
    >
      {/* 音频片段 */}
      {clips.map((clip) => (
        <div 
          key={clip.id} 
          className="audio-clip" 
          style={{ 
            backgroundColor: config.color,
            left: clip.start * pixelsPerSecond,
            width: clip.duration * pixelsPerSecond,
          }}
          onClick={() => onClipClick?.(clip)}
        >
          <div className="clip-content">
            <div className="clip-name">{clip.name || `${config.name} Clip`}</div>
            <div className="clip-duration">{clip.duration.toFixed(1)}s</div>
          </div>
          
          {/* 波形预览占位 */}
          <div className="clip-waveform">
            {/* 简单的波形模拟 */}
            {[...Array(Math.floor(clip.duration * 4))].map((_, i) => (
              <div 
                key={i} 
                className="wave-bar" 
                style={{ 
                  height: `${20 + Math.random() * 30}px`,
                  opacity: 0.6 
                }}
              />
            ))}
          </div>
        </div>
      ))}

      {/* 播放头 */}
      <div 
        className="playhead"
        style={{ 
          left: currentTime * pixelsPerSecond,
          display: currentTime * pixelsPerSecond > timelineWidth ? 'none' : 'block'
        }}
      />

      {/* 网格线 */}
      <div className="grid-lines">
        {[...Array(Math.floor(timelineWidth / pixelsPerSecond))].map((_, i) => (
          <div 
            key={i}
            className="grid-line"
            style={{ left: i * pixelsPerSecond }}
          />
        ))}
      </div>
    </div>
  )
}