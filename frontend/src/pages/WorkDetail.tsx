import { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { mockWorks } from '../mock/data'
import { useAppStore } from '../store/useAppStore'

export default function WorkDetail() {
  const { id } = useParams()
  const { likes, toggleLike } = useAppStore()
  const work = useMemo(() => mockWorks.find((item) => item.id === id) ?? mockWorks[0], [id])
  const liked = likes[work.id]

  return (
    <div className="page">
      <div className="section-header">
        <div>
          <p className="eyebrow">作品详情</p>
          <h2>{work.title}</h2>
          <p className="muted">
            {work.artist} · {work.tags.join(' / ')} · {work.key} · BPM {work.bpm}
          </p>
        </div>
        <div className="row gap">
          <button className="btn outline small" onClick={() => toggleLike(work.id)}>
            {liked ? '已点赞' : '点赞'}
          </button>
          <Link to="/publish" className="btn small">
            编辑 / 发布
          </Link>
        </div>
      </div>

      <div className="grid two">
        <div className="panel">
          <div className="cover large" style={{ backgroundImage: `url(${work.cover})` }} />
          <p>{work.description}</p>
          <div className="pill-row">
            {work.tags.map((tag) => (
              <span key={tag} className="pill">
                {tag}
              </span>
            ))}
          </div>
          <div className="stats">
            <span>播放 {work.plays.toLocaleString()}</span>
            <span>点赞 {liked ? work.likes + 1 : work.likes}</span>
            <span>评论 {work.comments}</span>
          </div>
        </div>

        <div className="panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">工程轨道</p>
              <h3>Stems</h3>
            </div>
            <Link to="/daw" className="link">
              在 DAW 打开
            </Link>
          </div>
          <div className="stems">
            {work.stems.map((stem, index) => (
              <div key={stem} className="stem-row">
                <div className="stem-name">{stem}</div>
                <div className="stem-meter" style={{ width: `${60 + index * 10}%` }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
