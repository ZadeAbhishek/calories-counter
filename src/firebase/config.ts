import { initializeApp } from 'firebase/app'
import {
  connectFirestoreEmulator,
  initializeFirestore,
  persistentLocalCache,
  persistentSingleTabManager,
} from 'firebase/firestore'
import { connectAuthEmulator, getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error(
    'Missing Firebase config. Copy .env.local.example to .env.local and fill in your Firebase project values.',
  )
}

export const app = initializeApp(firebaseConfig)
export const db = initializeFirestore(app, {
  // Queues writes locally and serves cached reads across brief network
  // drops (e.g. phone switching wifi/cellular) instead of failing outright.
  localCache: persistentLocalCache({ tabManager: persistentSingleTabManager({}) }),
})
export const auth = getAuth(app)

// Optional, off by default: point the app at `firebase emulators:start`
// instead of the real project, for local testing without touching real data.
if (import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
  connectFirestoreEmulator(db, '127.0.0.1', 8080)
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
}
