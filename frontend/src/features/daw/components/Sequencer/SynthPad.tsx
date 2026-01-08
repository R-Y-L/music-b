import { useState, useEffect, useCallback } from 'react'
import * as Tone from 'tone'
import { instrumentPresets } from '../../audio/presets'

interface SynthPadProps {
  trackId?: string
  octave?: number
  onNotePlay: (note: string, velocity: number) => void
  onNoteStop: (note: string) => void
  onChordPlay?: (pitches: string[], velocity: number) => void
  preset?: string
}

const PIANO_LAYOUT = [
  // 八度音阶布局
  [
    { note: 'C4', type: 'white', label: 'C' },
    { note: 'C#4', type: 'black', label: 'C#' },
    { note: 'D4', type: 'white', label: 'D' },
    { note: 'D#4', type: 'black', label: 'D#' },
    { note: 'E4', type: 'white', label: 'E' },
    { note: 'F4', type: 'white', label: 'F' },
    { note: 'F#4', type: 'black', label: 'F#' },
    { note: 'G4', type: 'white', label: 'G' },
    { note: 'G#4', type: 'black', label: 'G#' },
    { note: 'A4', type: 'white', label: 'A' },
    { note: 'A#4', type: 'black', label: 'A#' },
    { note: 'B4', type: 'white', label: 'B' }
  ],
  [
    { note: 'C5', type: 'white', label: 'C' },
    { note: 'C#5', type: 'black', label: 'C#' },
    { note: 'D5', type: 'white', label: 'D' },
    { note: 'D#5', type: 'black', label: 'D#' },
    { note: 'E5', type: 'white', label: 'E' },
    { note: 'F5', type: 'white', label: 'F' },
    { note: 'F#5', type: 'black', label: 'F#' },
    { note: 'G5', type: 'white', label: 'G' },
    { note: 'G#5', type: 'black', label: 'G#' },
    { note: 'A5', type: 'white', label: 'A' },
    { note: 'A#5', type: 'black', label: 'A#' },
    { note: 'B5', type: 'white', label: 'B' }
  ]
]

export const SynthPad = ({ trackId: _trackId, octave: initialOctave = 4, onNotePlay, onNoteStop, onChordPlay: _onChordPlay, preset = 'synth-lead' }: SynthPadProps) => {
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set())
  const [currentPreset, setCurrentPreset] = useState(preset)
  const [octave, setOctave] = useState(initialOctave)
  const [synth, setSynth] = useState<Tone.PolySynth<Tone.Synth> | null>(null)

  // 初始化合成器
  useEffect(() => {
    const newSynth = new Tone.PolySynth(Tone.Synth).toDestination()
    setSynth(newSynth)
    
    return () => {
      newSynth.dispose()
    }
  }, [])

  // 更新合成器预设
  useEffect(() => {
    if (synth) {
      const presetConfig = instrumentPresets[currentPreset as keyof typeof instrumentPresets]
      if (presetConfig) {
        // 应用预设设置到合成器
        if (presetConfig.settings) {
          Object.entries(presetConfig.settings).forEach(([key, value]) => {
            if (synth && synth[key as keyof Tone.PolySynth<Tone.Synth>]) {
              const synthProp = synth[key as keyof Tone.PolySynth<Tone.Synth>]
              if (synthProp && typeof synthProp === 'object' && value && typeof value === 'object') {
                Object.assign(synthProp, value)
              }
            }
          })
        }
      }
    }
  }, [currentPreset, synth])

  const handleNoteDown = (note: string) => {
    if (!activeNotes.has(note) && synth) {
      setActiveNotes(prev => new Set([...prev, note]))
      
      // 播放音符
      synth.triggerAttack(note, undefined, 0.3)
      
      onNotePlay(note, 80) // 默认力度
    }
  }

  const handleNoteUp = (note: string) => {
    setActiveNotes(prev => {
      const newSet = new Set(prev)
      newSet.delete(note)
      return newSet
    })
    
    if (synth) {
      // 释放音符
      synth.triggerRelease(note)
    }
    
    onNoteStop(note)
  }

  const allKeys = PIANO_LAYOUT.flat()

  return (
    <div className="synth-pad">
      <div className="synth-controls">
        <div className="row gap">
          <label>
            <span>预设</span>
            <select 
              value={currentPreset} 
              onChange={(e) => setCurrentPreset(e.target.value)}
            >
              {Object.entries(instrumentPresets).map(([key, preset]) => (
                <option key={key} value={key}>
                  {preset.name}
                </option>
              ))}
            </select>
          </label>
          
          <label>
            <span>八度</span>
            <div className="row gap">
              <button 
                className="btn tiny ghost"
                onClick={() => setOctave(Math.max(1, octave - 1))}
              >
                -
              </button>
              <span className="octave-display">{octave}</span>
              <button 
                className="btn tiny ghost"
                onClick={() => setOctave(Math.min(8, octave + 1))}
              >
                +
              </button>
            </div>
          </label>

          <div className="active-notes">
            <span className="muted">活跃音符: {activeNotes.size}</span>
          </div>
        </div>
      </div>

      <div className="piano-keyboard-container">
        {/* 虚拟钢琴键盘 */}
        <div className="virtual-piano">
          <div className="white-keys">
            {allKeys.filter(key => key.type === 'white').map((key) => {
              const adjustedNote = key.note.replace(/\d/, octave.toString())
              const isActive = activeNotes.has(adjustedNote)
              
              return (
                <button
                  key={key.note}
                  className={`piano-key white ${isActive ? 'active' : ''}`}
                  onMouseDown={() => handleNoteDown(adjustedNote)}
                  onMouseUp={() => handleNoteUp(adjustedNote)}
                  onMouseLeave={() => handleNoteUp(adjustedNote)}
                >
                  <span className="key-label">{key.label}</span>
                </button>
              )
            })}
          </div>

          <div className="black-keys">
            {allKeys.filter(key => key.type === 'black').map((key, _index) => {
              const adjustedNote = key.note.replace(/\d/, octave.toString())
              const isActive = activeNotes.has(adjustedNote)
              
              return (
                <button
                  key={key.note}
                  className={`piano-key black ${isActive ? 'active' : ''}`}
                  style={{ left: `${getBlackKeyPosition(key.label)}%` }}
                  onMouseDown={() => handleNoteDown(adjustedNote)}
                  onMouseUp={() => handleNoteUp(adjustedNote)}
                  onMouseLeave={() => handleNoteUp(adjustedNote)}
                >
                  <span className="key-label">{key.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* 触控板 */}
        <div className="touch-pad">
          <div className="pad-info">
            <span className="muted">触控演奏区域 - 点击拖拽演奏</span>
          </div>
          <div 
            className="pad-surface"
            onMouseDown={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const x = (e.clientX - rect.left) / rect.width
              // Y轴可用于力度控制: (e.clientY - rect.top) / rect.height
              
              // 根据X轴位置映射音符
              const noteIndex = Math.floor(x * 12)
              const note = allKeys[noteIndex % 12]?.note.replace(/\d/, octave.toString()) || 'C4'
              
              handleNoteDown(note)
              
              const handleMouseUp = () => {
                handleNoteUp(note)
                document.removeEventListener('mouseup', handleMouseUp)
              }
              
              document.addEventListener('mouseup', handleMouseUp)
            }}
          >
            <div className="pad-grid">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="pad-line vertical" style={{ left: `${(i / 7) * 100}%` }} />
              ))}
              {[...Array(5)].map((_, i) => (
                <div key={i} className="pad-line horizontal" style={{ top: `${(i / 4) * 100}%` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 计算黑键的位置
function getBlackKeyPosition(keyLabel: string): number {
  const positions = {
    'C#': 7,
    'D#': 21,
    'F#': 42,
    'G#': 56,
    'A#': 70
  }
  return positions[keyLabel as keyof typeof positions] || 0
}