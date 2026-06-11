import { Link, useRouterState } from '@tanstack/react-router'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/api/auth'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Menu, LogOut, User, ChevronDown } from 'lucide-react'

interface AppHeaderProps {
  onMenuClick: () => void
}

const ROUTE_LABELS: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/schools': 'Schools',
  '/students': 'Students',
  '/staff': 'Staff',
  '/classes': 'Classes',
  '/attendance': 'Attendance',
  '/fees': 'Fees',
  '/salary': 'Salary',
  '/notices': 'Notices',
  '/results': 'Results',
  '/library': 'Library',
  '/settings': 'Settings',
  '/profile': 'My Profile',
}

function getPageTitle(pathname: string): string {
  if (pathname.startsWith('/schools/new')) return 'Register School'
  if (pathname.match(/^\/schools\/[^/]+$/)) return 'School Detail'
  const base = '/' + pathname.split('/')[1]
  return ROUTE_LABELS[base] ?? 'SMS Bangladesh'
}

export function AppHeader({ onMenuClick }: AppHeaderProps) {
  const { user, refreshToken, logout } = useAuthStore()
  const { location } = useRouterState()

  const handleLogout = async () => {
    try {
      if (refreshToken) await authApi.logout(refreshToken)
    } catch {
      // silent
    } finally {
      logout()
      window.location.href = '/auth/login'
    }
  }

  const initials = user?.phone
    ? user.phone.slice(-4)
    : (user?.email?.slice(0, 2).toUpperCase() ?? '??')

  const displayName = user?.email ?? user?.phone ?? 'User'
  const pageTitle = getPageTitle(location.pathname)

  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-4 md:px-6 shrink-0 gap-3">
      {/* Left: hamburger (mobile) + page title */}
      <div className="flex items-center gap-3 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden h-9 w-9 shrink-0"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="font-semibold text-base truncate">{pageTitle}</h1>
      </div>

      {/* Right: role badge + logout + avatar menu */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Role badge — hide on very small screens */}
        {user?.role && (
          <Badge variant="secondary" className="text-xs hidden sm:inline-flex">
            {user.role.replace(/_/g, ' ')}
          </Badge>
        )}

        {/* Visible logout button — always accessible */}
        <Button
          variant="ghost"
          size="sm"
          className="hidden sm:flex items-center gap-1.5 text-muted-foreground hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden md:inline">Logout</span>
        </Button>

        {/* Avatar dropdown — profile + logout on mobile */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Avatar className="h-8 w-8 cursor-pointer">
              <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <ChevronDown className="h-3 w-3 text-muted-foreground hidden sm:block" />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-semibold truncate">{displayName}</p>
                {user?.phone && user?.email && (
                  <p className="text-xs text-muted-foreground truncate">{user.phone}</p>
                )}
                {user?.role && (
                  <p className="text-xs text-muted-foreground">{user.role.replace(/_/g, ' ')}</p>
                )}
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem>
              <Link to="/profile" className="flex items-center gap-2 w-full">
                <User className="h-4 w-4" />
                My Profile
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Logout always visible here (critical on mobile where the button is hidden) */}
            <DropdownMenuItem data-variant="destructive" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
