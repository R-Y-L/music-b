import type { FormEvent } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'

export default function Auth() {
  const navigate = useNavigate()
  const { login } = useAppStore()
  const [name, setName] = useState('Demo User')
  const [mode, setMode] = useState<'login' | 'register'>('login')

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    login(name)
    navigate('/')
  }

  return (
    <div className="page auth">
      <div className="panel form auth-card">
        <div className="section-header">
          <div>
            <p className="eyebrow">{mode === 'login' ? '登录' : '注册'}</p>
            <h2>音乐创作者中心</h2>
            <p className="muted">前端态演示，提交后会直接持久在内存状态。</p>
          </div>
          <button className="btn ghost small" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
            切换为 {mode === 'login' ? '注册' : '登录'}
          </button>
        </div>
        <form className="stack" onSubmit={handleSubmit}>
          <label>
            <span>昵称</span>
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label>
            <span>邮箱</span>
            <input type="email" placeholder="demo@email.com" required />
          </label>
          <label>
            <span>密码</span>
            <input type="password" placeholder="至少 8 位" required />
          </label>
          <button className="btn primary" type="submit">
            {mode === 'login' ? '登录' : '注册'}
          </button>
        </form>
      </div>
      <div className="panel auth-side">
        <p className="eyebrow">产品亮点</p>
        <h3>全流程创作到发行</h3>
        <ul className="list">
          <li>DAW 录制 / 编曲 / 导出</li>
          <li>作品发布、版权标记、数据面板</li>
          <li>评论、点赞、关注的社交分发</li>
        </ul>
      </div>
    </div>
  )
}
