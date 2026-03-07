import { useEffect, useState } from 'react'
import './Countdown.css'

// Target: August 15, 2026, 2:00 AM Malaysia Time (UTC+8)
// UTC+8 02:00 → UTC 18:00 the day before (Aug 14)
const TARGET_DATE = new Date(Date.UTC(2026, 7, 14, 18, 0, 0))

function getTimeLeft() {
  const now = new Date()
  const diff = Math.max(0, TARGET_DATE.getTime() - now.getTime())

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  return { days, hours, minutes, seconds, total: diff }
}

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft)

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft()), 1000)
    return () => clearInterval(id)
  }, [])

  if (timeLeft.total <= 0) {
    return (
      <div className="countdown-container">
        <div className="countdown-finished">🏁 RACE DAY IS HERE!</div>
      </div>
    )
  }

  return (
    <div className="countdown-container">
      <div className="countdown-boxes">
        <div className="countdown-box">
          <span className="countdown-number">{String(timeLeft.days).padStart(3, '0')}</span>
          <span className="countdown-label">Days</span>
        </div>
        <span className="countdown-separator">:</span>
        <div className="countdown-box">
          <span className="countdown-number">{String(timeLeft.hours).padStart(2, '0')}</span>
          <span className="countdown-label">Hours</span>
        </div>
        <span className="countdown-separator">:</span>
        <div className="countdown-box">
          <span className="countdown-number">{String(timeLeft.minutes).padStart(2, '0')}</span>
          <span className="countdown-label">Minutes</span>
        </div>
        <span className="countdown-separator">:</span>
        <div className="countdown-box">
          <span className="countdown-number">{String(timeLeft.seconds).padStart(2, '0')}</span>
          <span className="countdown-label">Seconds</span>
        </div>
      </div>
    </div>
  )
}
