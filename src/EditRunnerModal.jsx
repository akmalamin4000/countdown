import { useState } from 'react'
import './EditRunnerModal.css'

const EDITABLE_FIELDS = [
  { key: 'weeklyKm', label: 'Weekly KM', type: 'number' },
  { key: 'trainingRuns', label: 'Training Runs', type: 'number' },
  { key: 'longestRun', label: 'Longest Run', type: 'text', placeholder: 'e.g. 18 km' },
  { key: 'pb10k', label: '10K PB', type: 'text', placeholder: 'e.g. 52:30' },
  { key: 'streak', label: 'Current Streak', type: 'text', placeholder: 'e.g. 12 days' },
  { key: 'goalTime', label: 'Goal Time', type: 'text', placeholder: 'e.g. 2:00:00' },
  { key: 'bio', label: 'Bio', type: 'textarea' },
  { key: 'funFact', label: 'Fun Fact', type: 'textarea' },
]

export default function EditRunnerModal({ runner, onSave, onClose }) {
  const [form, setForm] = useState({ ...runner })
  const [saving, setSaving] = useState(false)

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      // Convert numeric fields
      const updated = { ...form }
      updated.weeklyKm = Number(updated.weeklyKm) || 0
      updated.trainingRuns = Number(updated.trainingRuns) || 0
      await onSave(updated)
      onClose()
    } catch (err) {
      console.error('Failed to save:', err)
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header" style={{ background: runner.gradient }}>
          <span className="modal-emoji">{runner.emoji}</span>
          <h3 className="modal-name">Edit {runner.name}'s Stats</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          {EDITABLE_FIELDS.map(({ key, label, type, placeholder }) => (
            <div className="form-group" key={key}>
              <label className="form-label">{label}</label>
              {type === 'textarea' ? (
                <textarea
                  className="form-input form-textarea"
                  value={form[key] || ''}
                  onChange={(e) => handleChange(key, e.target.value)}
                  placeholder={placeholder}
                  rows={2}
                />
              ) : (
                <input
                  className="form-input"
                  type={type}
                  value={form[key] || ''}
                  onChange={(e) => handleChange(key, e.target.value)}
                  placeholder={placeholder}
                />
              )}
            </div>
          ))}

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-save" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
