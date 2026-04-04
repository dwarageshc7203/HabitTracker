import { Link } from 'react-router-dom'

const LandingPage = () => {
  const features = [
    {
      title: 'Unified dashboard',
      description:
        'Stay on top of every habit with a clean snapshot of progress, streaks, and momentum.',
    },
    {
      title: 'Calendar clarity',
      description:
        'Zoom out to monthly patterns and spot the days that set your best weeks in motion.',
    },
    {
      title: 'AI habit assistant',
      description:
        'Get tailored suggestions and gentle nudges based on what is working for you.',
    },
    {
      title: 'Progress analytics',
      description:
        'Understand consistency with streaks, completion rates, and weekly cadence.',
    },
  ]

  const stats = [
    { label: 'Active members', value: '24,860' },
    { label: 'Habits tracked', value: '310,500' },
    { label: 'Avg. success rate', value: '88%' },
    { label: 'Weekly streaks', value: '42,190' },
  ]

  const testimonials = [
    {
      quote:
        'The weekly rhythm view keeps me honest. I can spot a dip before it becomes a trend.',
      name: 'Avery Park',
      role: 'Product lead',
      initials: 'AP',
    },
    {
      quote:
        'It feels like a coach and a planner in one place. The AI ideas are uncannily relevant.',
      name: 'Milan Reyes',
      role: 'Founder',
      initials: 'MR',
    },
    {
      quote:
        'The calendar helped me lock in a morning routine. I can see consistency at a glance.',
      name: 'Jordan Lee',
      role: 'Design ops',
      initials: 'JL',
    },
  ]

  return (
    <main>
      <section className="hero fade-up" id="top">
        <div className="container hero-grid">
          <div className="hero-content">
            <p className="eyebrow">Habit tracking reimagined</p>
            <h1>Build habits that stick with clarity and momentum.</h1>
            <p className="lead">
              Track daily goals, see progress instantly, and let your AI habit
              assistant surface the next best step.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-primary" to="/signup">
                Get started
              </Link>
              <a className="btn btn-secondary" href="#features">
                Watch demo
              </a>
            </div>
            <div className="hero-meta">
              <div>
                <p className="meta-label">Trusted by teams</p>
                <p className="meta-value">3,200+ global creators</p>
              </div>
              <div>
                <p className="meta-label">Average streak</p>
                <p className="meta-value">18 days</p>
              </div>
            </div>
          </div>
          <div className="hero-visual" aria-hidden="true">
            <div className="hero-card">
              <div className="hero-card-header">
                <span>Today</span>
                <span className="chip">+12%</span>
              </div>
              <div className="hero-progress">
                <div className="progress-bar">
                  <span></span>
                </div>
                <div className="progress-metrics">
                  <div>
                    <p className="meta-label">Completed</p>
                    <p className="meta-value">4 / 6 habits</p>
                  </div>
                  <div>
                    <p className="meta-label">Streak</p>
                    <p className="meta-value">11 days</p>
                  </div>
                </div>
              </div>
              <div className="hero-grid-cards">
                <div className="mini-card">
                  <p className="meta-label">Focus</p>
                  <p className="meta-value">Deep work</p>
                </div>
                <div className="mini-card">
                  <p className="meta-label">Energy</p>
                  <p className="meta-value">Morning run</p>
                </div>
                <div className="mini-card">
                  <p className="meta-label">Mindset</p>
                  <p className="meta-value">Meditate</p>
                </div>
              </div>
            </div>
            <div className="floating-note">AI suggests a 5 minute reset</div>
          </div>
        </div>
      </section>

      <section className="section" id="features">
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">Features</p>
            <h2>Everything you need to stay consistent.</h2>
            <p className="section-sub">
              From daily check-ins to monthly insights, the dashboard and
              calendar keep your habits visible and actionable.
            </p>
          </div>
          <div className="feature-grid">
            {features.map((feature) => (
              <article key={feature.title} className="feature-card">
                <div className="feature-icon" aria-hidden="true">
                  <span></span>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section stats" id="stats">
        <div className="container stats-grid">
          {stats.map((stat) => (
            <div key={stat.label} className="stat-card">
              <p className="stat-value">{stat.value}</p>
              <p className="stat-label">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section" id="testimonials">
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">Testimonials</p>
            <h2>Momentum shared by real people.</h2>
            <p className="section-sub">
              Whether you are building a personal routine or leading a team
              challenge, HabitTrack keeps the energy high.
            </p>
          </div>
          <div className="testimonial-grid">
            {testimonials.map((testimonial) => (
              <article key={testimonial.name} className="testimonial-card">
                <div className="testimonial-header">
                  <div className="avatar" aria-hidden="true">
                    {testimonial.initials}
                  </div>
                  <div>
                    <p className="meta-value">{testimonial.name}</p>
                    <p className="meta-label">{testimonial.role}</p>
                  </div>
                </div>
                <p className="testimonial-quote">"{testimonial.quote}"</p>
                <p className="rating">Rating: 5 / 5</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="cta" id="cta">
        <div className="container cta-inner">
          <div>
            <p className="eyebrow">Ready to build your habits?</p>
            <h2>Make your next streak the easiest to keep.</h2>
            <p className="section-sub">
              Start free, invite a friend, and let the assistant guide your daily
              focus.
            </p>
          </div>
          <div className="cta-actions">
            <Link className="btn btn-primary" to="/signup">
              Sign up now
            </Link>
            <button className="btn btn-secondary" type="button">
              Talk to sales
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}

export default LandingPage
