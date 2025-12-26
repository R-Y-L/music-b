import { useState } from 'react'

interface Note {
  note: string
  velocity: number
  time: number
  duration: number
}

interface PianoRollProps {
  notes: Note[]
  onNotesChange: (notes: Note[]) => void
  timeRange: [number, number]
  noteRange: [string, string]
}

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const OCTAVES = [2, 3, 4, 5, 6, 7]

export const PianoRoll = ({ 
  notes, 
  onNotesChange, 
  timeRange, 
  noteRange: _noteRange 
}: PianoRollProps) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedNotes, setSelectedNotes] = useState<Set<number>>(new Set())

  // Generate all notes in range
  const allNotes = OCTAVES.flatMap(octave => 
    NOTE_NAMES.map(name => `${name}${octave}`)
  ).reverse()

  const gridWidth = 800
  const gridHeight = allNotes.length * 20
  // 时间步长计算时使用：(timeRange[1] - timeRange[0]) / 16

  const handleCellClick = (noteIndex: number, timeStep: number) => {
    const note = allNotes[noteIndex]
    const time = timeRange[0] + (timeStep * (timeRange[1] - timeRange[0]) / 16)
    
    // 检查是否已有音符
    const existingNoteIndex = notes.findIndex(n => 
      n.note === note && Math.abs(n.time - time) < 0.1
    )

    if (existingNoteIndex >= 0) {
      // 删除现有音符
      const newNotes = notes.filter((_, i) => i !== existingNoteIndex)
      onNotesChange(newNotes)
    } else {
      // 添加新音符
      const newNote: Note = {
        note,
        velocity: 80,
        time,
        duration: 0.25 // 四分音符
      }
      onNotesChange([...notes, newNote])
    }
  }

  const isBlackKey = (note: string) => {
    return note.includes('#')
  }

  return (
    <div className="piano-roll">
      <div className="piano-roll-header">
        <div className="row gap">
          <button 
            className={`btn small ${isPlaying ? 'primary' : 'outline'}`}
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? '⏸️ 暂停' : '▶️ 播放'}
          </button>
          <button 
            className="btn small ghost"
            onClick={() => onNotesChange([])}
          >
            清空
          </button>
          <span className="muted">音符数: {notes.length}</span>
        </div>
      </div>

      <div className="piano-roll-grid">
        {/* 钢琴键盘 */}
        <div className="piano-keyboard">
          {allNotes.map((note, _index) => (
            <div 
              key={note}
              className={`piano-key ${isBlackKey(note) ? 'black' : 'white'}`}
              style={{ height: '20px' }}
            >
              <span className="note-name">{note}</span>
            </div>
          ))}
        </div>

        {/* 音符网格 */}
        <div className="note-grid" style={{ width: gridWidth, height: gridHeight }}>
          {/* 时间网格线 */}
          {[...Array(17)].map((_, i) => (
            <div 
              key={i}
              className="time-grid-line"
              style={{ left: `${(i / 16) * 100}%` }}
            />
          ))}

          {/* 音符网格单元格 */}
          {allNotes.map((note, noteIndex) => (
            <div key={note} className="note-row" style={{ top: `${noteIndex * 20}px` }}>
              {[...Array(16)].map((_, timeIndex) => (
                <div 
                  key={timeIndex}
                  className={`note-cell ${isBlackKey(note) ? 'black-key-row' : ''}`}
                  style={{ 
                    left: `${(timeIndex / 16) * 100}%`,
                    width: `${100 / 16}%`
                  }}
                  onClick={() => handleCellClick(noteIndex, timeIndex)}
                />
              ))}
            </div>
          ))}

          {/* 现有音符 */}
          {notes.map((note, index) => {
            const noteIndex = allNotes.indexOf(note.note)
            const leftPercent = ((note.time - timeRange[0]) / (timeRange[1] - timeRange[0])) * 100
            const widthPercent = (note.duration / (timeRange[1] - timeRange[0])) * 100

            return (
              <div 
                key={index}
                className={`note-block ${selectedNotes.has(index) ? 'selected' : ''}`}
                style={{ 
                  left: `${leftPercent}%`,
                  top: `${noteIndex * 20 + 2}px`,
                  width: `${widthPercent}%`,
                  height: '16px',
                  backgroundColor: isBlackKey(note.note) ? '#ff7b5f' : '#4fd1c5',
                  opacity: note.velocity / 127
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  const newSelected = new Set(selectedNotes)
                  if (newSelected.has(index)) {
                    newSelected.delete(index)
                  } else {
                    newSelected.add(index)
                  }
                  setSelectedNotes(newSelected)
                }}
              >
                <div className="note-label">{note.note}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}