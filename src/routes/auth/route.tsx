import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/auth')({
  beforeLoad: () => {
    const raw = localStorage.getItem('sms-auth')
    if (raw) {
      try {
        const state = JSON.parse(raw)
        if (state.state?.isAuthenticated) {
          throw redirect({ to: '/dashboard' })
        }
      } catch (e) {
        if (e instanceof Response) throw e
      }
    }
  },
  component: AuthLayout,
})

function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight">School Management System</h1>
          <p className="text-sm text-muted-foreground mt-1">Bangladesh</p>
        </div>
        <Outlet />
      </div>
    </div>
  )
}
