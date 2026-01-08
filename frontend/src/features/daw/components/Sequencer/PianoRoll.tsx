import { useState, useCallback, useRef, useEffect } from 'react'
import * as Tone from 'tone'

export interface PianoNote {
  id: string
  note: string      // e.g., "C4", "D#5"
  velocity: number  // 0-127
  time: number      // in seconds
  duration: number  // in seconds
}

interface PianoRollProps {
  notes: PianoNote[]
  onNotesChange: (notes: PianoNote[]) => void
  timeRange: [number, number]
  noteRange?: [string, string]
  bpm?: number
  isRecording?: boolean
  onRecordNote?: (note: PianoNote) => void
  externalSynth?: Tone.PolySynth | Tone.Synth | null  // 外部合成器
}

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const OCTAVES = [2, 3, 4, 5, 6]

// 键盘映射：电脑键盘 -> 音符 (扩展范围)
const KEYBOARD_MAP: Record<string, string> = {
  // 低音区 (Z-M 行) - C3 到 B3
  'z': 'C3', 'x': 'D3', 'c': 'E3', 'v': 'F3', 'b': 'G3', 'n': 'A3', 'm': 'B3',
  // 中音区 (A-L 行) - C4 到 B4
  'a': 'C4', 'w': 'C#4', 's': 'D4', 'e': 'D#4', 'd': 'E4',
  'f': 'F4', 't': 'F#4', 'g': 'G4', 'y': 'G#4', 'h': 'A4',
  'u': 'A#4', 'j': 'B4',
  // 高音区 (K-;' 行) - C5 到 E5
  'k': 'C5', 'o': 'C#5', 'l': 'D5', 'p': 'D#5', ';': 'E5', "'": 'F5',
  // 数字行黑键 - 为低音区添加黑键
  '1': 'C#3', '2': 'D#3', '4': 'F#3', '5': 'G#3', '6': 'A#3'
}

export const PianoRoll = ({ 
  notes, 
  onNotesChange, 
  timeRange,
  bpm = 120,
  isRecording = false,
  onRecordNote,
  externalSynth
}: PianoRollProps) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set())
  const [currentPlayTime, setCurrentPlayTime] = useState(0)
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set())
  
  const synthRef = useRef<Tone.PolySynth | null>(null)
  const partRef = useRef<Tone.Part | null>(null)
  const animationRef = useRef<number | null>(null)
  const recordStartTimeRef = useRef<number>(0)
  const keyStartTimeRef = useRef<Map<string, number>>(new Map())

  // 获取当前使用的合成器 - 优先使用外部合成器
  const getActiveSynth = useCallback(() => {
    return externalSynth || synthRef.current
  }, [externalSynth])

  // 初始化备用合成器（仅当没有外部合成器时使用）
  useEffect(() => {
    synthRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle8' },
      envelope: {
        attack: 0.02,
        decay: 0.1,
        sustain: 0.3,
        release: 0.5
      }
    }).toDestination()
    
    return () => {
      if (synthRef.current) {
        synthRef.current.dispose()
      }
      if (partRef.current) {
        partRef.current.dispose()
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  // 键盘录制功能
  useEffect(() => {
    if (!isRecording) return

    // 使用 Transport 时间作为基准（如果正在播放）
    const getRecordTime = () => {
      // 如果 Transport 正在运行，使用 Transport 时间
      if (Tone.Transport.state === 'started') {
        return Tone.Transport.seconds
      }
      // 否则使用相对时间
      return Tone.now() - recordStartTimeRef.current
    }

    recordStartTimeRef.current = Tone.now()

    const handleKeyDown = async (e: KeyboardEvent) => {
      const note = KEYBOARD_MAP[e.key.toLowerCase()]
      if (!note || activeKeys.has(note)) return

      // 确保音频上下文已启动
      if (Tone.context.state !== 'running') {
        await Tone.start()
      }

      setActiveKeys(prev => new Set(prev).add(note))
      // 记录按下时的时间位置
      const currentRecordTime = getRecordTime()
      keyStartTimeRef.current.set(note, currentRecordTime)

      // 播放音符 - 使用外部合成器或备用合成器
      const synth = getActiveSynth()
      if (synth && 'triggerAttack' in synth) {
        (synth as Tone.PolySynth).triggerAttack(note, undefined, 0.8)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      const note = KEYBOARD_MAP[e.key.toLowerCase()]
      if (!note) return

      setActiveKeys(prev => {
        const newSet = new Set(prev)
        newSet.delete(note)
        return newSet
      })

      // 停止音符 - 使用外部合成器或备用合成器
      const synth = getActiveSynth()
      if (synth && 'triggerRelease' in synth) {
        (synth as Tone.PolySynth).triggerRelease(note)
      }

      // 记录音符 - 使用实际的播放时间位置
      const startTime = keyStartTimeRef.current.get(note)
      if (startTime !== undefined) {
        const endTime = getRecordTime()
        const duration = Math.max(0.1, endTime - startTime)
        
        // 量化时间到最近的16分音符
        const beatsPerSecond = bpm / 60
        const sixteenthNoteSeconds = 1 / (beatsPerSecond * 4)
        const quantizedTime = Math.round(startTime / sixteenthNoteSeconds) * sixteenthNoteSeconds
        const quantizedDuration = Math.max(sixteenthNoteSeconds, Math.round(duration / sixteenthNoteSeconds) * sixteenthNoteSeconds)
        
        // 确保时间在有效范围内
        const patternLength = timeRange[1] - timeRange[0]
        const finalTime = quantizedTime % patternLength
        
        const newNote: PianoNote = {
          id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          note,
          velocity: 100,
          time: Math.max(0, finalTime),
          duration: quantizedDuration
        }
        
        onNotesChange([...notes, newNote])
        if (onRecordNote) {
          onRecordNote(newNote)
        }
        
        keyStartTimeRef.current.delete(note)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [isRecording, activeKeys, notes, onNotesChange, onRecordNote, timeRange, bpm, getActiveSynth])

  // Generate all notes in range
  const allNotes = OCTAVES.flatMap(octave => 
    NOTE_NAMES.map(name => `${name}${octave}`)
  ).reverse()

  const gridWidth = 800
  const gridHeight = allNotes.length * 20
  const steps = 16
  const stepDuration = (timeRange[1] - timeRange[0]) / steps

  // 点击单元格添加/删除音符
  const handleCellClick = useCallback(async (noteIndex: number, timeStep: number) => {
    // 确保音频上下文已启动
    if (Tone.context.state !== 'running') {
      await Tone.start()
    }
    
    const note = allNotes[noteIndex]
    const time = timeRange[0] + (timeStep * stepDuration)
    
    // 检查是否已有音符
    const existingNoteIndex = notes.findIndex(n => 
      n.note === note && Math.abs(n.time - time) < 0.05
    )

    if (existingNoteIndex >= 0) {
      // 删除现有音符
      const newNotes = notes.filter((_, i) => i !== existingNoteIndex)
      onNotesChange(newNotes)
    } else {
      // 添加新音符并预览
      const newNote: PianoNote = {
        id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        note,
        velocity: 100,
        time,
        duration: stepDuration
      }
      
      // 播放预览 - 使用外部合成器或备用合成器
      const synth = getActiveSynth()
      if (synth && 'triggerAttackRelease' in synth) {
        (synth as Tone.PolySynth).triggerAttackRelease(note, '16n', undefined, 0.7)
      }
      
      onNotesChange([...notes, newNote])
    }
  }, [allNotes, notes, onNotesChange, timeRange, stepDuration, getActiveSynth])

  const isBlackKey = (note: string) => note.includes('#')

  // 播放所有音符
  const playAllNotes = useCallback(async () => {
    if (notes.length === 0) return
    
    // 确保音频上下文已启动
    if (Tone.context.state !== 'running') {
      await Tone.start()
    }
    
    // 清理之前的Part
    if (partRef.current) {
      partRef.current.dispose()
    }
    
    // 设置BPM
    Tone.Transport.bpm.value = bpm
    
    // 创建音符事件数组
    const noteEvents = notes.map(n => ({
      time: n.time,
      note: n.note,
      duration: n.duration,
      velocity: n.velocity / 127
    }))
    
    // 使用Tone.Part进行精确调度
    const synth = getActiveSynth()
    partRef.current = new Tone.Part((time, event) => {
      if (synth && 'triggerAttackRelease' in synth) {
        (synth as Tone.PolySynth).triggerAttackRelease(
          event.note, 
          event.duration, 
          time, 
          event.velocity
        )
      }
    }, noteEvents).start(0)
    
    // 设置循环点
    Tone.Transport.loop = true
    Tone.Transport.loopStart = timeRange[0]
    Tone.Transport.loopEnd = timeRange[1]
    
    // 启动Transport
    Tone.Transport.start()
    setIsPlaying(true)
    
    // 更新播放位置的动画
    const updatePlayhead = () => {
      setCurrentPlayTime(Tone.Transport.seconds)
      animationRef.current = requestAnimationFrame(updatePlayhead)
    }
    updatePlayhead()
  }, [notes, bpm, timeRange, getActiveSynth])

  // 停止播放
  const stopPlayback = useCallback(() => {
    Tone.Transport.stop()
    Tone.Transport.position = 0
    setIsPlaying(false)
    setCurrentPlayTime(0)
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    
    if (partRef.current) {
      partRef.current.dispose()
      partRef.current = null
    }
  }, [])

  // 切换播放状态
  const togglePlayback = useCallback(() => {
    if (isPlaying) {
      stopPlayback()
    } else {
      playAllNotes()
    }
  }, [isPlaying, playAllNotes, stopPlayback])

  // 清空音符
  const clearNotes = useCallback(() => {
    stopPlayback()
    onNotesChange([])
  }, [onNotesChange, stopPlayback])

  // 点击音符块播放预览
  const handleNoteBlockClick = useCallback(async (e: React.MouseEvent, noteData: PianoNote) => {
    e.stopPropagation()
    
    if (Tone.context.state !== 'running') {
      await Tone.start()
    }
    
    const synth = getActiveSynth()
    if (synth && 'triggerAttackRelease' in synth) {
      (synth as Tone.PolySynth).triggerAttackRelease(noteData.note, '8n', undefined, noteData.velocity / 127)
    }
    
    // 切换选中状态
    setSelectedNotes(prev => {
      const newSet = new Set(prev)
      if (newSet.has(noteData.id)) {
        newSet.delete(noteData.id)
      } else {
        newSet.add(noteData.id)
      }
      return newSet
    })
  }, [getActiveSynth])

  // 点击钢琴键播放预览
  const handleKeyClick = useCallback(async (note: string) => {
    if (Tone.context.state !== 'running') {
      await Tone.start()
    }
    const synth = getActiveSynth()
    if (synth && 'triggerAttackRelease' in synth) {
      (synth as Tone.PolySynth).triggerAttackRelease(note, '8n', undefined, 0.7)
    }
  }, [getActiveSynth])

  // 计算播放头位置
  const playheadPosition = ((currentPlayTime - timeRange[0]) / (timeRange[1] - timeRange[0])) * 100

  // 计算时间刻度标记
  const beatsPerSecond = bpm / 60
  const totalBeats = (timeRange[1] - timeRange[0]) * beatsPerSecond
  const measures = Math.ceil(totalBeats / 4) // 假设 4/4 拍

  return (
    <div className="piano-roll">
      <div className="piano-roll-header">
        <div className="row gap" style={{ justifyContent: 'space-between', width: '100%' }}>
          <div className="row gap">
            <button 
              className={`btn small ${isPlaying ? 'primary' : 'outline'}`}
              onClick={togglePlayback}
            >
              {isPlaying ? '⏸️ 暂停' : '▶️ 播放'}
            </button>
            <button 
              className="btn small ghost"
              onClick={clearNotes}
            >
              清空
            </button>
          </div>
          <div className="row gap">
            <span className="muted">🎵 {notes.length} 音符</span>
            <span className="muted">⏱️ {bpm} BPM</span>
            <span className="muted">📏 {measures} 小节</span>
            {isRecording && (
              <span style={{ color: '#ff4444', animation: 'pulse 1s infinite' }}>
                🔴 录制中 - Z-M: C3-B3 | A-J: C4-B4 | K-': C5-F5
              </span>
            )}
            {activeKeys.size > 0 && (
              <span style={{ color: '#4fd1c5' }}>
                🎹 {Array.from(activeKeys).join(', ')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 时间刻度轴 */}
      <div className="piano-roll-timeline" style={{ 
        display: 'flex', 
        marginLeft: '60px',
        height: '24px',
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderBottom: '1px solid rgba(255,255,255,0.2)'
      }}>
        {[...Array(steps)].map((_, i) => {
          const beatInMeasure = i % 4
          const measureNum = Math.floor(i / 4) + 1
          const isFirstBeat = beatInMeasure === 0
          
          return (
            <div 
              key={i} 
              style={{ 
                flex: 1, 
                borderRight: isFirstBeat ? '2px solid rgba(255,255,255,0.4)' : '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                color: isFirstBeat ? '#fff' : 'rgba(255,255,255,0.5)'
              }}
            >
              {isFirstBeat ? `${measureNum}` : beatInMeasure + 1}
            </div>
          )
        })}
      </div>

      <div className="piano-roll-grid">
        {/* 钢琴键盘 */}
        <div className="piano-keyboard">
          {allNotes.map((note) => (
            <div 
              key={note}
              className={`piano-key ${isBlackKey(note) ? 'black' : 'white'}`}
              style={{ height: '20px', cursor: 'pointer' }}
              onClick={() => handleKeyClick(note)}
            >
              <span className="note-name">{note}</span>
            </div>
          ))}
        </div>

        {/* 音符网格 */}
        <div className="note-grid" style={{ width: gridWidth, height: gridHeight, position: 'relative' }}>
          {/* 播放头 */}
          {isPlaying && playheadPosition >= 0 && playheadPosition <= 100 && (
            <div 
              className="playhead"
              style={{ 
                left: `${playheadPosition}%`,
                position: 'absolute',
                top: 0,
                bottom: 0,
                width: '2px',
                backgroundColor: '#ff4444',
                zIndex: 100,
                pointerEvents: 'none'
              }}
            />
          )}
          
          {/* 时间网格线 */}
          {[...Array(steps + 1)].map((_, i) => (
            <div 
              key={i}
              className="time-grid-line"
              style={{ 
                left: `${(i / steps) * 100}%`,
                position: 'absolute',
                top: 0,
                bottom: 0,
                width: i % 4 === 0 ? '2px' : '1px',
                backgroundColor: i % 4 === 0 ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                pointerEvents: 'none'
              }}
            />
          ))}

          {/* 音符网格单元格 */}
          {allNotes.map((note, noteIndex) => (
            <div 
              key={note} 
              className="note-row" 
              style={{ 
                position: 'absolute',
                top: `${noteIndex * 20}px`,
                left: 0,
                right: 0,
                height: '20px',
                display: 'flex',
                zIndex: 20
              }}
            >
              {[...Array(steps)].map((_, timeIndex) => (
                <div 
                  key={timeIndex}
                  className={`note-cell ${isBlackKey(note) ? 'black-key-row' : ''}`}
                  style={{ 
                    flex: 1,
                    height: '100%',
                    borderRight: '1px solid rgba(255,255,255,0.05)',
                    backgroundColor: isBlackKey(note) ? 'rgba(0,0,0,0.3)' : 'transparent',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCellClick(noteIndex, timeIndex)
                  }}
                />
              ))}
            </div>
          ))}

          {/* 现有音符块 */}
          {notes.map((noteData) => {
            const noteIndex = allNotes.indexOf(noteData.note)
            if (noteIndex === -1) return null
            
            const leftPercent = ((noteData.time - timeRange[0]) / (timeRange[1] - timeRange[0])) * 100
            const widthPercent = (noteData.duration / (timeRange[1] - timeRange[0])) * 100

            return (
              <div 
                key={noteData.id}
                className={`note-block ${selectedNotes.has(noteData.id) ? 'selected' : ''}`}
                style={{ 
                  position: 'absolute',
                  left: `${leftPercent}%`,
                  top: `${noteIndex * 20 + 2}px`,
                  width: `${Math.max(widthPercent, 1)}%`,
                  height: '16px',
                  backgroundColor: isBlackKey(noteData.note) ? '#ff7b5f' : '#4fd1c5',
                  opacity: 0.6 + (noteData.velocity / 127) * 0.4,
                  borderRadius: '3px',
                  cursor: 'pointer',
                  border: selectedNotes.has(noteData.id) ? '2px solid #fff' : 'none',
                  boxSizing: 'border-box',
                  zIndex: 5,
                  pointerEvents: 'none'
                }}
                onClick={(e) => handleNoteBlockClick(e, noteData)}
              >
                <div className="note-label" style={{ 
                  fontSize: '10px', 
                  padding: '2px 4px',
                  color: '#000',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden'
                }}>
                  {noteData.note}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// 导出Note类型以便其他组件使用
export type { PianoNote as Note }