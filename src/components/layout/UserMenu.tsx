import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { signOut } from '@/firebase/auth'

export function UserMenu() {
  const user = useAuth()

  return (
    <div className="flex items-center gap-2">
      {user.photoURL ? (
        <img
          src={user.photoURL}
          alt={user.displayName ?? 'Account'}
          referrerPolicy="no-referrer"
          className="size-6 rounded-full"
        />
      ) : (
        <div className="flex size-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
          {(user.displayName ?? user.email ?? '?').charAt(0).toUpperCase()}
        </div>
      )}
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Sign out"
        title={user.email ?? undefined}
        onClick={() => signOut()}
      >
        <LogOut className="size-4" />
      </Button>
    </div>
  )
}
