import { Link, Outlet } from 'react-router-dom'

const AuthLayout = () => {
  return (
    <div className="auth-layout">
      <aside className="auth-aside">
        <Link className="logo" to="/">
          HabitTrack
        </Link>
        <div>
          <h2>Build habits that stick.</h2>
          <p className="section-sub">
            Capture daily wins, uncover trends, and let the AI assistant guide
            your next best move.
          </p>
        </div>
        <div className="auth-proof">
          <p className="meta-label">Teams thriving</p>
          <p className="meta-value">"We doubled consistency in four weeks."</p>
          <p className="meta-label">- Focus Lab Collective</p>
        </div>
      </aside>
      <main className="auth-main">
        <Outlet />
      </main>
    </div>
  )
}

export default AuthLayout
