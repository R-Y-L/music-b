interface TimelineProps {
  currentTime: number
  timelineWidth: number
  pixelsPerSecond: number
  onSeek?: (time: number) => void
}

export const Timeline = ({ 
  currentTime, 
  timelineWidth, 
  pixelsPerSecond, 
  onSeek 
}: TimelineProps) => {
  const totalSeconds = timelineWidth / pixelsPerSecond
  const majorInterval = 4 // 主刻度间隔（秒）
  const minorInterval = 1 // 次刻度间隔（秒）

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const clickX = event.clientX - rect.left
    const time = clickX / pixelsPerSecond
    onSeek?.(time)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="timeline-container">
      <div 
        className="timeline" 
        style={{ width: timelineWidth }}
        onClick={handleClick}
      >
        {/* 时间标记 */}
        {[...Array(Math.ceil(totalSeconds / majorInterval) + 1)].map((_, i) => {
          const time = i * majorInterval
          const position = time * pixelsPerSecond
          
          return (
            <div 
              key={`major-${i}`}
              className="time-marker major"
              style={{ left: position }}
            >
              <div className="time-tick" />
              <div className="time-label">{formatTime(time)}</div>
            </div>
          )
        })}

        {/* 次要刻度 */}
        {[...Array(Math.ceil(totalSeconds / minorInterval) + 1)].map((_, i) => {
          const time = i * minorInterval
          const position = time * pixelsPerSecond
          
          // 跳过主刻度位置
          if (time % majorInterval === 0) return null
          
          return (
            <div 
              key={`minor-${i}`}
              className="time-marker minor"
              style={{ left: position }}
            >
              <div className="time-tick" />
            </div>
          )
        })}

        {/* 播放头指示器 */}
        <div 
          className="playhead-indicator"
          style={{ left: currentTime * pixelsPerSecond }}
        >
          <div className="playhead-handle" />
          <div className="playhead-line" />
        </div>

        {/* 循环区域指示器（占位） */}
        <div className="loop-region" style={{ left: 0, width: 0, display: 'none' }}>
          <div className="loop-start" />
          <div className="loop-end" />
        </div>
      </div>
    </div>
  )
}