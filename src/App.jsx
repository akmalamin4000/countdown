import { useEffect, useState } from 'react'
import './App.css'
import Countdown from './Countdown'

function App() {
  // default to light; allow persisted preference
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('theme') || 'light'
    } catch (e) {
      return 'light'
    }
  })

  useEffect(() => {
    // apply theme using a data attribute for CSS variable scope
    try {
      document.documentElement.setAttribute('data-theme', theme)
      localStorage.setItem('theme', theme)
    } catch (e) {
      // ignore (e.g., localStorage not available)
    }
  }, [theme])

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'))

  return (
    <div className={`app-root ${theme === 'dark' ? 'dark' : 'light'}`}>
      <header>
        <div className="header-top">
          <h1>Countdown Claim</h1>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-pressed={theme === 'dark'}
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
        <p className="subtitle">Counting down to 5:00 PM Malaysia time (MYT)</p>
      </header>
      <main>
        <Countdown />
      </main>
    </div>
  )
}

export default App
