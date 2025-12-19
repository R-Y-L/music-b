import type { ReactNode } from 'react'
import { BrowserRouter, Link, NavLink, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Daw from './pages/Daw'
import PublishWork from './pages/PublishWork'
import Social from './pages/Social'
import WorkDetail from './pages/WorkDetail'
import Works from './pages/Works'
import { useAppStore } from './store/useAppStore'

const navItems = [
  { path: '/', label: '概览' },
  { path: '/works', label: '作品库' },
  { path: '/publish', label: '发布' },
  { path: '/daw', label: 'DAW 演示' },
  { path: '/social', label: '社交' },
]

function Shell({ children }: { children: ReactNode }) {
  const { user } = useAppStore()
  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Music OS · Prototype</p>
          <h1>在线音乐创作与分享</h1>
        </div>
        <div className="row gap">
          {user ? (
            <div className="user-chip">
              <img src={user.avatar} alt={user.name} />
              <div>
                <strong>{user.name}</strong>
                <p className="muted small">{user.role === 'creator' ? '创作者' : '听众'}</p>
              </div>
            </div>
          ) : (
            <Link className="btn ghost small" to="/auth">
              登录 / 注册
            </Link>
          )}
        </div>
      </header>

      <nav className="app-nav">
        {navItems.map((item) => (
          <NavLink key={item.path} to={item.path} className={({ isActive }) => (isActive ? 'nav active' : 'nav')} end={item.path === '/'}>
            {item.label}
          </NavLink>
        ))}
        <Link className="btn primary small" to="/publish">
          发布作品
        </Link>
      </nav>

      <main className="app-main">{children}</main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Shell>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/works" element={<Works />} />
          <Route path="/works/:id" element={<WorkDetail />} />
          <Route path="/publish" element={<PublishWork />} />
          <Route path="/daw" element={<Daw />} />
          <Route path="/social" element={<Social />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Shell>
    </BrowserRouter>
  )
}
