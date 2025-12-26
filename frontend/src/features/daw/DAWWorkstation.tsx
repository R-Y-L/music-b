import React, { useState } from 'react'
import { TransportControls } from './components/Transport/TransportControls'
import { TrackList } from './components/Track/TrackList'
import { Timeline } from './components/Sequencer/Timeline'
import { PianoRoll } from './components/Sequencer/PianoRoll'
import { DrumMachine } from './components/Sequencer/DrumMachine'
import { SynthPad } from './components/Sequencer/SynthPad'
import { EffectChain } from './components/Effects/EffectChain'
import { useAudioEngine } from './hooks/useAudioEngine'
import { tempoPresets } from './audio/presets'

type ViewMode = 'arrange' | 'mix' | 'edit' | 'perform'
type EditorMode = 'piano' | 'drum' | 'synth'

interface Note {
  note: string
  velocity: number
  time: number
  duration: number
}

interface DrumPattern {
  [key: string]: boolean[]
}

export const DAWWorkstation: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('arrange')
  const [editorMode, setEditorMode] = useState<EditorMode>('piano')
  const [timelineWidth] = useState(1200)
  const [pixelsPerSecond] = useState(30)
  const [notes, setNotes] = useState<Note[]>([])
  const [drumPattern, setDrumPattern] = useState<DrumPattern>({
    kick: Array(16).fill(false),
    snare: Array(16).fill(false),
    hihat: Array(16).fill(false),
    openhat: Array(16).fill(false)
  })
  
  const audioEngine = useAudioEngine()

  const handleSeek = (time: number) => {
    audioEngine.seekTo(time)
  }

  const handleTrackCreate = () => {
    const trackId = audioEngine.createTrack('instrument', 'synth')
    console.log('Created track:', trackId)
  }

  const handleEffectAdd = (trackId: string, effectType: string) => {
    const effectId = audioEngine.addEffect(trackId, effectType)
    console.log('Added effect:', effectId, 'to track:', trackId)
  }

  const handleTempoPreset = (presetKey: string) => {
    const preset = tempoPresets[presetKey as keyof typeof tempoPresets]
    if (preset) {
      audioEngine.setBPM(preset.bpm)
    }
  }

  const selectedTrack = audioEngine.tracks.find(track => track.id === audioEngine.selectedTrackId)

  const renderMainView = () => {
    switch (viewMode) {
      case 'arrange':
        return (
          <div className="arrange-view">
            <div className="timeline-section">
              <Timeline
                currentTime={audioEngine.currentTime}
                timelineWidth={timelineWidth}
                pixelsPerSecond={pixelsPerSecond}
                onSeek={handleSeek}
              />
            </div>
            <div className="tracks-section">
              <TrackList 
                currentTime={audioEngine.currentTime}
                timelineWidth={timelineWidth}
                pixelsPerSecond={pixelsPerSecond}
              />
            </div>
          </div>
        )

      case 'mix':
        return (
          <div className="mix-view">
            <div className="mixer-board">
              {audioEngine.tracks.map(track => (
                <div key={track.id} className="mixer-channel-wrapper">
                  <div className="channel-header">
                    <h4>{track.name}</h4>
                  </div>
                  <div className="channel-controls">
                    <div className="volume-control">
                      <label>Volume</label>
                      <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.01"
                        value={track.volume}
                        onChange={(e) => audioEngine.updateTrack(track.id, { volume: parseFloat(e.target.value) })}
                      />
                    </div>
                    <div className="pan-control">
                      <label>Pan</label>
                      <input 
                        type="range" 
                        min="-1" 
                        max="1" 
                        step="0.01"
                        value={track.pan}
                        onChange={(e) => audioEngine.updateTrack(track.id, { pan: parseFloat(e.target.value) })}
                      />
                    </div>
                    <div className="channel-buttons">
                      <button 
                        className={`btn tiny ${track.mute ? 'danger' : 'ghost'}`}
                        onClick={() => audioEngine.updateTrack(track.id, { mute: !track.mute })}
                      >
                        M
                      </button>
                      <button 
                        className={`btn tiny ${track.solo ? 'primary' : 'ghost'}`}
                        onClick={() => audioEngine.updateTrack(track.id, { solo: !track.solo })}
                      >
                        S
                      </button>
                    </div>
                  </div>
                  <EffectChain
                    trackId={track.id}
                    effects={track.effects}
                    onEffectAdd={(effectType: string) => handleEffectAdd(track.id, effectType)}
                    onEffectRemove={(effectId: string) => audioEngine.removeEffect(track.id, effectId)}
                    onEffectUpdate={(effectId: string, params: Record<string, number | string | boolean>) => {
                      audioEngine.updateEffect(track.id, effectId, params)
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )

      case 'edit':
        return (
          <div className="edit-view">
            <div className="editor-tabs">
              <button
                className={`btn ${editorMode === 'piano' ? 'primary' : 'ghost'}`}
                onClick={() => setEditorMode('piano')}
              >
                🎹 Piano Roll
              </button>
              <button
                className={`btn ${editorMode === 'drum' ? 'primary' : 'ghost'}`}
                onClick={() => setEditorMode('drum')}
              >
                🥁 Drum Machine
              </button>
              <button
                className={`btn ${editorMode === 'synth' ? 'primary' : 'ghost'}`}
                onClick={() => setEditorMode('synth')}
              >
                🎛️ Synth Pad
              </button>
            </div>

            {editorMode === 'piano' && (
              <PianoRoll
                notes={notes}
                onNotesChange={setNotes}
                timeRange={[0, 16]}
                noteRange={['C2', 'C6']}
              />
            )}

            {editorMode === 'drum' && (
              <DrumMachine
                isPlaying={audioEngine.isPlaying}
                bpm={audioEngine.bpm}
                currentStep={Math.floor(audioEngine.currentTime * (audioEngine.bpm / 60) * 4) % 16}
                pattern={drumPattern}
                onPatternChange={setDrumPattern}
              />
            )}

            {editorMode === 'synth' && (
              <SynthPad
                octave={4}
                onNotePlay={(pitch: string, velocity: number) => {
                  console.log('Playing note:', pitch, 'velocity:', velocity)
                }}
                onNoteStop={(pitch: string) => {
                  console.log('Stopping note:', pitch)
                }}
              />
            )}
          </div>
        )

      case 'perform':
        return (
          <div className="perform-view">
            <div className="performance-layout">
              <div className="performance-pads">
                <SynthPad
                  octave={4}
                  onNotePlay={(pitch: string, velocity: number) => {
                    console.log('Performance note:', pitch, velocity)
                  }}
                  onNoteStop={(pitch: string) => {
                    console.log('Performance note stop:', pitch)
                  }}
                />
              </div>
              <div className="performance-drums">
                <DrumMachine
                  isPlaying={audioEngine.isPlaying}
                  bpm={audioEngine.bpm}
                  currentStep={Math.floor(audioEngine.currentTime * (audioEngine.bpm / 60) * 4) % 16}
                  pattern={drumPattern}
                  onPatternChange={setDrumPattern}
                />
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="daw-workstation">
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
            className={`btn ${viewMode === 'mix' ? 'primary' : 'ghost'}`}
            onClick={() => setViewMode('mix')}
          >
            🎚️ 混音
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
          <button className="btn primary" onClick={handleTrackCreate}>
            ➕ 新建轨道
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
        <span>BPM: {audioEngine.bpm}</span>
        <span>时间: {audioEngine.currentTime.toFixed(2)}s</span>
        <span>轨道: {audioEngine.tracks.length}</span>
        {selectedTrack && <span>选中: {selectedTrack.name}</span>}
      </div>
    </div>
  )
}

export default DAWWorkstation
