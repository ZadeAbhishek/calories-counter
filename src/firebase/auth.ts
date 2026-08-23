import {
  onAuthStateChanged,
  signInAnonymously,
  type User,
} from 'firebase/auth'
import { auth } from '@/firebase/config'

export function subscribeToAuthReady(
  callback: (user: User | null) => void,
): () => void {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      callback(user)
      return
    }
    // No visible login screen: sign in anonymously in the background so
    // Firestore security rules can require an authenticated request.
    signInAnonymously(auth).catch((error) => {
      console.error('Anonymous sign-in failed:', error)
    })
  })
  return unsubscribe
}
