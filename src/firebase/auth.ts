import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
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
  // Popup rather than a redirect: signInWithRedirect relies on browser
  // storage surviving a full navigation away to Google and back, which is
  // unreliable in installed iOS home-screen PWAs (the round trip can land
  // back in a different storage context, silently losing the pending
  // sign-in). A popup keeps the app's page alive the whole time instead.
  return signInWithPopup(auth, new GoogleAuthProvider())
}

export function signOut() {
  return firebaseSignOut(auth)
}
