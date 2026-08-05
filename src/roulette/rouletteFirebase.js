import { ref, onValue, set, push, update, runTransaction, get } from 'firebase/database'
import { db } from '../firebase'
import { STARTING_BALANCE } from './constants'

const PERSONAS_KEY = 'countdown-roulette-personas'
const personasPath = () => ref(db, 'roulette/personas')
const personaPath = (id) => ref(db, `roulette/personas/${id}`)

let useFirebase = true

function loadLocal() {
  try {
    const raw = localStorage.getItem(PERSONAS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveLocal(list) {
  localStorage.setItem(PERSONAS_KEY, JSON.stringify(list))
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

/** Subscribe to personas. Falls back to localStorage if Firebase is blocked. */
export function onPersonasChange(callback, onMode) {
  let settled = false
  const emit = (list, mode) => {
    settled = true
    onMode?.(mode)
    callback(list)
  }

  // Always show something immediately so the UI never sticks on Loading
  emit(loadLocal(), 'local')

  const unsub = onValue(
    personasPath(),
    (snapshot) => {
      useFirebase = true
      const data = snapshot.val()
      if (!data) {
        emit(loadLocal(), 'firebase')
        return
      }
      const list = Object.entries(data).map(([id, p]) => ({ id, ...p }))
      list.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))
      saveLocal(list)
      emit(list, 'firebase')
    },
    (err) => {
      console.warn('[roulette] Firebase unavailable, using local wallets:', err?.message || err)
      useFirebase = false
      emit(loadLocal(), 'local')
    }
  )

  const timer = window.setTimeout(() => {
    if (settled) return
    useFirebase = false
    emit(loadLocal(), 'local')
  }, 2500)

  return () => {
    window.clearTimeout(timer)
    unsub()
  }
}

export async function createPersona({ name, emoji, tint }) {
  const persona = {
    name: (name || 'Player').trim().slice(0, 16),
    emoji: emoji || '🎲',
    tint: tint || '#10b981',
    balance: STARTING_BALANCE,
    createdAt: Date.now(),
  }

  if (useFirebase) {
    try {
      const newRef = push(personasPath())
      await set(newRef, persona)
      const full = { id: newRef.key, ...persona }
      const list = loadLocal()
      list.push(full)
      saveLocal(list)
      return full
    } catch (err) {
      console.warn('[roulette] createPersona Firebase failed, local only', err)
      useFirebase = false
    }
  }

  const full = { id: uid(), ...persona }
  const list = loadLocal()
  list.push(full)
  saveLocal(list)
  return full
}

export async function ensurePresetPersona(preset) {
  if (useFirebase) {
    try {
      const snapshot = await get(personasPath())
      const data = snapshot.val() || {}
      const existing = Object.entries(data).find(
        ([, p]) => p.name === preset.name && p.emoji === preset.emoji
      )
      if (existing) return { id: existing[0], ...existing[1] }
      return createPersona(preset)
    } catch (err) {
      console.warn('[roulette] ensurePresetPersona Firebase failed', err)
      useFirebase = false
    }
  }

  const list = loadLocal()
  const existing = list.find((p) => p.name === preset.name && p.emoji === preset.emoji)
  if (existing) return existing
  return createPersona(preset)
}

export async function applySpinResult(personaId, netChange) {
  if (useFirebase) {
    try {
      const balancePath = ref(db, `roulette/personas/${personaId}/balance`)
      const result = await runTransaction(balancePath, (current) => {
        const bal = typeof current === 'number' ? current : STARTING_BALANCE
        const next = Math.round((bal + netChange) * 100) / 100
        return next < 0 ? 0 : next
      })
      await update(personaPath(personaId), { updatedAt: Date.now() })
      const nextBal = result.snapshot.val()
      const list = loadLocal().map((p) =>
        p.id === personaId ? { ...p, balance: nextBal, updatedAt: Date.now() } : p
      )
      saveLocal(list)
      return nextBal
    } catch (err) {
      console.warn('[roulette] applySpinResult Firebase failed', err)
      useFirebase = false
    }
  }

  const list = loadLocal()
  let nextBal = 0
  const updated = list.map((p) => {
    if (p.id !== personaId) return p
    nextBal = Math.max(0, Math.round((Number(p.balance) + netChange) * 100) / 100)
    return { ...p, balance: nextBal, updatedAt: Date.now() }
  })
  saveLocal(updated)
  // Notify listeners by re-reading — page also updates via setPersonas after spin
  return nextBal
}

export async function resetBalance(personaId) {
  if (useFirebase) {
    try {
      await update(personaPath(personaId), {
        balance: STARTING_BALANCE,
        updatedAt: Date.now(),
      })
    } catch (err) {
      console.warn('[roulette] resetBalance Firebase failed', err)
      useFirebase = false
    }
  }

  const updated = loadLocal().map((p) =>
    p.id === personaId ? { ...p, balance: STARTING_BALANCE, updatedAt: Date.now() } : p
  )
  saveLocal(updated)
}

/** After local-only mutations, push latest list into React state */
export function getLocalPersonas() {
  return loadLocal()
}

export function formatCoins(value) {
  return Number(value ?? 0).toFixed(2)
}
