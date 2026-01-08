import React, { useState, useCallback, useEffect, useRef } from 'react'
import * as Tone from 'tone'
import { TransportControls } from './components/Transport/TransportControls'
import { TrackList } from './components/Track/TrackList'
import { Timeline } from './components/Sequencer/Timeline'
import { PianoRoll, type PianoNote } from './components/Sequencer/PianoRoll'
import { DrumMachine } from './components/Sequencer/DrumMachine'
import { SynthPad } from './components/Sequencer/SynthPad'
import { useTracks } from './components/Track/useTracks'
import { tempoPresets, instrumentPresets } from './audio/presets'
import type { DrumPattern, PatternNote } from './audio/trackManager'

type ViewMode = 'arrange' | 'edit' | 'perform'

export const DAWWorkstation: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('arrange')
  const [timelineWidth] = useState(1200)
  const [pixelsPerSecond] = useState(30)
  const [isAudioInitialized, setIsAudioInitialized] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [bpm, setBpmState] = useState(120)
  const [isRecording, setIsRecording] = useState(false)
  const [showInstrumentPicker, setShowInstrumentPicker] = useState(false)
  const [selectedInstrumentPreset, setSelectedInstrumentPreset] = useState<string>('synth')
  
  const synthRef = useRef<Tone.PolySynth | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  
  // 使用统一的轨道管理
  const {
    tracks,
    selectedTrack,
    selectedTrackId,
    selectTrack,
    createTypedTrack,
    updateTrackNotes,
    updateTrackDrumPattern
  } = useTracks()

  // 初始化共享合成器
  useEffect(() => {
    synthRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: {
        attack: 0.02,
        decay: 0.1,
        sustain: 0.3,
        release: 0.8
      }
    }).toDestination()

    return () => {
      if (synthRef.current) {
        synthRef.current.dispose()
      }
    }
  }, [])

  // 更新当前步数和时间 - 始终监听 Transport 状态
  useEffect(() => {
    let animationFrame: number
    
    const updateStep = () => {
      // 检查 Transport 是否正在播放
      const transportPlaying = Tone.Transport.state === 'started'
      
      if (transportPlaying !== isPlaying) {
        setIsPlaying(transportPlaying)
      }
      
      if (transportPlaying) {
        const beatsPerSecond = bpm / 60
        const stepsPerBeat = 4
        const step = Math.floor(Tone.Transport.seconds * beatsPerSecond * stepsPerBeat) % 16
        setCurrentStep(step)
        setCurrentTime(Tone.Transport.seconds)
      }
      animationFrame = requestAnimationFrame(updateStep)
    }
    
    animationFrame = requestAnimationFrame(updateStep)
    
    return () => {
      cancelAnimationFrame(animationFrame)
    }
  }, [isPlaying, bpm])

  // 初始化音频上下文
  const initializeAudio = useCallback(async () => {
    if (isAudioInitialized) return
    
    try {
      await Tone.start()
      Tone.Transport.bpm.value = bpm
      setIsAudioInitialized(true)
      console.log('Audio context initialized')
    } catch (error) {
      console.error('Failed to initialize audio:', error)
    }
  }, [isAudioInitialized, bpm])

  const handleSeek = (time: number) => {
    Tone.Transport.seconds = time
    setCurrentTime(time)
  }

  const handleTempoPreset = (presetKey: string) => {
    const preset = tempoPresets[presetKey as keyof typeof tempoPresets]
    if (preset) {
      Tone.Transport.bpm.value = preset.bpm
      setBpmState(preset.bpm)
    }
  }

  // 获取当前轨道的编辑数据
  const getCurrentNotes = useCallback((): PianoNote[] => {
    if (!selectedTrack || selectedTrack.config.type !== 'instrument') return []
    const pattern = selectedTrack.getCurrentPattern()
    return pattern.notes.map(n => ({
      id: n.id,
      note: n.note,
      velocity: n.velocity,
      time: n.time,
      duration: n.duration
    }))
  }, [selectedTrack])

  const getCurrentDrumPattern = useCallback((): DrumPattern => {
    if (!selectedTrack || selectedTrack.config.type !== 'drums') {
      return {
        kick: Array(16).fill(false),
        snare: Array(16).fill(false),
        hihat: Array(16).fill(false),
        openhat: Array(16).fill(false)
      }
    }
    const pattern = selectedTrack.getCurrentPattern()
    return pattern.drumPattern || {
      kick: Array(16).fill(false),
      snare: Array(16).fill(false),
      hihat: Array(16).fill(false),
      openhat: Array(16).fill(false)
    }
  }, [selectedTrack])

  // 更新音符时保存到轨道
  const handleNotesChange = useCallback((notes: PianoNote[]) => {
    if (!selectedTrackId) return
    const patternNotes: PatternNote[] = notes.map(n => ({
      id: n.id,
      note: n.note,
      velocity: n.velocity,
      time: n.time,
      duration: n.duration
    }))
    updateTrackNotes(selectedTrackId, patternNotes)
  }, [selectedTrackId, updateTrackNotes])

  // 更新鼓机 pattern 时保存到轨道
  const handleDrumPatternChange = useCallback((pattern: DrumPattern) => {
    if (!selectedTrackId) return
    updateTrackDrumPattern(selectedTrackId, pattern)
  }, [selectedTrackId, updateTrackDrumPattern])

  // SynthPad 音符播放处理
  const handleNotePlay = useCallback(async (note: string, velocity: number) => {
    if (!isAudioInitialized) {
      await initializeAudio()
    }
    
    const synth = selectedTrack?.synth || synthRef.current
    if (synth && 'triggerAttack' in synth) {
      (synth as Tone.PolySynth).triggerAttack(note, undefined, velocity / 127)
    }
  }, [isAudioInitialized, initializeAudio, selectedTrack])

  const handleNoteStop = useCallback((note: string) => {
    const synth = selectedTrack?.synth || synthRef.current
    if (synth && 'triggerRelease' in synth) {
      (synth as Tone.PolySynth).triggerRelease(note)
    }
  }, [selectedTrack])

  // 轨道点击处理 - 选择轨道并进入编辑模式
  const handleTrackSelect = useCallback((trackId: string) => {
    selectTrack(trackId)
    setViewMode('edit')
  }, [selectTrack])

  // 创建带乐器预设的轨道
  const handleCreateInstrumentTrack = useCallback(() => {
    const presetConfig = instrumentPresets[selectedInstrumentPreset as keyof typeof instrumentPresets]
    const trackName = presetConfig?.name || 'Synth'
    createTypedTrack('instrument', trackName, selectedInstrumentPreset)
    setShowInstrumentPicker(false)
  }, [createTypedTrack, selectedInstrumentPreset])

  // 根据选中轨道类型渲染对应编辑器
  const renderEditor = () => {
    if (!selectedTrack) {
      return (
        <div className="no-track-selected" style={{ padding: '40px', textAlign: 'center' }}>
          <p className="muted">👈 请在左侧选择一个轨道进行编辑</p>
          <p className="muted small">或点击上方按钮创建新轨道</p>
        </div>
      )
    }

    const trackType = selectedTrack.config.type

    switch (trackType) {
      case 'drums':
        return (
          <DrumMachine
            isPlaying={isPlaying}
            bpm={bpm}
            currentStep={currentStep}
            pattern={getCurrentDrumPattern()}
            onPatternChange={handleDrumPatternChange}
          />
        )
      case 'instrument':
        return (
          <div className="instrument-editor">
            <div className="editor-info" style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div>
                <span className="muted">正在编辑: </span>
                <strong style={{ color: selectedTrack.config.color }}>{selectedTrack.config.name}</strong>
              </div>
              <button 
                className={`btn small ${isRecording ? 'danger' : 'outline'}`}
                onClick={() => setIsRecording(!isRecording)}
              >
                {isRecording ? '⏹️ 停止录制' : '⏺️ 键盘录制'}
              </button>
              {isRecording && (
                <span className="muted" style={{ fontSize: '12px' }}>
                  💡 按 A-L 键演奏并录制音符
                </span>
              )}
            </div>
            <PianoRoll
              notes={getCurrentNotes()}
              onNotesChange={handleNotesChange}
              timeRange={[0, 8]}
              bpm={bpm}
              isRecording={isRecording}
              externalSynth={selectedTrack?.synth}
            />
          </div>
        )
      case 'audio':
        return (
          <div className="audio-editor" style={{ padding: '40px', textAlign: 'center' }}>
            <p className="muted">🎵 音频轨道编辑器（待实现）</p>
            <p className="muted small">可以导入和编辑音频文件</p>
          </div>
        )
      default:
        return null
    }
  }

  const renderMainView = () => {
    switch (viewMode) {
      case 'arrange':
        return (
          <div className="arrange-view">
            <div className="timeline-section">
              <Timeline
                currentTime={currentTime}
                timelineWidth={timelineWidth}
                pixelsPerSecond={pixelsPerSecond}
                onSeek={handleSeek}
              />
            </div>
            <div className="tracks-section">
              <TrackList 
                currentTime={currentTime}
                timelineWidth={timelineWidth}
                pixelsPerSecond={pixelsPerSecond}
                selectedTrackId={selectedTrackId}
                onTrackSelect={handleTrackSelect}
              />
            </div>
          </div>
        )

      case 'edit':
        return (
          <div className="edit-view">
            <div className="edit-layout" style={{ display: 'flex', gap: '16px', height: '100%' }}>
              {/* 左侧轨道选择列表 */}
              <div className="track-selector" style={{ 
                width: '200px', 
                backgroundColor: 'rgba(0,0,0,0.2)', 
                borderRadius: '8px',
                padding: '12px',
                flexShrink: 0
              }}>
                <h4 style={{ marginBottom: '12px' }}>轨道列表</h4>
                <div className="track-selector-list" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {tracks.map(track => (
                    <div 
                      key={track.config.id}
                      className={`track-selector-item ${selectedTrackId === track.config.id ? 'selected' : ''}`}
                      style={{ 
                        padding: '8px 12px',
                        borderRadius: '4px',
                        borderLeft: `4px solid ${track.config.color}`,
                        backgroundColor: selectedTrackId === track.config.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onClick={() => selectTrack(track.config.id)}
                    >
                      <span className="track-type-icon">
                        {track.config.type === 'drums' ? '🥁' : track.config.type === 'instrument' ? '🎹' : '🎵'}
                      </span>
                      <span className="track-name">{track.config.name}</span>
                    </div>
                  ))}
                </div>
                <div className="track-selector-actions" style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <button className="btn small ghost" onClick={() => setShowInstrumentPicker(!showInstrumentPicker)}>
                    + 合成器
                  </button>
                  {showInstrumentPicker && (
                    <div style={{ 
                      backgroundColor: 'rgba(0,0,0,0.3)', 
                      padding: '8px', 
                      borderRadius: '4px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      <select 
                        value={selectedInstrumentPreset}
                        onChange={(e) => setSelectedInstrumentPreset(e.target.value)}
                        style={{ width: '100%' }}
                      >
                        {Object.entries(instrumentPresets).map(([key, preset]) => (
                          <option key={key} value={key}>{preset.name}</option>
                        ))}
                      </select>
                      <button 
                        className="btn tiny primary" 
                        onClick={handleCreateInstrumentTrack}
                      >
                        确定
                      </button>
                    </div>
                  )}
                  <button className="btn small ghost" onClick={() => createTypedTrack('drums')}>
                    + 鼓机
                  </button>
                </div>
              </div>
              
              {/* 右侧编辑区域 */}
              <div className="editor-area" style={{ flex: 1, overflow: 'auto' }}>
                {renderEditor()}
              </div>
            </div>
          </div>
        )

      case 'perform':
        return (
          <div className="perform-view">
            <div className="performance-layout">
              <div className="performance-pads">
                <SynthPad
                  octave={4}
                  onNotePlay={handleNotePlay}
                  onNoteStop={handleNoteStop}
                />
              </div>
              {selectedTrack?.config.type === 'drums' && (
                <div className="performance-drums">
                  <DrumMachine
                    isPlaying={isPlaying}
                    bpm={bpm}
                    currentStep={currentStep}
                    pattern={getCurrentDrumPattern()}
                    onPatternChange={handleDrumPatternChange}
                  />
                </div>
              )}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="daw-workstation" onClick={initializeAudio}>
      {/* 音频初始化提示 */}
      {!isAudioInitialized && (
        <div className="audio-init-banner" style={{
          backgroundColor: '#2a2a4a',
          padding: '8px 16px',
          textAlign: 'center',
          borderBottom: '1px solid #4a4a6a'
        }}>
          <span style={{ marginRight: '12px' }}>🔇 点击任意位置或按钮初始化音频</span>
          <button className="btn small primary" onClick={initializeAudio}>
            初始化音频
          </button>
        </div>
      )}
      
      {/* 顶部工具栏 */}
      <div className="daw-toolbar">
        <div className="view-tabs">
          <button
            className={`btn ${viewMode === 'arrange' ? 'primary' : 'ghost'}`}
            onClick={() => setViewMode('arrange')}
          >
            📋 编曲
          </button>
          <button
            className={`btn ${viewMode === 'edit' ? 'primary' : 'ghost'}`}
            onClick={() => setViewMode('edit')}
          >
            ✏️ 编辑
          </button>
          <button
            className={`btn ${viewMode === 'perform' ? 'primary' : 'ghost'}`}
            onClick={() => setViewMode('perform')}
          >
            🎹 演奏
          </button>
        </div>
        
        <div className="toolbar-actions">
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <button className="btn outline small" onClick={() => setShowInstrumentPicker(!showInstrumentPicker)}>
              + 合成器轨道
            </button>
            {showInstrumentPicker && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '4px',
                backgroundColor: '#2a2a4a',
                border: '1px solid #4a4a6a',
                borderRadius: '4px',
                padding: '8px',
                minWidth: '200px',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <select 
                  value={selectedInstrumentPreset}
                  onChange={(e) => setSelectedInstrumentPreset(e.target.value)}
                  style={{ width: '100%' }}
                >
                  {Object.entries(instrumentPresets).map(([key, preset]) => (
                    <option key={key} value={key}>{preset.name}</option>
                  ))}
                </select>
                <button 
                  className="btn small primary" 
                  onClick={handleCreateInstrumentTrack}
                >
                  创建
                </button>
              </div>
            )}
          </div>
          <button className="btn outline small" onClick={() => createTypedTrack('drums')}>
            + 鼓机轨道
          </button>
          <select 
            className="tempo-select"
            onChange={(e) => handleTempoPreset(e.target.value)}
          >
            <option value="">速度预设</option>
            {Object.entries(tempoPresets).map(([key, preset]) => (
              <option key={key} value={key}>{preset.name} ({preset.bpm} BPM)</option>
            ))}
          </select>
        </div>
      </div>

      {/* 传输控制 */}
      <div className="daw-transport">
        <TransportControls />
      </div>

      {/* 主视图 */}
      <div className="daw-main">
        {renderMainView()}
      </div>

      {/* 底部信息栏 */}
      <div className="daw-footer">
        <span>{isAudioInitialized ? '🟢 音频已就绪' : '🔴 音频未初始化'}</span>
        <span>BPM: {bpm}</span>
        <span>时间: {currentTime.toFixed(2)}s</span>
        <span>轨道: {tracks.length}</span>
        {selectedTrack && (
          <span>
            选中: {selectedTrack.config.name} 
            ({selectedTrack.config.type === 'drums' ? '🥁' : '🎹'})
          </span>
        )}
      </div>
    </div>
  )
}

export default DAWWorkstation
