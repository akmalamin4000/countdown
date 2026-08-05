import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  BETS,
  CHIP_AMOUNTS,
  LOCAL_PERSONA_KEY,
  MIN_CHIP,
  PRESET_PERSONAS,
  STARTING_BALANCE,
  TILE_WIDTH,
  WHEEL,
} from './constants'
import {
  applySpinResult,
  createPersona,
  ensurePresetPersona,
  formatCoins,
  getLocalPersonas,
  onPersonasChange,
  resetBalance,
} from './rouletteFirebase'
import './RoulettePage.css'

const STRIP_LOOPS = 10

function buildStrip() {
  const tiles = []
  for (let loop = 0; loop < STRIP_LOOPS; loop++) {
    for (const slot of WHEEL) {
      tiles.push({ ...slot, key: `${loop}-${slot.id}` })
    }
  }
  return tiles
}

function pickWinner() {
  return WHEEL[Math.floor(Math.random() * WHEEL.length)]
}

const emptyBets = () => ({ red: 0, black: 0, purple: 0, green: 0 })

export default function RoulettePage() {
  const [personas, setPersonas] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [activeId, setActiveId] = useState(() => localStorage.getItem(LOCAL_PERSONA_KEY))
  const [chip, setChip] = useState(5)
  const [customChip, setCustomChip] = useState('')
  const [bets, setBets] = useState(emptyBets)
  const [spinning, setSpinning] = useState(false)
  const [offset, setOffset] = useState(0)
  const [duration, setDuration] = useState(0)
  const [lastResult, setLastResult] = useState(null)
  const [history, setHistory] = useState([])
  const [customName, setCustomName] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const trackRef = useRef(null)
  const pendingRef = useRef(null)
  const strip = useMemo(() => buildStrip(), [])

  const active = personas.find((p) => p.id === activeId) || null
  const balance = active?.balance ?? 0
  const totalBet = Object.values(bets).reduce((s, v) => s + v, 0)

  useEffect(() => {
    const unsub = onPersonasChange((list) => {
      setPersonas(list)
      setLoaded(true)
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    if (activeId) localStorage.setItem(LOCAL_PERSONA_KEY, activeId)
    else localStorage.removeItem(LOCAL_PERSONA_KEY)
  }, [activeId])

  const selectPersona = (id) => {
    setActiveId(id)
    setBets(emptyBets())
    setLastResult(null)
    setError('')
  }

  const refreshPersonas = () => setPersonas(getLocalPersonas())

  const handlePreset = async (preset) => {
    setCreating(true)
    setError('')
    try {
      const persona = await ensurePresetPersona(preset)
      refreshPersonas()
      selectPersona(persona.id)
    } catch (e) {
      setError('Could not join persona.')
      console.error(e)
    } finally {
      setCreating(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!customName.trim()) return
    setCreating(true)
    setError('')
    try {
      const tint = PRESET_PERSONAS[Math.floor(Math.random() * PRESET_PERSONAS.length)].tint
      const emoji = PRESET_PERSONAS[Math.floor(Math.random() * PRESET_PERSONAS.length)].emoji
      const persona = await createPersona({ name: customName, emoji, tint })
      setCustomName('')
      refreshPersonas()
      selectPersona(persona.id)
    } catch (err) {
      setError('Could not create persona.')
      console.error(err)
    } finally {
      setCreating(false)
    }
  }

  const addBet = (color) => {
    if (spinning || !active) return
    const amount = Math.round(Number(chip) * 100) / 100
    if (!Number.isFinite(amount) || amount < MIN_CHIP) {
      setError(`Min bet is ${MIN_CHIP.toFixed(2)}`)
      return
    }
    setBets((prev) => {
      const nextTotal = Math.round((Object.values(prev).reduce((s, v) => s + v, 0) + amount) * 100) / 100
      if (nextTotal > balance) {
        setError('Not enough coins.')
        return prev
      }
      setError('')
      return {
        ...prev,
        [color]: Math.round((prev[color] + amount) * 100) / 100,
      }
    })
  }

  const applyCustomChip = (raw) => {
    setCustomChip(raw)
    const n = Number(raw)
    if (Number.isFinite(n) && n >= MIN_CHIP) {
      setChip(Math.round(n * 100) / 100)
    }
  }

  const selectPresetChip = (n) => {
    setChip(n)
    setCustomChip('')
  }

  const clearBets = () => {
    if (spinning) return
    setBets(emptyBets())
    setError('')
  }

  const resolveSpin = useCallback(
    async (winner, placedBets) => {
      const stake = Object.values(placedBets).reduce((s, v) => s + v, 0)
      const winAmount = placedBets[winner.color]
        ? placedBets[winner.color] * BETS[winner.color].multiplier
        : 0
      const net = winAmount - stake

      try {
        await applySpinResult(activeId, net)
        setPersonas(getLocalPersonas())
      } catch (err) {
        console.error(err)
        setError('Failed to update wallet.')
      }

      setLastResult({
        color: winner.color,
        label: winner.label,
        stake,
        winAmount,
        net,
      })
      setHistory((h) => [{ color: winner.color, label: winner.label }, ...h].slice(0, 12))
      setBets(emptyBets())
      setSpinning(false)
      pendingRef.current = null
    },
    [activeId]
  )

  const handleSpinEnd = () => {
    const pending = pendingRef.current
    if (!pending) return
    resolveSpin(pending.winner, pending.bets)
  }

  const spin = () => {
    if (spinning || !active || totalBet <= 0) return
    if (totalBet > balance) {
      setError('Not enough coins.')
      return
    }

    const winner = pickWinner()
    const parentWidth = trackRef.current?.parentElement?.clientWidth || 800
    const baseLoop = STRIP_LOOPS - 3
    const winnerIndex = WHEEL.findIndex((s) => s.id === winner.id)
    const absoluteIndex = baseLoop * WHEEL.length + winnerIndex
    const jitter = (Math.random() - 0.5) * TILE_WIDTH * 0.5
    const tileCenter = absoluteIndex * TILE_WIDTH + TILE_WIDTH / 2
    const target = tileCenter - parentWidth / 2 + jitter

    pendingRef.current = { winner, bets: { ...bets } }
    setLastResult(null)
    setError('')
    setSpinning(true)

    // Reset strip without transition, then animate to the landing offset
    setDuration(0)
    setOffset(0)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setDuration(5.2)
        setOffset(target)
      })
    })
  }

  const handleReset = async () => {
    if (!active || spinning) return
    if (!confirm(`Reset ${active.name}'s wallet to ${STARTING_BALANCE.toFixed(2)}?`)) return
    await resetBalance(active.id)
    setPersonas(getLocalPersonas())
    setBets(emptyBets())
    setLastResult(null)
  }

  if (!loaded) {
    return (
      <div className="roulette-page">
        <div className="roulette-persona-gate">
          <p className="roulette-gate-sub">Loading…</p>
        </div>
      </div>
    )
  }

  // Persona gate
  if (!active) {
    return (
      <div className="roulette-page">
        <div className="roulette-persona-gate">
          <p className="roulette-eyebrow">Secret room</p>
          <h1>Pick your persona</h1>
          <p className="roulette-gate-sub">
            Each persona has its own wallet (starts at {STARTING_BALANCE.toFixed(2)}). Shared live via Firebase —
            pick one and play.
          </p>

          <div className="persona-grid">
            {PRESET_PERSONAS.map((p) => {
              const existing = personas.find((x) => x.name === p.name && x.emoji === p.emoji)
              return (
                <button
                  key={p.name}
                  type="button"
                  className="persona-card"
                  style={{ '--tint': p.tint }}
                  disabled={creating}
                  onClick={() => (existing ? selectPersona(existing.id) : handlePreset(p))}
                >
                  <span className="persona-emoji">{p.emoji}</span>
                  <span className="persona-name">{p.name}</span>
                  <span className="persona-bal">
                    {existing ? `${formatCoins(existing.balance)} coins` : `Start ${STARTING_BALANCE.toFixed(0)}`}
                  </span>
                </button>
              )
            })}
          </div>

          {personas.filter((p) => !PRESET_PERSONAS.some((x) => x.name === p.name && x.emoji === p.emoji)).length >
            0 && (
            <div className="custom-personas">
              <h3>Custom personas</h3>
              <div className="persona-grid">
                {personas
                  .filter((p) => !PRESET_PERSONAS.some((x) => x.name === p.name && x.emoji === p.emoji))
                  .map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className="persona-card"
                      style={{ '--tint': p.tint || '#10b981' }}
                      onClick={() => selectPersona(p.id)}
                    >
                      <span className="persona-emoji">{p.emoji}</span>
                      <span className="persona-name">{p.name}</span>
                      <span className="persona-bal">{formatCoins(p.balance)} coins</span>
                    </button>
                  ))}
              </div>
            </div>
          )}

          <form className="create-persona" onSubmit={handleCreate}>
            <input
              type="text"
              maxLength={16}
              placeholder="Or type a new name…"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              disabled={creating}
            />
            <button type="submit" disabled={creating || !customName.trim()}>
              Create
            </button>
          </form>

          {error && <p className="roulette-error">{error}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="roulette-page">
      <header className="roulette-header">
        <div className="roulette-player">
          <span className="roulette-avatar" style={{ background: active.tint }}>
            {active.emoji}
          </span>
          <div>
            <strong>{active.name}</strong>
            <button type="button" className="linkish" onClick={() => selectPersona(null)}>
              Switch persona
            </button>
          </div>
        </div>
        <div className="roulette-wallet">
          <span className="wallet-label">Wallet</span>
          <span className="wallet-value">{formatCoins(balance)}</span>
          <button type="button" className="linkish" onClick={handleReset} disabled={spinning}>
            Reset
          </button>
        </div>
      </header>

      <div className="roulette-history">
        {history.length === 0 ? (
          <span className="hist-empty">No spins yet</span>
        ) : (
          history.map((h, i) => (
            <span key={`${h.label}-${i}`} className={`hist-chip hist-${h.color}`}>
              {h.label}
            </span>
          ))
        )}
      </div>

      <div className="roulette-strip-wrap">
        <div className="roulette-marker" />
        <div className="roulette-strip-fade left" />
        <div className="roulette-strip-fade right" />
        <div className="roulette-strip-viewport">
          <div
            ref={trackRef}
            className="roulette-strip"
            style={{
              width: strip.length * TILE_WIDTH,
              transform: `translate3d(-${offset}px, 0, 0)`,
              transition: spinning
                ? `transform ${duration}s cubic-bezier(0.12, 0.82, 0.08, 1)`
                : 'none',
            }}
            onTransitionEnd={(e) => {
              if (e.propertyName === 'transform' && spinning) handleSpinEnd()
            }}
          >
            {strip.map((tile) => (
              <div key={tile.key} className={`roulette-tile tile-${tile.color}`}>
                {tile.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {lastResult && (
        <div className={`roulette-result ${lastResult.net >= 0 ? 'win' : 'lose'}`}>
          Landed on <strong className={`hist-${lastResult.color}`}>{lastResult.color}</strong>
          {' · '}
          {lastResult.net >= 0
            ? `Won ${formatCoins(lastResult.winAmount)} (+${formatCoins(lastResult.net)})`
            : `Lost ${formatCoins(Math.abs(lastResult.net))}`}
        </div>
      )}

      <div className="chip-row">
        <button type="button" className="chip clear" onClick={clearBets} disabled={spinning || totalBet === 0}>
          Clear
        </button>
        <label className={`chip chip-custom ${customChip !== '' ? 'active' : ''}`}>
          <span className="chip-custom-prefix">$</span>
          <input
            type="number"
            min={MIN_CHIP}
            step="0.01"
            inputMode="decimal"
            placeholder="0.01"
            value={customChip}
            disabled={spinning}
            onChange={(e) => applyCustomChip(e.target.value)}
            onBlur={() => {
              const n = Number(customChip)
              if (!customChip || !Number.isFinite(n) || n < MIN_CHIP) {
                if (customChip !== '') setError(`Min bet is ${MIN_CHIP.toFixed(2)}`)
                return
              }
              const rounded = Math.round(n * 100) / 100
              setCustomChip(String(rounded))
              setChip(rounded)
              setError('')
            }}
          />
        </label>
        {CHIP_AMOUNTS.map((n) => (
          <button
            key={n}
            type="button"
            className={`chip ${chip === n && customChip === '' ? 'active' : ''}`}
            onClick={() => selectPresetChip(n)}
            disabled={spinning}
          >
            {n}
          </button>
        ))}
      </div>

      <div className="bet-grid">
        {Object.entries(BETS).map(([color, meta]) => (
          <button
            key={color}
            type="button"
            className={`bet-btn bet-${color}`}
            onClick={() => addBet(color)}
            disabled={spinning}
          >
            <span className="bet-label">{meta.label}</span>
            <span className="bet-multi">{meta.multiplier}x</span>
            <span className="bet-amount">{formatCoins(bets[color])}</span>
          </button>
        ))}
      </div>

      <div className="spin-bar">
        <div className="spin-info">
          <span>Total bet</span>
          <strong>{formatCoins(totalBet)}</strong>
        </div>
        <button
          type="button"
          className="spin-btn"
          onClick={spin}
          disabled={spinning || totalBet <= 0 || totalBet > balance}
        >
          {spinning ? 'Spinning…' : 'Spin'}
        </button>
      </div>

      {error && <p className="roulette-error">{error}</p>}

      <p className="roulette-odds">
        Wheel: 6 red · 6 black · 2 purple · 1 green — Red/Black 2x · Purple 7x · Green 14x
      </p>
    </div>
  )
}
