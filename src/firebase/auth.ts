import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithRedirect,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth'
import { auth } from '@/firebase/config'

export function subscribeToAuthState(
  callback: (user: User | null) => void,
): () => void {
  return onAuthStateChanged(auth, callback)
}

export function signInWithGoogle() {
  // Redirect rather than a popup: popups are unreliable in installed PWAs
  // (notably iOS home-screen apps), where they're often silently blocked.
  return signInWithRedirect(auth, new GoogleAuthProvider())
}

export function signOut() {
  return firebaseSignOut(auth)
}
