import { useEffect, useState } from 'react'

// Returns a Date object for the next 17:00 Malaysia time (MYT, UTC+8)
function getNext5pmMalaysia(now = new Date()) {
  // Malaysia is UTC+8, so 17:00 MYT == 09:00 UTC
  const targetUtcHour = 17 - 8 // 9

  // Use UTC components for a stable cross-timezone target
  const year = now.getUTCFullYear()
  const month = now.getUTCMonth()
  const day = now.getUTCDate()

  // Build candidate target at today 09:00 UTC (which is 17:00 MYT)
  let target = new Date(Date.UTC(year, month, day, targetUtcHour, 0, 0, 0))

  // If it's already past that moment, use tomorrow
  if (now.getTime() >= target.getTime()) {
    const tomorrow = new Date(Date.UTC(year, month, day + 1, targetUtcHour, 0, 0, 0))
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
  const [target, setTarget] = useState(() => getNext5pmMalaysia(new Date()))

  useEffect(() => {
    // Keep target synced with current time in case day rolls over while app running
    setTarget(getNext5pmMalaysia(now))
  }, [])

  useEffect(() => {
    const id = setInterval(() => {
      const t = new Date()
      setNow(t)

      // when we pass the target, compute the next day's target
      if (t.getTime() >= target.getTime()) {
        setTarget(getNext5pmMalaysia(t))
      }
    }, 1000)
    return () => clearInterval(id)
  }, [target])

  const remainingMs = Math.max(0, target.getTime() - now.getTime())
  const formatted = formatDuration(remainingMs)

  // Display target localized for user's locale, but mention it's Malaysia 17:00
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
      <h2>Claim akan dapat dlm masa</h2>
      <div className="countdown-clock" aria-live="polite">{formatted}</div>
      <div className="countdown-target">Target: {localizedTarget} (MYT)</div>
      {remainingMs === 0 && <div className="countdown-now">It's 5:00 PM in Malaysia now!</div>}
    </div>
  )
}
