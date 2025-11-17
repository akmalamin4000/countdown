import './App.css'
import Countdown from './Countdown'

function App() {
  return (
    <div className="app-root">
      <header>
        <h1>Countdown Claim</h1>
        <p className="subtitle">Counting down to 5:00 PM Malaysia time (MYT)</p>
      </header>
      <main>
        <Countdown />
      </main>
    </div>
  )
}

export default App
