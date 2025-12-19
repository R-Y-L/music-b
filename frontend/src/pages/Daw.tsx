const tracks = [
  { name: 'Drums', color: '#30c48d', clips: [40, 50, 65, 45] },
  { name: 'Bass', color: '#1f9bff', clips: [55, 70, 30] },
  { name: 'Lead', color: '#ff7b5f', clips: [60, 40, 50] },
  { name: 'Pads', color: '#b58cff', clips: [80, 55] },
]

export default function Daw() {
  return (
    <div className="page">
      <div className="section-header">
        <div>
          <p className="eyebrow">DAW 演示</p>
          <h2>时间线 · 轨道 · 片段</h2>
          <p className="muted">使用 Web Audio / Tone.js 可无缝扩展录制、回放、效果器、导出。</p>
        </div>
        <div className="row gap">
          <button className="btn outline small">录制</button>
          <button className="btn primary small">导出 WAV</button>
        </div>
      </div>

      <div className="panel daw">
        <div className="timeline">
          {[...Array(8)].map((_, index) => (
            <span key={index}>{index + 1}</span>
          ))}
        </div>

        <div className="tracks">
          {tracks.map((track) => (
            <div key={track.name} className="track-row">
              <div className="track-name">{track.name}</div>
              <div className="track-lane">
                {track.clips.map((width, idx) => (
                  <div key={idx} className="clip" style={{ width: `${width}%`, backgroundColor: track.color }}>
                    {track.name} {idx + 1}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
