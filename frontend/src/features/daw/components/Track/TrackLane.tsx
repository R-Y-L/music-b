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
  const { config, clips, patterns } = track

  return (
    <div 
      className="track-lane" 
      style={{ 
        opacity: config.muted ? 0.5 : 1,
        width: timelineWidth
      }}
    >
      {/* Pattern 块 */}
      {patterns.map((pattern) => {
        const hasContent = pattern.notes.length > 0 || 
          (pattern.drumPattern && Object.values(pattern.drumPattern).some(beats => beats.some(b => b)))
        
        if (!hasContent) return null
        
        return (
          <div 
            key={pattern.id} 
            className="pattern-block" 
            style={{ 
              backgroundColor: config.color,
              left: pattern.startTime * pixelsPerSecond,
              width: pattern.duration * pixelsPerSecond,
              opacity: 0.8
            }}
            onClick={() => onClipClick?.({ 
              id: pattern.id, 
              start: pattern.startTime, 
              duration: pattern.duration,
              name: pattern.name
            })}
          >
            <div className="pattern-content">
              <div className="pattern-name">{pattern.name}</div>
              <div className="pattern-info">
                {config.type === 'drums' && pattern.drumPattern && (
                  <span>🥁 {Object.values(pattern.drumPattern).flat().filter(Boolean).length} hits</span>
                )}
                {config.type === 'instrument' && pattern.notes.length > 0 && (
                  <span>🎹 {pattern.notes.length} notes</span>
                )}
              </div>
            </div>
          </div>
        )
      })}
      
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