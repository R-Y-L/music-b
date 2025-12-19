import type { FormEvent } from 'react'
import { useState } from 'react'

const genres = ['Synthwave', 'Ambient', 'Techno', 'Cinematic', 'Pop', 'Indie']

export default function PublishWork() {
  const [title, setTitle] = useState('')
  const [bpm, setBpm] = useState(120)
  const [genre, setGenre] = useState(genres[0])
  const [desc, setDesc] = useState('')

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    alert(`已提交：${title || '未命名'} · ${genre} · BPM ${bpm}`)
  }

  return (
    <div className="page">
      <div className="section-header">
        <div>
          <p className="eyebrow">发布与管理</p>
          <h2>创建新作品</h2>
          <p className="muted">前端表单演示，后续可对接上传、审核与版权接口。</p>
        </div>
      </div>

      <form className="panel form" onSubmit={handleSubmit}>
        <label>
          <span>作品标题</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="输入标题" required />
        </label>

        <label>
          <span>风格</span>
          <select value={genre} onChange={(e) => setGenre(e.target.value)}>
            {genres.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>

        <div className="grid two">
          <label>
            <span>BPM</span>
            <input type="number" value={bpm} onChange={(e) => setBpm(Number(e.target.value))} />
          </label>
          <label>
            <span>版权标签</span>
            <input placeholder="如: CC BY-NC / 全权自有" />
          </label>
        </div>

        <label>
          <span>简介</span>
          <textarea
            rows={4}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="写下作品亮点、制作要点或合作需求"
          />
        </label>

        <div className="grid two">
          <label>
            <span>上传音频 (Demo)</span>
            <input type="file" accept="audio/*" />
          </label>
          <label>
            <span>上传封面</span>
            <input type="file" accept="image/*" />
          </label>
        </div>

        <div className="row gap">
          <button type="submit" className="btn primary">
            提交发布
          </button>
          <button type="button" className="btn ghost">
            保存草稿
          </button>
        </div>
      </form>
    </div>
  )
}
