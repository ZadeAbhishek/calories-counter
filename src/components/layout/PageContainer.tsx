import type { ReactNode } from 'react'

export function PageContainer({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-xl px-4 pt-4 pb-24">{children}</div>
  )
}
