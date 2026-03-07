import { useState, useEffect } from 'react'
import './App.css'
import Countdown from './Countdown'
import RunnerCards from './RunnerCards'
import { seedIfEmpty, onRunnersChange } from './firebase'

function App() {
  const [runners, setRunners] = useState([])

  // Auto-compute team stats from individual runner data
  const teamStats = {
    totalRuns: runners.reduce((sum, r) => sum + (Number(r.trainingRuns) || 0), 0),
    totalKm: runners.reduce((sum, r) => sum + (Number(r.weeklyKm) || 0) * 18, 0).toLocaleString(),
    weeklyAvgKm: runners.reduce((sum, r) => sum + (Number(r.weeklyKm) || 0), 0),
    avgPace: '6:12',
  }

  useEffect(() => {
    seedIfEmpty()
    const unsubscribe = onRunnersChange(setRunners)
    return () => unsubscribe()
  }, [])
  return (
    <div className="app">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg-glow" />
        <div className="hero-content">
          <span className="hero-badge">🏃‍♂️ HALF MARATHON 2026</span>
          <h1 className="hero-title">
            The Road to <span className="highlight">21.1K</span>
          </h1>
          <p className="hero-subtitle">August 15, 2026 · 2:00 AM · Malaysia</p>
          <Countdown />
        </div>
      </section>

      {/* Event Info Strip */}
      <section className="event-strip">
        <div className="strip-item">
          <span className="strip-icon">📏</span>
          <div className="strip-text">
            <span className="strip-value">21.1 KM</span>
            <span className="strip-label">Distance</span>
          </div>
        </div>
        <div className="strip-divider" />
        <div className="strip-item">
          <span className="strip-icon">👥</span>
          <div className="strip-text">
            <span className="strip-value">3 Runners</span>
            <span className="strip-label">Team Size</span>
          </div>
        </div>
        <div className="strip-divider" />
        <div className="strip-item">
          <span className="strip-icon">🎯</span>
          <div className="strip-text">
            <span className="strip-value">Sub 2:15</span>
            <span className="strip-label">Team Goal</span>
          </div>
        </div>
        <div className="strip-divider" />
        <div className="strip-item">
          <span className="strip-icon">🔥</span>
          <div className="strip-text">
            <span className="strip-value">In Progress</span>
            <span className="strip-label">Training Status</span>
          </div>
        </div>
      </section>

      {/* Runner Bios */}
      <RunnerCards />

      {/* Training Dashboard */}
      <section className="training-section">
        <h2 className="section-title">Training Dashboard</h2>
        <p className="section-subtitle">Combined team statistics</p>
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-number">{teamStats.totalRuns}</span>
            <span className="stat-desc">Total Training Runs</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{teamStats.totalKm}</span>
            <span className="stat-desc">Kilometers Covered</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{teamStats.weeklyAvgKm}</span>
            <span className="stat-desc">Weekly Avg KM</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{teamStats.avgPace}</span>
            <span className="stat-desc">Avg Pace (min/km)</span>
          </div>
        </div>
      </section>

      {/* Milestones */}
      <section className="milestones-section">
        <h2 className="section-title">Road to Race Day</h2>
        <p className="section-subtitle">Key milestones on our journey</p>
        <div className="timeline">
          <div className="milestone completed">
            <div className="milestone-marker">
              <div className="milestone-dot" />
            </div>
            <div className="milestone-content">
              <span className="milestone-date">Jan 2026</span>
              <span className="milestone-text">Started training together</span>
            </div>
          </div>
          <div className="milestone completed">
            <div className="milestone-marker">
              <div className="milestone-dot" />
            </div>
            <div className="milestone-content">
              <span className="milestone-date">Feb 2026</span>
              <span className="milestone-text">First 10K run completed by all 3</span>
            </div>
          </div>
          <div className="milestone completed">
            <div className="milestone-marker">
              <div className="milestone-dot" />
            </div>
            <div className="milestone-content">
              <span className="milestone-date">Mar 2026</span>
              <span className="milestone-text">Officially registered for the race</span>
            </div>
          </div>
          <div className="milestone">
            <div className="milestone-marker">
              <div className="milestone-dot" />
            </div>
            <div className="milestone-content">
              <span className="milestone-date">May 2026</span>
              <span className="milestone-text">First 15K long run</span>
            </div>
          </div>
          <div className="milestone">
            <div className="milestone-marker">
              <div className="milestone-dot" />
            </div>
            <div className="milestone-content">
              <span className="milestone-date">Jul 2026</span>
              <span className="milestone-text">Peak training — 20K test run</span>
            </div>
          </div>
          <div className="milestone race-day">
            <div className="milestone-marker">
              <div className="milestone-dot" />
            </div>
            <div className="milestone-content">
              <span className="milestone-date">Aug 15, 2026</span>
              <span className="milestone-text">🏁 RACE DAY</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="app-footer">
        <blockquote className="footer-quote">
          &ldquo;The miracle isn&rsquo;t that I finished. The miracle is that I had the courage to start.&rdquo;
        </blockquote>
        <p className="footer-author">— John Bingham</p>
        <p className="footer-tagline">See you at the finish line. 🏁</p>
      </footer>
    </div>
  )
}

export default App
