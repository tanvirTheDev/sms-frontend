import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { useState } from 'react'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { AppHeader } from '@/components/layout/AppHeader'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: () => {
    const raw = localStorage.getItem('sms-auth')
    if (!raw) throw redirect({ to: '/auth/login' })
    try {
      const state = JSON.parse(raw)
      if (!state.state?.isAuthenticated) {
        throw redirect({ to: '/auth/login' })
      }
    } catch (e) {
      if (e instanceof Response) throw e
      throw redirect({ to: '/auth/login' })
    }
  },
  component: AppLayout,
})

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <AppHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
