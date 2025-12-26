import type { ReactNode } from 'react'
import { useTransport } from './useTransport'

interface TransportControlsProps {
  children?: ReactNode
}

export const TransportControls = ({ children }: TransportControlsProps) => {
  const {
    isPlaying,
    isRecording,
    currentTime,
    bpm,
    timeSignature,
    isInitialized,
    initialize,
    togglePlayback,
    stop,
    setBPM,
    setTimeSignature
  } = useTransport()

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="transport-controls">
      {/* 播放控制 */}
      <div className="transport-playback">
        <div className="row gap">
          <button 
            className={`btn ${isPlaying ? 'primary' : 'outline'}`}
            onClick={togglePlayback}
          >
            {isPlaying ? '⏸️ 暂停' : '▶️ 播放'}
          </button>
          <button className="btn outline" onClick={stop}>
            ⏹️ 停止
          </button>
          <button 
            className={`btn ${isRecording ? 'danger' : 'outline'}`}
            disabled
          >
            {isRecording ? '⏺️ 录制中' : '⏺️ 录制'}
          </button>
        </div>
      </div>

      {/* 时间显示 */}
      <div className="transport-display">
        <div className="time-display">
          <span className="time">{formatTime(currentTime)}</span>
          <span className="muted">/ 00:00</span>
        </div>
      </div>

      {/* BPM控制 */}
      <div className="transport-tempo">
        <label>
          <span>BPM</span>
          <div className="row gap">
            <input 
              type="range" 
              min="60" 
              max="200" 
              value={bpm}
              onChange={(e) => setBPM(Number(e.target.value))}
              className="bpm-slider"
            />
            <input 
              type="number" 
              min="60" 
              max="200" 
              value={bpm}
              onChange={(e) => setBPM(Number(e.target.value))}
              className="bpm-input"
            />
          </div>
        </label>
      </div>

      {/* 拍号控制 */}
      <div className="transport-signature">
        <label>
          <span>拍号</span>
          <div className="row gap">
            <select 
              value={timeSignature[0]} 
              onChange={(e) => setTimeSignature(Number(e.target.value), timeSignature[1])}
            >
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={5}>5</option>
              <option value={6}>6</option>
              <option value={7}>7</option>
            </select>
            <span>/</span>
            <select 
              value={timeSignature[1]} 
              onChange={(e) => setTimeSignature(timeSignature[0], Number(e.target.value))}
            >
              <option value={4}>4</option>
              <option value={8}>8</option>
              <option value={16}>16</option>
            </select>
          </div>
        </label>
      </div>

      {/* 状态指示 */}
      <div className="transport-status">
        <span className={`status-indicator ${isInitialized ? 'active' : ''}`}>
          {isInitialized ? '🟢 已连接' : '🔴 未连接'}
        </span>
        {!isInitialized && (
          <button className="btn small primary" onClick={initialize}>
            初始化音频
          </button>
        )}
      </div>

      {children}
    </div>
  )
}