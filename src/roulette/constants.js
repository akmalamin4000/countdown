/** Classic CS-style wheel: purple on both sides of green, then 6 red / 6 black */
export const WHEEL = [
  { id: 0, color: 'purple', label: '0' },
  { id: 1, color: 'green', label: '1' },
  { id: 2, color: 'purple', label: '2' },
  { id: 3, color: 'red', label: '3' },
  { id: 4, color: 'black', label: '4' },
  { id: 5, color: 'red', label: '5' },
  { id: 6, color: 'black', label: '6' },
  { id: 7, color: 'red', label: '7' },
  { id: 8, color: 'black', label: '8' },
  { id: 9, color: 'red', label: '9' },
  { id: 10, color: 'black', label: '10' },
  { id: 11, color: 'red', label: '11' },
  { id: 12, color: 'black', label: '12' },
  { id: 13, color: 'red', label: '13' },
  { id: 14, color: 'black', label: '14' },
]

export const BETS = {
  red: { label: 'Red', multiplier: 2 },
  black: { label: 'Black', multiplier: 2 },
  purple: { label: 'Purple', multiplier: 7 },
  green: { label: 'Green', multiplier: 14 },
}

export const CHIP_AMOUNTS = [0.01, 0.1, 0.25, 1, 5, 10, 25, 50]
export const MIN_CHIP = 0.01
export const STARTING_BALANCE = 100
export const TILE_WIDTH = 80
export const LOCAL_PERSONA_KEY = 'countdown-roulette-persona'

export const PRESET_PERSONAS = [
  { emoji: '⚡', name: 'Meyn', tint: '#ff6b35' },
  { emoji: '🔥', name: 'Harun', tint: '#00d4ff' },
  { emoji: '🎯', name: 'Nazif', tint: '#a855f7' },
  { emoji: '👻', name: 'Ghost', tint: '#94a3b8' },
  { emoji: '🎲', name: 'Lucky', tint: '#10b981' },
  { emoji: '👑', name: 'King', tint: '#eab308' },
]
