import { initializeApp } from 'firebase/app'
import { getDatabase, ref, set, onValue, get } from 'firebase/database'
import runnersData from './data/runners.json'

const firebaseConfig = {
  apiKey: "AIzaSyC16fZK0I9eQjKybvcTaPgcaRvvygyAIHo",
  authDomain: "training-marathon-3dfb6.firebaseapp.com",
  databaseURL: "https://training-marathon-3dfb6-default-rtdb.firebaseio.com",
  projectId: "training-marathon-3dfb6",
  storageBucket: "training-marathon-3dfb6.firebasestorage.app",
  messagingSenderId: "327112605828",
  appId: "1:327112605828:web:c21b42a36cdaec13ca42d1",
}

const app = initializeApp(firebaseConfig)
const db = getDatabase(app)

// Seed database with initial data if empty
export async function seedIfEmpty() {
  const snapshot = await get(ref(db, 'runners'))
  if (!snapshot.exists()) {
    // Convert array to object keyed by id
    const runnersObj = {}
    runnersData.runners.forEach((r) => {
      runnersObj[r.id] = r
    })
    await set(ref(db, 'runners'), runnersObj)
    await set(ref(db, 'teamStats'), runnersData.teamStats)
  }
}

// Listen to runners data in real-time
export function onRunnersChange(callback) {
  return onValue(ref(db, 'runners'), (snapshot) => {
    const data = snapshot.val()
    if (data) {
      // Convert object back to array
      const arr = Object.values(data).map((r) => ({
        ...r,
        gradient: `linear-gradient(135deg, ${r.gradientFrom}, ${r.gradientTo})`,
      }))
      arr.sort((a, b) => a.id - b.id)
      callback(arr)
    }
  })
}

// Listen to team stats in real-time
export function onTeamStatsChange(callback) {
  return onValue(ref(db, 'teamStats'), (snapshot) => {
    const data = snapshot.val()
    if (data) callback(data)
  })
}

// Update a single runner's data
export async function updateRunner(runnerId, updatedFields) {
  await set(ref(db, `runners/${runnerId}`), updatedFields)
}

// Update team stats
export async function updateTeamStats(stats) {
  await set(ref(db, 'teamStats'), stats)
}

export { db }
