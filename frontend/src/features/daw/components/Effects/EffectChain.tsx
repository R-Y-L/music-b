import React, { useState, useCallback } from 'react'

export interface EffectParameters {
  [key: string]: number | string | boolean
}

export interface Effect {
  id: string
  type: string
  name: string
  enabled: boolean
  parameters: EffectParameters
}

interface EffectEditorProps {
  effect: Effect
  onUpdate: (parameters: EffectParameters) => void
  onToggle: () => void
  onRemove: () => void
}

const EffectEditor: React.FC<EffectEditorProps> = ({
  effect,
  onUpdate,
  onToggle,
  onRemove
}) => {
  const handleParameterChange = useCallback((param: string, value: number | string | boolean) => {
    onUpdate({
      ...effect.parameters,
      [param]: value
    })
  }, [effect.parameters, onUpdate])

  const renderParameters = () => {
    switch (effect.type) {
      case 'reverb':
        return (
          <div className="effect-params">
            <div className="param-row">
              <label>Room Size</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={Number(effect.parameters.roomSize || 0.7)}
                onChange={(e) => handleParameterChange('roomSize', parseFloat(e.target.value))}
                className="param-slider"
              />
              <span className="param-value">{((effect.parameters.roomSize as number) || 0.7).toFixed(2)}</span>
            </div>
            <div className="param-row">
              <label>Dampening</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={Number(effect.parameters.dampening || 3000)}
                onChange={(e) => handleParameterChange('dampening', parseFloat(e.target.value))}
                className="param-slider"
              />
              <span className="param-value">{effect.parameters.dampening || 3000}</span>
            </div>
            <div className="param-row">
              <label>Wet</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={Number(effect.parameters.wet || 0.3)}
                onChange={(e) => handleParameterChange('wet', parseFloat(e.target.value))}
                className="param-slider"
              />
              <span className="param-value">{((effect.parameters.wet as number) || 0.3).toFixed(2)}</span>
            </div>
          </div>
        )

      case 'delay':
        return (
          <div className="effect-params">
            <div className="param-row">
              <label>Delay Time</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={Number(effect.parameters.delayTime || 0.25)}
                onChange={(e) => handleParameterChange('delayTime', parseFloat(e.target.value))}
                className="param-slider"
              />
              <span className="param-value">{((effect.parameters.delayTime as number) || 0.25).toFixed(2)}s</span>
            </div>
            <div className="param-row">
              <label>Feedback</label>
              <input
                type="range"
                min="0"
                max="0.95"
                step="0.01"
                value={Number(effect.parameters.feedback || 0.4)}
                onChange={(e) => handleParameterChange('feedback', parseFloat(e.target.value))}
                className="param-slider"
              />
              <span className="param-value">{((effect.parameters.feedback as number) || 0.4).toFixed(2)}</span>
            </div>
            <div className="param-row">
              <label>Wet</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={Number(effect.parameters.wet || 0.3)}
                onChange={(e) => handleParameterChange('wet', parseFloat(e.target.value))}
                className="param-slider"
              />
              <span className="param-value">{((effect.parameters.wet as number) || 0.3).toFixed(2)}</span>
            </div>
          </div>
        )

      case 'distortion':
        return (
          <div className="effect-params">
            <div className="param-row">
              <label>Drive</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={Number(effect.parameters.distortion || 0.4)}
                onChange={(e) => handleParameterChange('distortion', parseFloat(e.target.value))}
                className="param-slider"
              />
              <span className="param-value">{((effect.parameters.distortion as number) || 0.4).toFixed(2)}</span>
            </div>
            <div className="param-row">
              <label>Oversample</label>
              <select
                value={String(effect.parameters.oversample || 'none')}
                onChange={(e) => handleParameterChange('oversample', e.target.value)}
                className="param-select"
              >
                <option value="none">None</option>
                <option value="2x">2x</option>
                <option value="4x">4x</option>
              </select>
            </div>
          </div>
        )

      case 'chorus':
        return (
          <div className="effect-params">
            <div className="param-row">
              <label>Rate</label>
              <input
                type="range"
                min="0.1"
                max="10"
                step="0.1"
                value={Number(effect.parameters.frequency || 1.5)}
                onChange={(e) => handleParameterChange('frequency', parseFloat(e.target.value))}
                className="param-slider"
              />
              <span className="param-value">{((effect.parameters.frequency as number) || 1.5).toFixed(1)} Hz</span>
            </div>
            <div className="param-row">
              <label>Depth</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={Number(effect.parameters.depth || 0.7)}
                onChange={(e) => handleParameterChange('depth', parseFloat(e.target.value))}
                className="param-slider"
              />
              <span className="param-value">{((effect.parameters.depth as number) || 0.7).toFixed(2)}</span>
            </div>
            <div className="param-row">
              <label>Delay Time</label>
              <input
                type="range"
                min="2"
                max="20"
                step="0.5"
                value={Number(effect.parameters.delayTime || 3.5)}
                onChange={(e) => handleParameterChange('delayTime', parseFloat(e.target.value))}
                className="param-slider"
              />
              <span className="param-value">{((effect.parameters.delayTime as number) || 3.5).toFixed(1)} ms</span>
            </div>
          </div>
        )

      case 'compressor':
        return (
          <div className="effect-params">
            <div className="param-row">
              <label>Threshold</label>
              <input
                type="range"
                min="-60"
                max="0"
                step="1"
                value={Number(effect.parameters.threshold || -24)}
                onChange={(e) => handleParameterChange('threshold', parseFloat(e.target.value))}
                className="param-slider"
              />
              <span className="param-value">{effect.parameters.threshold || -24} dB</span>
            </div>
            <div className="param-row">
              <label>Ratio</label>
              <input
                type="range"
                min="1"
                max="20"
                step="0.1"
                value={Number(effect.parameters.ratio || 4)}
                onChange={(e) => handleParameterChange('ratio', parseFloat(e.target.value))}
                className="param-slider"
              />
              <span className="param-value">{((effect.parameters.ratio as number) || 4).toFixed(1)}:1</span>
            </div>
            <div className="param-row">
              <label>Attack</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={Number(effect.parameters.attack || 0.003)}
                onChange={(e) => handleParameterChange('attack', parseFloat(e.target.value))}
                className="param-slider"
              />
              <span className="param-value">{((effect.parameters.attack as number) || 0.003).toFixed(3)}s</span>
            </div>
            <div className="param-row">
              <label>Release</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={Number(effect.parameters.release || 0.25)}
                onChange={(e) => handleParameterChange('release', parseFloat(e.target.value))}
                className="param-slider"
              />
              <span className="param-value">{((effect.parameters.release as number) || 0.25).toFixed(3)}s</span>
            </div>
          </div>
        )

      case 'eq3':
        return (
          <div className="effect-params">
            <div className="param-row">
              <label>High</label>
              <input
                type="range"
                min="-15"
                max="15"
                step="0.5"
                value={Number(effect.parameters.high || 0)}
                onChange={(e) => handleParameterChange('high', parseFloat(e.target.value))}
                className="param-slider"
              />
              <span className="param-value">{effect.parameters.high || 0} dB</span>
            </div>
            <div className="param-row">
              <label>Mid</label>
              <input
                type="range"
                min="-15"
                max="15"
                step="0.5"
                value={Number(effect.parameters.mid || 0)}
                onChange={(e) => handleParameterChange('mid', parseFloat(e.target.value))}
                className="param-slider"
              />
              <span className="param-value">{effect.parameters.mid || 0} dB</span>
            </div>
            <div className="param-row">
              <label>Low</label>
              <input
                type="range"
                min="-15"
                max="15"
                step="0.5"
                value={Number(effect.parameters.low || 0)}
                onChange={(e) => handleParameterChange('low', parseFloat(e.target.value))}
                className="param-slider"
              />
              <span className="param-value">{effect.parameters.low || 0} dB</span>
            </div>
          </div>
        )

      default:
        return (
          <div className="effect-params">
            <p className="muted">No parameters available for this effect</p>
          </div>
        )
    }
  }

  return (
    <div className={`effect-editor ${effect.enabled ? 'enabled' : 'disabled'}`}>
      <div className="effect-header">
        <div className="effect-info">
          <h5>{effect.name}</h5>
          <span className="effect-type">{effect.type}</span>
        </div>
        <div className="effect-controls">
          <button
            className={`btn tiny ${effect.enabled ? 'success' : 'ghost'}`}
            onClick={onToggle}
            title={effect.enabled ? 'Disable' : 'Enable'}
          >
            {effect.enabled ? '●' : '○'}
          </button>
          <button
            className="btn tiny danger"
            onClick={onRemove}
            title="Remove Effect"
          >
            ×
          </button>
        </div>
      </div>
      
      {effect.enabled && renderParameters()}
    </div>
  )
}

interface EffectChainProps {
  trackId?: string
  effects: Effect[]
  onEffectAdd: (effectType: string) => void
  onEffectUpdate: (effectId: string, parameters: EffectParameters) => void
  onEffectToggle?: (effectId: string) => void
  onEffectRemove: (effectId: string) => void
  onEffectReorder?: (fromIndex: number, toIndex: number) => void
}

const AVAILABLE_EFFECTS = [
  { type: 'reverb', name: 'Reverb', icon: '🌊' },
  { type: 'delay', name: 'Delay', icon: '🔄' },
  { type: 'distortion', name: 'Distortion', icon: '🔥' },
  { type: 'chorus', name: 'Chorus', icon: '🎭' },
  { type: 'compressor', name: 'Compressor', icon: '⚡' },
  { type: 'eq3', name: '3-Band EQ', icon: '🎚️' }
]

export const EffectChain: React.FC<EffectChainProps> = ({
  trackId: _trackId,
  effects,
  onEffectAdd,
  onEffectUpdate,
  onEffectToggle,
  onEffectRemove,
  onEffectReorder
}) => {
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const handleAddEffect = useCallback((effectType: string) => {
    onEffectAdd(effectType)
    setShowAddMenu(false)
  }, [onEffectAdd])

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex !== null && draggedIndex !== index && onEffectReorder) {
      onEffectReorder(draggedIndex, index)
      setDraggedIndex(index)
    }
  }, [draggedIndex, onEffectReorder])

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null)
  }, [])

  return (
    <div className="effect-chain">
      <div className="chain-header">
        <div className="chain-info">
          <h4>Effects Chain</h4>
          <span className="effect-count">{effects.length} effects</span>
        </div>
        <div className="chain-controls">
          <div className="add-effect-container">
            <button
              className="btn small primary"
              onClick={() => setShowAddMenu(!showAddMenu)}
            >
              + Add Effect
            </button>
            {showAddMenu && (
              <div className="add-effect-menu">
                {AVAILABLE_EFFECTS.map(effect => (
                  <button
                    key={effect.type}
                    className="effect-option"
                    onClick={() => handleAddEffect(effect.type)}
                  >
                    <span className="effect-icon">{effect.icon}</span>
                    {effect.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="effects-list">
        {effects.length === 0 ? (
          <div className="empty-chain">
            <p className="muted">No effects added</p>
            <p className="muted small">Click "Add Effect" to get started</p>
          </div>
        ) : (
          effects.map((effect, index) => (
            <div
              key={effect.id}
              draggable={!!onEffectReorder}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`effect-slot ${draggedIndex === index ? 'dragging' : ''}`}
            >
              {onEffectReorder && <div className="drag-handle">⋮⋮</div>}
              <EffectEditor
                effect={effect}
                onUpdate={(parameters) => onEffectUpdate(effect.id, parameters)}
                onToggle={() => onEffectToggle?.(effect.id)}
                onRemove={() => onEffectRemove(effect.id)}
              />
            </div>
          ))
        )}
      </div>
    </div>
  )
}