import type { ReactNode } from 'react'
import { useAuthReady } from '@/hooks/useAuthReady'

export function AuthGate({ children }: { children: ReactNode }) {
  const { ready } = useAuthReady()

  if (!ready) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return <>{children}</>
}
