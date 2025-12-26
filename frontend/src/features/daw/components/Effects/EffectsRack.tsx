import { useState } from 'react'
import { effectPresets } from '../../audio/presets'

interface EffectsRackProps {
  trackId?: string
  effects?: string[]
  onEffectAdd?: (effectType: string) => void
  onEffectRemove?: (effectId: string) => void
  onEffectUpdate?: (effectId: string, params: Record<string, any>) => void
}

export const EffectsRack = ({ 
  trackId: _trackId, 
  effects = [], 
  onEffectAdd, 
  onEffectRemove, 
  onEffectUpdate 
}: EffectsRackProps) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const availableEffects = Object.entries(effectPresets)

  return (
    <div className="effects-rack">
      <div className="effects-header">
        <button 
          className="btn small ghost"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          🎛️ 效果器 ({effects.length})
        </button>
      </div>

      {isExpanded && (
        <div className="effects-panel">
          {/* 添加效果器 */}
          <div className="effects-add">
            <label>
              <span>添加效果器:</span>
              <select 
                onChange={(e) => {
                  if (e.target.value) {
                    onEffectAdd?.(e.target.value)
                    e.target.value = '' // 重置选择
                  }
                }}
                defaultValue=""
              >
                <option value="">选择效果器...</option>
                {availableEffects.map(([key, preset]) => (
                  <option key={key} value={key}>
                    {preset.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* 已添加的效果器 */}
          <div className="effects-list">
            {effects.length === 0 ? (
              <p className="muted small">暂无效果器</p>
            ) : (
              effects.map((effectId, index) => {
                const preset = effectPresets[effectId as keyof typeof effectPresets]
                return (
                  <div key={`${effectId}-${index}`} className="effect-item">
                    <div className="effect-header">
                      <span>{preset?.name || effectId}</span>
                      <button 
                        className="btn tiny ghost"
                        onClick={() => onEffectRemove?.(effectId)}
                      >
                        ×
                      </button>
                    </div>
                    
                    {/* 效果器参数控制 */}
                    <div className="effect-controls">
                      {preset && renderEffectControls(effectId, (preset as any).options || (preset as any).defaultParams || {}, onEffectUpdate)}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// 渲染效果器参数控制
function renderEffectControls(
  effectId: string, 
  options: Record<string, any>, 
  onUpdate?: (effectId: string, params: Record<string, any>) => void
) {
  return (
    <div className="effect-params">
      {Object.entries(options).map(([param, value]) => {
        if (typeof value === 'number') {
          // 数字参数用滑块控制
          const isDecimal = value % 1 !== 0
          const step = isDecimal ? 0.01 : 1
          const min = Math.min(0, value - Math.abs(value))
          const max = Math.max(1, value + Math.abs(value))

          return (
            <div key={param} className="param-control">
              <label>
                <span>{param}</span>
                <input 
                  type="range"
                  min={min}
                  max={max}
                  step={step}
                  defaultValue={value}
                  onChange={(e) => {
                    onUpdate?.(effectId, { [param]: Number(e.target.value) })
                  }}
                />
                <span className="param-value">{value}</span>
              </label>
            </div>
          )
        } else if (typeof value === 'string') {
          // 字符串参数用选择框
          const options = getStringParamOptions(param)
          return (
            <div key={param} className="param-control">
              <label>
                <span>{param}</span>
                <select 
                  defaultValue={value}
                  onChange={(e) => {
                    onUpdate?.(effectId, { [param]: e.target.value })
                  }}
                >
                  {options.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>
            </div>
          )
        }
        return null
      })}
    </div>
  )
}

// 获取字符串参数的可选值
function getStringParamOptions(param: string): string[] {
  switch (param) {
    case 'type':
      return ['lowpass', 'highpass', 'bandpass', 'notch']
    case 'oversample':
      return ['none', '2x', '4x']
    case 'delayTime':
      return ['16n', '8n', '4n', '2n', '1n']
    default:
      return [param] // 默认返回原值
  }
}