import { Link, Outlet } from 'react-router-dom'

const MarketingLayout = () => {
  return (
    <div className="page">
      <header className="site-header">
        <div className="container header-inner">
          <Link className="logo" to="/" aria-label="HabitTrack home">
            HabitTrack
          </Link>
          <nav className="nav-links" aria-label="Primary">
            <a href="/#features">Features</a>
            <a href="/#stats">Stats</a>
            <a href="/#testimonials">Stories</a>
            <a href="/#cta">Get started</a>
          </nav>
          <div className="nav-actions">
            <Link className="btn btn-ghost" to="/login">
              Login
            </Link>
            <Link className="btn btn-primary" to="/signup">
              Sign up
            </Link>
          </div>
          <button className="menu-toggle" type="button" aria-label="Open menu">
            <span></span>
            <span></span>
          </button>
        </div>
      </header>
      <Outlet />
      <footer className="footer">
        <div className="container footer-grid">
          <div>
            <p className="logo">HabitTrack</p>
            <p className="section-sub">
              Build habits with confidence, clarity, and a little help from AI.
            </p>
          </div>
          <div className="footer-links">
            <a href="/#features">Features</a>
            <a href="/#stats">Stats</a>
            <a href="/#testimonials">Stories</a>
            <a href="/#cta">Get started</a>
          </div>
          <div className="footer-meta">
            <p>hello@habittrack.app</p>
            <p>2026 HabitTrack. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default MarketingLayout
