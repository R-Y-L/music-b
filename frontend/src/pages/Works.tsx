import { Link } from 'react-router-dom'
import { mockWorks } from '../mock/data'

export default function Works() {
  return (
    <div className="page">
      <div className="section-header">
        <div>
          <p className="eyebrow">作品库</p>
          <h2>已发布与草稿</h2>
        </div>
        <Link to="/publish" className="btn small">
          发布新作品
        </Link>
      </div>
      <div className="grid three">
        {mockWorks.map((work) => (
          <article key={work.id} className="card">
            <div className="cover" style={{ backgroundImage: `url(${work.cover})` }} />
            <div className="card__body">
              <p className="muted">{work.artist}</p>
              <h3>{work.title}</h3>
              <p className="muted small">{work.description}</p>
              <div className="pill-row">
                <span className="pill">{work.key}</span>
                <span className="pill">BPM {work.bpm}</span>
                <span className="pill">{work.tags[0]}</span>
              </div>
              <div className="stats">
                <span>播放 {work.plays.toLocaleString()}</span>
                <span>点赞 {work.likes.toLocaleString()}</span>
                <span>评论 {work.comments}</span>
              </div>
              <div className="row gap">
                <Link className="btn ghost small" to={`/works/${work.id}`}>
                  详情
                </Link>
                <Link className="btn outline small" to="/daw">
                  打开工程
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
