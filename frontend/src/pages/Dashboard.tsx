import { Link } from 'react-router-dom'
import { mockActivities, mockWorks } from '../mock/data'

export default function Dashboard() {
  const featured = mockWorks[0]
  return (
    <div className="page">
      <section className="panel hero">
        <div className="hero__copy">
          <p className="eyebrow">在线音乐创作 · 演示版</p>
          <h1>快速搭建作品、发布、分享，一体化体验</h1>
          <p className="muted">
            前端原型已就绪，后续可直连后端 API（用户、作品、评论、推荐、DAW 工程上传）。
          </p>
          <div className="row gap">
            <Link className="btn primary" to="/publish">
              立即发布作品
            </Link>
            <Link className="btn ghost" to="/daw">
              打开创作空间
            </Link>
          </div>
          <div className="chips">
            <span className="chip">Web Audio / Tone.js</span>
            <span className="chip">React + Vite</span>
            <span className="chip">可接入 Spring Boot API</span>
          </div>
        </div>
        <div className="hero__card">
          <div className="hero__thumb" style={{ backgroundImage: `url(${featured.cover})` }} />
          <div className="hero__meta">
            <div>
              <p className="muted">正在播放</p>
              <h3>{featured.title}</h3>
              <p className="muted">{featured.artist}</p>
            </div>
            <div className="hero__tags">
              {featured.tags.map((tag) => (
                <span key={tag} className="chip ghost">
                  {tag}
                </span>
              ))}
            </div>
            <div className="hero__stats">
              <div>
                <p className="muted">播放</p>
                <strong>{featured.plays.toLocaleString()}</strong>
              </div>
              <div>
                <p className="muted">点赞</p>
                <strong>{featured.likes.toLocaleString()}</strong>
              </div>
              <div>
                <p className="muted">评论</p>
                <strong>{featured.comments}</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid two">
        <div className="panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">作品进度</p>
              <h3>待办与草稿</h3>
            </div>
            <Link to="/publish" className="link">
              新建
            </Link>
          </div>
          <ul className="list">
            {mockWorks.map((work) => (
              <li key={work.id} className="list-item">
                <div>
                  <p className="title">{work.title}</p>
                  <p className="muted">
                    {work.artist} · {work.tags.join(' / ')}
                  </p>
                </div>
                <div className="pill-row">
                  <span className="pill">BPM {work.bpm}</span>
                  <span className="pill">{work.key}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">互动动态</p>
              <h3>最近 24 小时</h3>
            </div>
            {/* 社交模块已移除，保留最近互动预览，无跳转 */}
          </div>
          <ul className="timeline">
            {mockActivities.map((item) => (
              <li key={item.id}>
                <div className="bullet" />
                <div>
                  <p className="title">
                    {item.user} {item.action} 《{item.target}》
                  </p>
                  <p className="muted">{item.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}
