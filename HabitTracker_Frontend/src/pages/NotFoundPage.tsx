import { Link } from 'react-router-dom'

const NotFoundPage = () => {
  return (
    <main className="container" style={{ padding: '80px 0' }}>
      <div className="card">
        <h1>Page not found</h1>
        <p className="section-sub">
          The page you are looking for does not exist yet.
        </p>
        <Link className="btn btn-primary" to="/">
          Go back home
        </Link>
      </div>
    </main>
  )
}

export default NotFoundPage
