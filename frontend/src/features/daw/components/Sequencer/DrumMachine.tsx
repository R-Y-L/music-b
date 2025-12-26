import { useState } from 'react'

interface DrumPattern {
  [key: string]: boolean[]
}

interface DrumMachineProps {
  pattern: DrumPattern
  onPatternChange: (pattern: DrumPattern) => void
  onSoundTrigger?: (soundId: string) => void
  bpm: number
  isPlaying: boolean
  currentStep: number
}

const DRUM_SOUNDS = [
  { name: 'Kick', key: 'kick', color: '#ff4444' },
  { name: 'Snare', key: 'snare', color: '#44ff44' },
  { name: 'Hi-Hat', key: 'hihat', color: '#4444ff' },
  { name: 'Open Hat', key: 'openhat', color: '#ff8844' },
  { name: 'Crash', key: 'crash', color: '#ff44ff' },
  { name: 'Ride', key: 'ride', color: '#44ffff' },
  { name: 'Clap', key: 'clap', color: '#ffff44' },
  { name: 'Perc', key: 'perc', color: '#8844ff' }
]

const STEPS = 16

export const DrumMachine = ({ 
  pattern, 
  onPatternChange,
  onSoundTrigger: _onSoundTrigger,
  bpm, 
  isPlaying, 
  currentStep 
}: DrumMachineProps) => {
  const [selectedSound, setSelectedSound] = useState<string | null>(null)

  const toggleStep = (soundKey: string, stepIndex: number) => {
    const newPattern = { ...pattern }
    if (!newPattern[soundKey]) {
      newPattern[soundKey] = new Array(STEPS).fill(false)
    }
    newPattern[soundKey][stepIndex] = !newPattern[soundKey][stepIndex]
    onPatternChange(newPattern)
  }

  const clearPattern = () => {
    const newPattern: DrumPattern = {}
    DRUM_SOUNDS.forEach(sound => {
      newPattern[sound.key] = new Array(STEPS).fill(false)
    })
    onPatternChange(newPattern)
  }

  const randomizePattern = () => {
    const newPattern: DrumPattern = {}
    DRUM_SOUNDS.forEach(sound => {
      newPattern[sound.key] = new Array(STEPS).fill(false).map(() => Math.random() > 0.7)
    })
    onPatternChange(newPattern)
  }

  return (
    <div className="drum-machine">
      <div className="drum-machine-header">
        <div className="row gap">
          <h4>鼓机音序器</h4>
          <div className="row gap">
            <button className="btn small ghost" onClick={clearPattern}>
              清空
            </button>
            <button className="btn small ghost" onClick={randomizePattern}>
              随机
            </button>
          </div>
          <div className="tempo-info">
            <span className="pill">BPM {bpm}</span>
            <span className={`pill ${isPlaying ? 'active' : ''}`}>
              {isPlaying ? '播放中' : '已停止'}
            </span>
          </div>
        </div>
      </div>

      <div className="drum-grid">
        {/* 步数标题行 */}
        <div className="step-header">
          <div className="sound-label-header">声音</div>
          {[...Array(STEPS)].map((_, i) => (
            <div 
              key={i} 
              className={`step-number ${currentStep === i && isPlaying ? 'active' : ''}`}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* 每个鼓声的行 */}
        {DRUM_SOUNDS.map((sound) => (
          <div key={sound.key} className="drum-row">
            <div 
              className={`sound-label ${selectedSound === sound.key ? 'selected' : ''}`}
              style={{ borderLeft: `4px solid ${sound.color}` }}
              onClick={() => setSelectedSound(selectedSound === sound.key ? null : sound.key)}
            >
              {sound.name}
            </div>
            
            {[...Array(STEPS)].map((_, stepIndex) => {
              const isActive = pattern[sound.key]?.[stepIndex] || false
              const isCurrentStep = currentStep === stepIndex && isPlaying
              
              return (
                <button
                  key={stepIndex}
                  className={`step-button ${isActive ? 'active' : ''} ${isCurrentStep ? 'playing' : ''}`}
                  style={{ 
                    backgroundColor: isActive ? sound.color : 'transparent',
                    borderColor: sound.color
                  }}
                  onClick={() => toggleStep(sound.key, stepIndex)}
                >
                  {isActive && '●'}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      {/* 音色控制面板 */}
      {selectedSound && (
        <div className="sound-controls">
          <h5>音色控制 - {DRUM_SOUNDS.find(s => s.key === selectedSound)?.name}</h5>
          <div className="control-row">
            <label>
              <span>音量</span>
              <input type="range" min="0" max="100" defaultValue="80" />
            </label>
            <label>
              <span>音调</span>
              <input type="range" min="-12" max="12" defaultValue="0" />
            </label>
            <label>
              <span>衰减</span>
              <input type="range" min="0" max="100" defaultValue="50" />
            </label>
            <label>
              <span>失真</span>
              <input type="range" min="0" max="100" defaultValue="0" />
            </label>
          </div>
        </div>
      )}
    </div>
  )
}