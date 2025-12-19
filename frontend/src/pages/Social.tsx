import { mockSocialFeed } from '../mock/data'
import { useAppStore } from '../store/useAppStore'

export default function Social() {
  const { user } = useAppStore()
  return (
    <div className="page">
      <div className="section-header">
        <div>
          <p className="eyebrow">互动</p>
          <h2>社交动态</h2>
          <p className="muted">点赞、评论、关注等基础能力可与后端 WebSocket 对接，支持实时刷新。</p>
        </div>
      </div>

      <div className="grid two">
        <div className="panel">
          <h3>创作者动态</h3>
          <div className="feed">
            {mockSocialFeed.map((post) => (
              <article key={post.id} className="feed-item">
                <img src={post.avatar} alt={post.user} className="avatar" />
                <div>
                  <div className="row gap">
                    <strong>{post.user}</strong>
                    <span className="muted small">{post.createdAt}</span>
                  </div>
                  <p>{post.content}</p>
                  <div className="pill-row">
                    <span className="pill">点赞 {post.likes}</span>
                    <span className="pill">评论 {post.comments}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="panel">
          <h3>我的互动</h3>
          {user ? (
            <div className="card__body">
              <p className="muted">当前登录</p>
              <div className="row gap">
                <img className="avatar" src={user.avatar} alt={user.name} />
                <div>
                  <h4>{user.name}</h4>
                  <p className="muted small">角色: {user.role === 'creator' ? '创作者' : '听众'}</p>
                </div>
              </div>
              <div className="pill-row">
                <span className="pill">已发布 6</span>
                <span className="pill">草稿 2</span>
                <span className="pill">收藏 18</span>
              </div>
            </div>
          ) : (
            <p className="muted">尚未登录，可跳转登录页查看用户态演示。</p>
          )}
        </div>
      </div>
    </div>
  )
}
