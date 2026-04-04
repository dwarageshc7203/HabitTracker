import { Navigate, NavLink, Outlet, useLocation } from 'react-router-dom'
import ChatbotWidget from '../chatbot/ChatbotWidget'
import { useAuthStore } from '../../store/authStore'
import type { AuthState } from '../../store/authStore'

const AppLayout = () => {
  const location = useLocation()
  const token = useAuthStore((state: AuthState) => state.token)
  const user = useAuthStore((state: AuthState) => state.user)
  const status = useAuthStore((state: AuthState) => state.status)
  const logout = useAuthStore((state: AuthState) => state.logout)
  const todayLabel = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date())

  if (!token && status !== 'loading') {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-header">
          <span className="logo">HabitTrack</span>
          <span className="sidebar-meta">Workspace overview</span>
        </div>
        <nav className="sidebar-nav" aria-label="App">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `sidebar-link${isActive ? ' active' : ''}`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/calendar"
            className={({ isActive }) =>
              `sidebar-link${isActive ? ' active' : ''}`
            }
          >
            Calendar
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `sidebar-link${isActive ? ' active' : ''}`
            }
          >
            Profile
          </NavLink>
          <button className="sidebar-link" type="button" onClick={logout}>
            Logout
          </button>
        </nav>
        <div className="sidebar-meta">
          <p>Streak watch: 11 days</p>
          <p>Next reminder: 7:00 AM</p>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <input
            className="search-input"
            type="search"
            placeholder="Search habits"
            aria-label="Search habits"
          />
          <div className="topbar-meta">
            <span>{todayLabel}</span>
            <span className="user-pill">{user?.name ?? 'Member'}</span>
          </div>
        </header>
        <main className="app-content">
          <Outlet />
        </main>
        <ChatbotWidget />
      </div>
    </div>
  )
}

export default AppLayout
