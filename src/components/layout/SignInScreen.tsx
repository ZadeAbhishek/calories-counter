import { useState } from 'react'
import { Dumbbell } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { signInWithGoogle } from '@/firebase/auth'

export function SignInScreen() {
  const [signingIn, setSigningIn] = useState(false)

  async function handleSignIn() {
    setSigningIn(true)
    try {
      await signInWithGoogle()
      // Page navigates away for the redirect; nothing else to do here.
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : 'Google sign-in failed')
      setSigningIn(false)
    }
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
        <Dumbbell className="size-8" />
      </div>
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold">Fitness Tracker</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to track your workouts, food, and progress.
        </p>
      </div>
      <Button onClick={handleSignIn} disabled={signingIn} className="w-full max-w-xs">
        {signingIn ? 'Signing in...' : 'Sign in with Google'}
      </Button>
    </div>
  )
}
