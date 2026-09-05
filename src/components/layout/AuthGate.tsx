import { useEffect, useState, type ReactNode } from 'react'
import { AuthContext, type AuthUser } from '@/contexts/AuthContext'
import { SignInScreen } from '@/components/layout/SignInScreen'
import { subscribeToAuthState } from '@/firebase/auth'
import { migrateLegacyDataIfNeeded } from '@/lib/migrateLegacyData'

type Status =
  | { state: 'loading' }
  | { state: 'signed-out' }
  | { state: 'migrating'; user: AuthUser }
  | { state: 'ready'; user: AuthUser }

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}

export function AuthGate({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>({ state: 'loading' })

  useEffect(() => {
    const unsubscribe = subscribeToAuthState((firebaseUser) => {
      if (!firebaseUser) {
        setStatus({ state: 'signed-out' })
        return
      }
      setStatus({
        state: 'migrating',
        user: {
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
        },
      })
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    if (status.state !== 'migrating') return
    let cancelled = false
    migrateLegacyDataIfNeeded(status.user.uid)
      .catch((error) => console.error('Legacy data migration failed:', error))
      .finally(() => {
        if (!cancelled) setStatus({ state: 'ready', user: status.user })
      })
    return () => {
      cancelled = true
    }
  }, [status])

  if (status.state === 'loading') return <LoadingScreen label="Loading..." />
  if (status.state === 'signed-out') return <SignInScreen />
  if (status.state === 'migrating') {
    return <LoadingScreen label="Setting up your account..." />
  }

  return <AuthContext.Provider value={status.user}>{children}</AuthContext.Provider>
}
