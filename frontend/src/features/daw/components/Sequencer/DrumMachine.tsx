import { useState, useEffect } from 'react'
import * as Tone from 'tone'

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
  const [drumSynths, setDrumSynths] = useState<Record<string, Tone.MembraneSynth | Tone.NoiseSynth | Tone.MetalSynth | Tone.Synth>>({})

  // 初始化鼓声合成器
  useEffect(() => {
    const synths: Record<string, Tone.MembraneSynth | Tone.NoiseSynth | Tone.MetalSynth | Tone.Synth> = {}
    
    // 为每个鼓声创建对应的合成器
    DRUM_SOUNDS.forEach(sound => {
      switch (sound.key) {
        case 'kick':
          synths[sound.key] = new Tone.MembraneSynth({
            pitchDecay: 0.05,
            octaves: 4,
            oscillator: { type: "sine" }
          }).toDestination()
          break
        case 'snare':
          synths[sound.key] = new Tone.NoiseSynth({
            noise: { type: "white" },
            envelope: { attack: 0.001, decay: 0.2, sustain: 0 }
          }).toDestination()
          break
        case 'hihat':
        case 'openhat': {
          const hihat = new Tone.MetalSynth({
            envelope: { attack: 0.001, decay: 0.1, release: 0.1 },
            harmonicity: 5.1,
            modulationIndex: 32,
            resonance: 400,
            octaves: 1.5
          }).toDestination()
          synths[sound.key] = hihat
          break
        }
        case 'crash': {
          const crash = new Tone.MetalSynth({
            envelope: { attack: 0.001, decay: 0.5, release: 1 },
            harmonicity: 5.1,
            modulationIndex: 64,
            resonance: 2000,
            octaves: 1.5
          }).toDestination()
          synths[sound.key] = crash
          break
        }
        case 'ride': {
          const ride = new Tone.MetalSynth({
            envelope: { attack: 0.001, decay: 0.3, release: 0.5 },
            harmonicity: 3.1,
            modulationIndex: 48,
            resonance: 3000,
            octaves: 1
          }).toDestination()
          synths[sound.key] = ride
          break
        }
        case 'clap':
          synths[sound.key] = new Tone.NoiseSynth({
            noise: { type: "white" },
            envelope: { attack: 0.01, decay: 0.1, sustain: 0 }
          }).toDestination()
          break
        case 'perc':
          synths[sound.key] = new Tone.Synth({
            oscillator: { type: "square8" },
            envelope: { attack: 0.001, decay: 0.2, sustain: 0.2, release: 0.5 }
          }).toDestination()
          break
        default:
          synths[sound.key] = new Tone.MembraneSynth().toDestination()
      }
    })
    
    setDrumSynths(synths)
    
    return () => {
      Object.values(synths).forEach((synth) => synth.dispose())
    }
  }, [])

  // 触发鼓声的辅助函数
  const playDrumSound = (synth: Tone.MembraneSynth | Tone.NoiseSynth | Tone.MetalSynth | Tone.Synth) => {
    if (synth instanceof Tone.NoiseSynth) {
      synth.triggerAttackRelease("8n")
    } else if (synth instanceof Tone.MetalSynth) {
      synth.triggerAttackRelease("C2", "8n")
    } else {
      synth.triggerAttackRelease("C2", "8n")
    }
  }

  // 当前步骤变化时触发声音
  useEffect(() => {
    if (isPlaying && Tone.context.state === 'running') {
      DRUM_SOUNDS.forEach(sound => {
        if (pattern[sound.key]?.[currentStep]) {
          const synth = drumSynths[sound.key]
          if (synth) {
            playDrumSound(synth)
          }
        }
      })
    }
  }, [currentStep, isPlaying, pattern, drumSynths])

  const toggleStep = async (soundKey: string, stepIndex: number) => {
    // 确保音频上下文已启动
    if (Tone.context.state !== 'running') {
      await Tone.start()
    }
    
    const newPattern = { ...pattern }
    if (!newPattern[soundKey]) {
      newPattern[soundKey] = new Array(STEPS).fill(false)
    }
    newPattern[soundKey][stepIndex] = !newPattern[soundKey][stepIndex]
    onPatternChange(newPattern)
  }

  // 触发单个鼓声
  const triggerSound = async (soundKey: string) => {
    // 确保音频上下文已启动
    if (Tone.context.state !== 'running') {
      await Tone.start()
    }
    
    const synth = drumSynths[soundKey]
    if (synth) {
      playDrumSound(synth)
    }
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
                  onClick={() => {
                    toggleStep(sound.key, stepIndex)
                    if (!isActive) {
                      triggerSound(sound.key)
                    }
                  }}
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