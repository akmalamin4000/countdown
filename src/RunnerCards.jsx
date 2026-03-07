import { useState, useEffect } from 'react'
import './RunnerCards.css'
import { onRunnersChange, updateRunner } from './firebase'
import EditRunnerModal from './EditRunnerModal'

export default function RunnerCards() {
  const [runners, setRunners] = useState([])
  const [editingRunner, setEditingRunner] = useState(null)

  useEffect(() => {
    const unsubscribe = onRunnersChange(setRunners)
    return () => unsubscribe()
  }, [])

  const handleSave = async (updatedRunner) => {
    // Remove the computed `gradient` field before saving
    const { gradient, ...toSave } = updatedRunner
    await updateRunner(toSave.id, toSave)
  }

  if (runners.length === 0) {
    return (
      <section className="runners-section">
        <h2 className="section-title">Meet The Team</h2>
        <p className="section-subtitle">Loading runners...</p>
      </section>
    )
  }

  return (
    <section className="runners-section">
      <h2 className="section-title">Meet The Team</h2>
      <p className="section-subtitle">Hover over a runner to see their full profile</p>
      <div className="runner-cards-container">
        {runners.map((runner) => (
          <div
            key={runner.id}
            className="runner-card"
            style={{ '--runner-color': runner.color, '--runner-gradient': runner.gradient }}
          >
            {/* Accent header bar */}
            <div className="runner-header" style={{ background: runner.gradient }}>
              <span className="runner-emoji">{runner.emoji}</span>
              <h3 className="runner-name">{runner.name}</h3>
              <span className="runner-nickname">{runner.nickname}</span>
            </div>

            {/* Card body */}
            <div className="runner-body">
              {/* Always visible: quick stats */}
              <div className="runner-quick-stats">
                <div className="quick-stat">
                  <span className="quick-stat-value">{runner.goalTime}</span>
                  <span className="quick-stat-label">Goal Time</span>
                </div>
                <div className="quick-stat">
                  <span className="quick-stat-value">{runner.weeklyKm} km</span>
                  <span className="quick-stat-label">Weekly</span>
                </div>
                <div className="quick-stat">
                  <span className="quick-stat-value">{runner.trainingRuns}</span>
                  <span className="quick-stat-label">Runs</span>
                </div>
              </div>

              {/* Revealed on hover: full details */}
              <div className="runner-details">
                <p className="runner-bio">{runner.bio}</p>

                <div className="runner-stats-grid">
                  <div className="detail-item">
                    <span className="detail-label">Age</span>
                    <span className="detail-value">{runner.age}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Running Since</span>
                    <span className="detail-value">{runner.runningSince}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">10K PB</span>
                    <span className="detail-value">{runner.pb10k}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Longest Run</span>
                    <span className="detail-value">{runner.longestRun}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Training Runs</span>
                    <span className="detail-value">{runner.trainingRuns}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Current Streak</span>
                    <span className="detail-value">{runner.streak}</span>
                  </div>
                </div>

                <p className="runner-fun-fact">
                  <span className="fun-fact-icon">💡</span> {runner.funFact}
                </p>

                <button
                  className="btn-edit-runner"
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditingRunner(runner)
                  }}
                >
                  ✏️ Edit Stats
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editingRunner && (
        <EditRunnerModal
          runner={editingRunner}
          onSave={handleSave}
          onClose={() => setEditingRunner(null)}
        />
      )}
    </section>
  )
}
