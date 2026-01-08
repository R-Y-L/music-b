// DAW 模块主入口
// 该模块包含音乐创作工作站的所有组件和功能

// 主组件
export { DAWWorkstation } from './DAWWorkstation'

// 音频引擎
export { audioEngine } from './audio/engine'
export { trackManager, TrackManager, AudioTrack, type TrackConfig, type AudioClip } from './audio/trackManager'
export { instrumentPresets, effectPresets, drumPatterns, tempoPresets, drumKitPresets, musicTheory } from './audio/presets'

// 音频上下文 Provider
export { DAWAudioProvider, useDAWAudio } from './context/AudioContext'

// Hooks
export { useAudioEngine, type AudioEngineState, type Track, type Pattern, type Note, type Effect } from './hooks/useAudioEngine'

// Sequencer 组件
export { PianoRoll, type PianoNote } from './components/Sequencer/PianoRoll'
export { DrumMachine } from './components/Sequencer/DrumMachine'
export { SynthPad } from './components/Sequencer/SynthPad'
export { Timeline } from './components/Sequencer/Timeline'

// Track 组件
export { MixerChannel } from './components/Track/MixerChannel'
export { TrackHeader } from './components/Track/TrackHeader'
export { TrackLane } from './components/Track/TrackLane'
export { TrackList } from './components/Track/TrackList'
export { useTracks } from './components/Track/useTracks'

// Transport 组件
export { TransportControls } from './components/Transport/TransportControls'
export { useTransport } from './components/Transport/useTransport'

// Effects 组件
export { EffectChain, type Effect as EffectChainEffect, type EffectParameters } from './components/Effects/EffectChain'
export { EffectsRack } from './components/Effects/EffectsRack'
