import { useEffect } from 'react'
import './App.css'
import Countdown from './Countdown'
import Snowfall from 'react-snowfall'

function App() {
  useEffect(() => {
    // Force dark theme permanently
    document.documentElement.setAttribute('data-theme', 'dark')
  }, [])

  return (
    <>
      <Snowfall
        color="#dee4fd"
        snowflakeCount={200}
        style={{
          position: 'fixed',
          width: '100vw',
          height: '100vh',
          zIndex: 1000,
          pointerEvents: 'none'
        }}
      />
      <div className="app-root dark">
        <header>
          <div className="header-top">
            <h1>Countdown Claim 🎄</h1>
          </div>
          <p className="subtitle">Official Notice from Claims Department</p>
        </header>
        <main>
          <Countdown />
        </main>
      </div>
    </>
  )
}

export default App
