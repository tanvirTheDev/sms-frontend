import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
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
    throw redirect({ to: '/auth/login' })
  },
  component: () => null,
})
