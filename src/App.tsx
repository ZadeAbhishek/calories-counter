import { lazy, Suspense, useState } from 'react'
import { AuthGate } from '@/components/layout/AuthGate'
import { BottomTabBar } from '@/components/layout/BottomTabBar'
import { PageContainer } from '@/components/layout/PageContainer'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { UserMenu } from '@/components/layout/UserMenu'
import { Toaster } from '@/components/ui/sonner'
import { useDailyReminder } from '@/hooks/useDailyReminder'
import type { TabKey } from '@/lib/constants'

// Each tab pulls in its own heavy libraries (Recharts, dnd-kit) — code-split
// so only the active tab's bundle loads, keeping the first load light.
const GymTab = lazy(() =>
  import('@/components/gym/GymTab').then((m) => ({ default: m.GymTab })),
)
const FoodTab = lazy(() =>
  import('@/components/food/FoodTab').then((m) => ({ default: m.FoodTab })),
)
const SettingsTab = lazy(() =>
  import('@/components/settings/SettingsTab').then((m) => ({
    default: m.SettingsTab,
  })),
)

function AppContent() {
  const [tab, setTab] = useState<TabKey>('gym')
  useDailyReminder()

  return (
    <>
      <div className="sticky top-0 z-40 mx-auto flex w-full max-w-xl items-center justify-between bg-background/95 px-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <UserMenu />
        <ThemeToggle />
      </div>
      <PageContainer>
        <Suspense fallback={null}>
          {tab === 'gym' && <GymTab />}
          {tab === 'food' && <FoodTab />}
          {tab === 'settings' && <SettingsTab />}
        </Suspense>
      </PageContainer>
      <BottomTabBar active={tab} onChange={setTab} />
    </>
  )
}

function App() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <AuthGate>
        <AppContent />
      </AuthGate>
      <Toaster position="top-center" />
    </div>
  )
}

export default App
