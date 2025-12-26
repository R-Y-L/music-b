// 乐器预设配置
export const instrumentPresets = {
  // 合成器类别
  synth: {
    name: 'Basic Synth',
    type: 'synth',
    settings: {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.01, decay: 0.3, sustain: 0.3, release: 0.8 }
    }
  },
  
  'synth-lead': {
    name: 'Synth Lead',
    type: 'MonoSynth',
    options: {
      oscillator: { type: 'square' },
      filter: { frequency: 8000, rolloff: -24 },
      envelope: { attack: 0.01, decay: 0.3, sustain: 0.4, release: 0.5 }
    }
  },

  'synth-bass': {
    name: 'Synth Bass',
    type: 'synth',
    settings: {
      oscillator: { type: 'square' },
      envelope: { attack: 0.01, decay: 0.15, sustain: 0.4, release: 0.3 },
      filter: { frequency: 800, type: 'lowpass' }
    }
  },

  'synth-pad': {
    name: 'Synth Pad',
    type: 'synth',
    settings: {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.8, decay: 0.5, sustain: 0.7, release: 1.5 },
      filter: { frequency: 1500, type: 'lowpass' }
    }
  },

  // AM合成器
  'am-synth': {
    name: 'AM Synth',
    type: 'amSynth',
    settings: {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.01, decay: 0.3, sustain: 0.3, release: 0.8 },
      modulation: { type: 'square' },
      modulationEnvelope: { attack: 0.5, decay: 0, sustain: 1, release: 0.5 }
    }
  },

  // FM合成器
  'fm-synth': {
    name: 'FM Synth',
    type: 'fmSynth',
    settings: {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 0.2, sustain: 0.2, release: 0.6 },
      modulation: { type: 'square' },
      modulationIndex: 10,
      modulationEnvelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.2 }
    }
  },

  // 钢琴音色
  piano: {
    name: 'Acoustic Piano',
    type: 'sampler',
    settings: {
      attack: 0.01,
      release: 1.0,
      curve: 'exponential'
    }
  },

  'electric-piano': {
    name: 'Electric Piano',
    type: 'fmSynth',
    settings: {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 0.3, sustain: 0.1, release: 0.8 },
      modulation: { type: 'sine' },
      modulationIndex: 3,
      modulationEnvelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.2 }
    }
  },

  // 器官音色
  organ: {
    name: 'Hammond Organ',
    type: 'synth',
    settings: {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 0, sustain: 1, release: 0.5 }
    }
  },

  // 弦乐音色
  strings: {
    name: 'String Section',
    type: 'synth',
    settings: {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.3, decay: 0.2, sustain: 0.8, release: 1.2 },
      filter: { frequency: 2000, type: 'lowpass' }
    }
  },

  // 贝斯音色
  bass: {
    name: 'Electric Bass',
    type: 'MonoSynth',
    options: {
      oscillator: { type: 'sawtooth' },
      filter: { frequency: 300, rolloff: -12 },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0.9, release: 0.3 }
    }
  },

  // 铜管音色
  brass: {
    name: 'Brass Section',
    type: 'amSynth',
    settings: {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.1, decay: 0.2, sustain: 0.6, release: 0.8 },
      modulation: { type: 'square' },
      modulationEnvelope: { attack: 0.2, decay: 0, sustain: 1, release: 0.1 }
    }
  },

  // 原有的pad和pluck
  pad: {
    name: 'Pad',
    type: 'PolySynth',
    options: {
      oscillator: { type: 'triangle' },
      filter: { frequency: 2000, rolloff: -24 },
      envelope: { attack: 0.5, decay: 0.3, sustain: 0.7, release: 2.0 }
    }
  },

  pluck: {
    name: 'Pluck',
    type: 'PluckSynth',
    options: {
      attackNoise: 1,
      dampening: 4000,
      resonance: 0.9
    }
  }
}

export const effectPresets = {
  reverb: {
    name: 'Reverb',
    type: 'Reverb',
    options: {
      roomSize: 0.7,
      dampening: 3000,
      wet: 0.3
    },
    defaultParams: {
      roomSize: 0.7,
      dampening: 3000,
      wet: 0.3
    }
  },
  delay: {
    name: 'Delay',
    type: 'PingPongDelay',
    options: {
      delayTime: '8n',
      feedback: 0.3,
      wet: 0.2
    },
    defaultParams: {
      delayTime: 0.25,
      feedback: 0.4,
      wet: 0.3
    }
  },
  chorus: {
    name: 'Chorus',
    type: 'Chorus',
    options: {
      frequency: 1.5,
      delayTime: 3.5,
      depth: 0.7,
      wet: 0.3
    },
    defaultParams: {
      frequency: 1.5,
      depth: 0.7,
      delayTime: 3.5,
      wet: 0.5
    }
  },
  distortion: {
    name: 'Distortion',
    type: 'Distortion',
    options: {
      distortion: 0.4,
      oversample: '4x',
      wet: 0.5
    },
    defaultParams: {
      distortion: 0.4,
      oversample: 'none'
    }
  },
  filter: {
    name: 'Filter',
    type: 'Filter',
    options: {
      frequency: 1000,
      type: 'lowpass',
      rolloff: -24
    }
  },
  compressor: {
    name: 'Compressor',
    type: 'Compressor',
    options: {
      threshold: -20,
      ratio: 4,
      attack: 0.01,
      release: 0.1
    },
    defaultParams: {
      threshold: -24,
      ratio: 4,
      attack: 0.003,
      release: 0.25
    }
  },
  eq3: {
    name: '3-Band EQ',
    type: 'eq3',
    defaultParams: {
      low: 0,
      mid: 0,
      high: 0,
      lowFrequency: 400,
      highFrequency: 2500
    }
  },
  phaser: {
    name: 'Phaser',
    type: 'phaser',
    defaultParams: {
      frequency: 0.5,
      octaves: 3,
      stages: 10,
      Q: 10,
      baseFrequency: 350
    }
  },
  bitCrusher: {
    name: 'Bit Crusher',
    type: 'bitCrusher',
    defaultParams: {
      bits: 4,
      wet: 0.5
    }
  },
  tremolo: {
    name: 'Tremolo',
    type: 'tremolo',
    defaultParams: {
      frequency: 10,
      type: 'sine',
      depth: 0.9,
      spread: 180
    }
  }
}

export const drumKitPresets = {
  electronic: {
    name: 'Electronic Kit',
    samples: {
      kick: '/samples/electronic/kick.wav',
      snare: '/samples/electronic/snare.wav',
      hihat: '/samples/electronic/hihat.wav',
      openhat: '/samples/electronic/openhat.wav',
      crash: '/samples/electronic/crash.wav',
      ride: '/samples/electronic/ride.wav'
    },
    sounds: {
      kick: { name: 'E-Kick', pitch: 36 },
      snare: { name: 'E-Snare', pitch: 38 },
      hihat: { name: 'E-Hat', pitch: 42 },
      clap: { name: 'Clap', pitch: 39 },
      perc1: { name: 'Perc 1', pitch: 44 },
      perc2: { name: 'Perc 2', pitch: 47 },
      cymbal: { name: 'Cymbal', pitch: 55 },
      fx: { name: 'FX', pitch: 56 }
    }
  },
  acoustic: {
    name: 'Acoustic Kit',
    samples: {
      kick: '/samples/acoustic/kick.wav',
      snare: '/samples/acoustic/snare.wav',
      hihat: '/samples/acoustic/hihat.wav',
      openhat: '/samples/acoustic/openhat.wav',
      crash: '/samples/acoustic/crash.wav',
      ride: '/samples/acoustic/ride.wav'
    },
    sounds: {
      kick: { name: 'Kick', pitch: 36 },
      snare: { name: 'Snare', pitch: 38 },
      hihat: { name: 'Hi-Hat', pitch: 42 },
      openhat: { name: 'Open Hat', pitch: 46 },
      crash: { name: 'Crash', pitch: 49 },
      ride: { name: 'Ride', pitch: 51 },
      tom1: { name: 'High Tom', pitch: 48 },
      tom2: { name: 'Low Tom', pitch: 45 }
    }
  },
  trap: {
    name: 'Trap Kit',
    sounds: {
      kick: { name: '808 Kick', pitch: 36 },
      snare: { name: 'Trap Snare', pitch: 38 },
      hihat: { name: 'Trap Hat', pitch: 42 },
      openhat: { name: 'Open Hat', pitch: 46 },
      clap: { name: 'Clap', pitch: 39 },
      perc: { name: 'Perc', pitch: 44 },
      rimshot: { name: 'Rimshot', pitch: 37 },
      fx: { name: 'FX', pitch: 56 }
    }
  }
}

// 鼓机预设节拍
export const drumPatterns = {
  basic: {
    name: 'Basic Beat',
    steps: 16,
    patterns: {
      kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
      snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      hihat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
      openhat: [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1]
    }
  },
  rock: {
    name: 'Rock Beat',
    steps: 16,
    patterns: {
      kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
      snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      hihat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      crash: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    }
  },
  funk: {
    name: 'Funk Beat',
    steps: 16,
    patterns: {
      kick: [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0],
      snare: [0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1],
      hihat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
      clap: [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0]
    }
  },
  house: {
    name: 'House Beat',
    steps: 16,
    patterns: {
      kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
      snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      hihat: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
      openhat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]
    }
  },
  trap: {
    name: 'Trap Beat',
    steps: 16,
    patterns: {
      kick: [1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 0, 0, 0],
      snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      hihat: [0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1],
      rimshot: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0]
    }
  }
}

// 音阶和和弦定义
export const musicTheory = {
  scales: {
    major: [0, 2, 4, 5, 7, 9, 11],
    minor: [0, 2, 3, 5, 7, 8, 10],
    pentatonic: [0, 2, 4, 7, 9],
    blues: [0, 3, 5, 6, 7, 10],
    dorian: [0, 2, 3, 5, 7, 9, 10],
    mixolydian: [0, 2, 4, 5, 7, 9, 10],
    chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
  },
  chords: {
    major: [0, 4, 7],
    minor: [0, 3, 7],
    diminished: [0, 3, 6],
    augmented: [0, 4, 8],
    major7: [0, 4, 7, 11],
    minor7: [0, 3, 7, 10],
    dominant7: [0, 4, 7, 10],
    sus2: [0, 2, 7],
    sus4: [0, 5, 7]
  },
  noteNames: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
}

// 常用节拍模板
export const tempoPresets = {
  ballad: { bpm: 70, name: '抒情' },
  pop: { bpm: 120, name: '流行' },
  rock: { bpm: 140, name: '摇滚' },
  dance: { bpm: 128, name: '舞曲' },
  hiphop: { bpm: 90, name: '嘻哈' },
  jazz: { bpm: 120, name: '爵士' },
  dubstep: { bpm: 140, name: 'Dubstep' },
  house: { bpm: 125, name: 'House' },
  techno: { bpm: 130, name: 'Techno' },
  ambient: { bpm: 80, name: '氛围' }
}