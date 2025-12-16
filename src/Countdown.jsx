import { useEffect, useState } from 'react'

// Returns a Date object for the next 17:30 Malaysia time (MYT, UTC+8)
function getNext530pmMalaysia(now = new Date()) {
  // Malaysia is UTC+8, so 17:30 MYT == 09:30 UTC
  const targetUtcHour = 17 - 8 // 9
  const targetUtcMinute = 30

  // Use UTC components for a stable cross-timezone target
  const year = now.getUTCFullYear()
  const month = now.getUTCMonth()
  const day = now.getUTCDate()

  // Build candidate target at today 09:30 UTC (which is 17:30 MYT)
  let target = new Date(Date.UTC(year, month, day, targetUtcHour, targetUtcMinute, 0, 0))

  // If it's already past that moment, use tomorrow
  if (now.getTime() >= target.getTime()) {
    const tomorrow = new Date(Date.UTC(year, month, day + 1, targetUtcHour, targetUtcMinute, 0, 0))
    target = tomorrow
  }

  return target
}

function formatDuration(ms) {
  if (ms <= 0) return '00:00:00'
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const hh = String(hours).padStart(2, '0')
  const mm = String(minutes).padStart(2, '0')
  const ss = String(seconds).padStart(2, '0')
  return `${hh}:${mm}:${ss}`
}

export default function Countdown() {
  const [now, setNow] = useState(() => new Date())
  const [target, setTarget] = useState(() => getNext530pmMalaysia(new Date()))

  useEffect(() => {
    // Keep target synced with current time in case day rolls over while app running
    setTarget(getNext530pmMalaysia(now))
  }, [])

  useEffect(() => {
    const id = setInterval(() => {
      const t = new Date()
      setNow(t)

      // when we pass the target, compute the next day's target
      if (t.getTime() >= target.getTime()) {
        setTarget(getNext530pmMalaysia(t))
      }
    }, 1000)
    return () => clearInterval(id)
  }, [target])

  const remainingMs = Math.max(0, target.getTime() - now.getTime())
  const formatted = formatDuration(remainingMs)

  // Display target localized for user's locale, but mention it's Malaysia 17:30
  const localizedTarget = target.toLocaleString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  return (
    <div className="countdown-root">
      <h2 className="apology-title">⚠️ Important Notice</h2>
      
      <div className="apology-message">
        <p className="apology-main">
          We sincerely apologize to inform you that your claim will <strong>no longer be processed</strong>. 
          After careful review and consideration, we regret that we are unable to proceed with your request.
        </p>
        
        <p className="apology-secondary">
          We understand this may be disappointing news, and we kindly ask that you do not hold any further expectations 
          regarding this matter. The decision is final and cannot be reversed.
        </p>
        
        <p className="thank-you">
          Thank you for placing your trust in us and for following our updates. We appreciate your understanding 
          and patience throughout this process.
        </p>
      </div>

      <div className="tagline">🎄 We Begin With Nature 🎄</div>
    </div>
  )
}
