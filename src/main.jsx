import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import RoulettePage from './roulette/RoulettePage.jsx'

const path = window.location.pathname.replace(/\/+$/, '') || '/'
const isPlay = path === '/play'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isPlay ? <RoulettePage /> : <App />}
  </StrictMode>,
)
