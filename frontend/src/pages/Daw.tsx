import { DAWWorkstation } from '../features/daw'

export default function Daw() {
  return (
    <div className="page">
      <div className="section-header">
        <div>
          <p className="eyebrow">专业 DAW 工作站</p>
          <h2>多视图音频创作环境</h2>
          <p className="muted">编排 · 混音 · 编辑 · 演奏 四合一工作流程</p>
        </div>
      </div>

      <DAWWorkstation />
    </div>
  )
}
