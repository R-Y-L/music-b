import { useState } from 'react'
import { effectPresets } from '../../audio/presets'
import { AudioTrack } from '../../audio/trackManager'

interface MixerChannelProps {
  track: AudioTrack
  onVolumeChange: (volume: number) => void
  onPanChange: (pan: number) => void
  onMuteToggle: () => void
  onSoloToggle: () => void
  onEffectAdd: (effectType: string) => void
  onEffectRemove: (effectId: string) => void
  onEffectUpdate: (effectId: string, params: any) => void
}

export const MixerChannel = ({
  track,
  onVolumeChange,
  onPanChange,
  onMuteToggle,
  onSoloToggle,
  onEffectAdd,
  onEffectRemove,
  onEffectUpdate: _onEffectUpdate
}: MixerChannelProps) => {
  const [showEQ, setShowEQ] = useState(false)
  const [eqSettings, setEQSettings] = useState({
    low: 0,
    mid: 0,
    high: 0
  })

  const volumePercent = ((track.config.volume + 60) / 72) * 100 // -60dB to +12dB

  return (
    <div className="mixer-channel">
      {/* 通道名称 */}
      <div className="channel-header">
        <h5>{track.config.name}</h5>
        <span className="channel-id">#{track.config.id}</span>
      </div>

      {/* 效果器插槽 */}
      <div className="effects-slots">
        <div className="effects-header">
          <span className="muted small">效果器</span>
          <button className="btn tiny ghost" onClick={() => {
            const availableEffects = Object.keys(effectPresets)
            const randomEffect = availableEffects[Math.floor(Math.random() * availableEffects.length)]
            onEffectAdd(randomEffect)
          }}>
            +
          </button>
        </div>
        <div className="effects-list">
          {track.config.effects.length === 0 ? (
            <div className="empty-effects">
              <span className="muted small">无效果器</span>
            </div>
          ) : (
            track.config.effects.map((effectId, index) => {
              const preset = effectPresets[effectId as keyof typeof effectPresets]
              return (
                <div key={`${effectId}-${index}`} className="effect-slot">
                  <span className="effect-name">{preset?.name || effectId}</span>
                  <button 
                    className="btn tiny ghost"
                    onClick={() => onEffectRemove(effectId)}
                  >
                    ×
                  </button>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* EQ控制 */}
      <div className="eq-section">
        <button 
          className={`btn tiny ${showEQ ? 'primary' : 'ghost'}`}
          onClick={() => setShowEQ(!showEQ)}
        >
          EQ
        </button>
        {showEQ && (
          <div className="eq-controls">
            <label>
              <span>High</span>
              <input 
                type="range" 
                min="-12" 
                max="12" 
                value={eqSettings.high}
                onChange={(e) => setEQSettings(prev => ({ ...prev, high: Number(e.target.value) }))}
                className="eq-slider"
              />
              <span className="eq-value">{eqSettings.high > 0 ? '+' : ''}{eqSettings.high}dB</span>
            </label>
            <label>
              <span>Mid</span>
              <input 
                type="range" 
                min="-12" 
                max="12" 
                value={eqSettings.mid}
                onChange={(e) => setEQSettings(prev => ({ ...prev, mid: Number(e.target.value) }))}
                className="eq-slider"
              />
              <span className="eq-value">{eqSettings.mid > 0 ? '+' : ''}{eqSettings.mid}dB</span>
            </label>
            <label>
              <span>Low</span>
              <input 
                type="range" 
                min="-12" 
                max="12" 
                value={eqSettings.low}
                onChange={(e) => setEQSettings(prev => ({ ...prev, low: Number(e.target.value) }))}
                className="eq-slider"
              />
              <span className="eq-value">{eqSettings.low > 0 ? '+' : ''}{eqSettings.low}dB</span>
            </label>
          </div>
        )}
      </div>

      {/* 声像控制 */}
      <div className="pan-section">
        <label>
          <span>Pan</span>
          <input 
            type="range" 
            min="-1" 
            max="1" 
            step="0.01"
            value={track.config.pan}
            onChange={(e) => onPanChange(Number(e.target.value))}
            className="pan-slider"
          />
          <span className="pan-value">
            {track.config.pan > 0 ? `R${(track.config.pan * 100).toFixed(0)}` : track.config.pan < 0 ? `L${(Math.abs(track.config.pan) * 100).toFixed(0)}` : 'C'}
          </span>
        </label>
      </div>

      {/* 音量推子 */}
      <div className="volume-fader">
        <div className="fader-track">
          <input 
            type="range" 
            min="-60" 
            max="12" 
            step="0.5"
            value={track.config.volume}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            className="volume-slider vertical"
          />
          <div 
            className="volume-indicator"
            style={{ bottom: `${volumePercent}%` }}
          />
        </div>
        <div className="volume-label">
          <span className="volume-db">{track.config.volume}dB</span>
        </div>
      </div>

      {/* 控制按钮 */}
      <div className="channel-controls">
        <button 
          className={`btn tiny ${track.config.solo ? 'primary' : 'ghost'}`}
          onClick={onSoloToggle}
        >
          S
        </button>
        <button 
          className={`btn tiny ${track.config.muted ? 'danger' : 'ghost'}`}
          onClick={onMuteToggle}
        >
          M
        </button>
      </div>

      {/* VU表 */}
      <div className="vu-meter">
        <div className="vu-bar left">
          <div 
            className="vu-level"
            style={{ 
              height: `${Math.min(100, Math.max(0, (track.config.volume + 60) / 0.72))}%`,
              backgroundColor: track.config.volume > -6 ? '#ff4444' : track.config.volume > -18 ? '#ffaa44' : '#44ff44'
            }}
          />
        </div>
        <div className="vu-bar right">
          <div 
            className="vu-level"
            style={{ 
              height: `${Math.min(100, Math.max(0, (track.config.volume + 60) / 0.72))}%`,
              backgroundColor: track.config.volume > -6 ? '#ff4444' : track.config.volume > -18 ? '#ffaa44' : '#44ff44'
            }}
          />
        </div>
      </div>
    </div>
  )
}