import { createContext, useContext } from 'react'

export interface AuthUser {
  uid: string
  displayName: string | null
  email: string | null
  photoURL: string | null
}

export const AuthContext = createContext<AuthUser | null>(null)

/** Only ever rendered under AuthGate once a real user is signed in, so a
 * null context here means a real bug (used outside the gate), not a valid
 * "not signed in yet" state — that's handled by AuthGate itself. */
export function useAuth(): AuthUser {
  const user = useContext(AuthContext)
  if (!user) {
    throw new Error('useAuth() must be used within AuthGate')
  }
  return user
}
