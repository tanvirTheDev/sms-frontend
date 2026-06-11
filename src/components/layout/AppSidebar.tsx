import { Link, useRouterState } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import type { UserRole } from '@/types'
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, DollarSign, Bell,
  Settings, School, ClipboardList, TrendingUp, UserCheck, Library, X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface NavItem {
  to: string
  label: string
  icon: React.ElementType
  roles: UserRole[]
}

const allNavItems: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER', 'ACCOUNTANT', 'OFFICE_STAFF', 'LIBRARIAN', 'STUDENT', 'PARENT', 'GUARDIAN'] },
  { to: '/schools', label: 'Schools', icon: School, roles: ['SUPER_ADMIN'] },
  { to: '/students', label: 'Students', icon: GraduationCap, roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER', 'OFFICE_STAFF', 'ACCOUNTANT'] },
  { to: '/staff', label: 'Staff', icon: Users, roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'OFFICE_STAFF'] },
  { to: '/classes', label: 'Classes', icon: BookOpen, roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER'] },
  { to: '/attendance', label: 'Attendance', icon: UserCheck, roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER', 'OFFICE_STAFF'] },
  { to: '/fees', label: 'Fees', icon: DollarSign, roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'ACCOUNTANT', 'OFFICE_STAFF', 'PARENT', 'GUARDIAN'] },
  { to: '/salary', label: 'Salary', icon: TrendingUp, roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'ACCOUNTANT'] },
  { to: '/notices', label: 'Notices', icon: Bell, roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER', 'OFFICE_STAFF', 'STUDENT', 'PARENT', 'GUARDIAN'] },
  { to: '/results', label: 'Results', icon: ClipboardList, roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT', 'PARENT', 'GUARDIAN'] },
  { to: '/library', label: 'Library', icon: Library, roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'LIBRARIAN', 'STUDENT'] },
  { to: '/settings', label: 'Settings', icon: Settings, roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'] },
]

interface AppSidebarProps {
  mobileOpen?: boolean
  onClose?: () => void
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const { location } = useRouterState()
  const { user } = useAuthStore()
  const role = user?.role

  const visibleItems = role ? allNavItems.filter((item) => item.roles.includes(role)) : []

  return (
    <div className="flex flex-col h-full">
      {/* Logo row */}
      <div className="h-16 flex items-center justify-between px-4 border-b shrink-0">
        <div className="flex items-center gap-2">
          <School className="h-6 w-6 text-primary" />
          <div className="flex flex-col">
            <span className="font-semibold text-sm leading-tight">SMS Bangladesh</span>
            {role && (
              <span className="text-[10px] text-muted-foreground leading-tight">
                {role.replace(/_/g, ' ')}
              </span>
            )}
          </div>
        </div>
        {/* Close button only in mobile drawer */}
        {onClose && (
          <Button variant="ghost" size="icon" className="h-8 w-8 lg:hidden" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {visibleItems.map(({ to, label, icon: Icon }) => {
          const isActive = location.pathname === to || location.pathname.startsWith(to + '/')
          return (
            <Link
              key={to}
              to={to}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

export function AppSidebar({ mobileOpen = false, onClose }: AppSidebarProps) {
  return (
    <>
      {/* Desktop sidebar — always visible on lg+ */}
      <aside className="hidden lg:flex w-60 shrink-0 border-r bg-card flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile drawer — fixed overlay */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={onClose}
          />
          {/* Drawer */}
          <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-card border-r flex flex-col lg:hidden shadow-xl">
            <SidebarContent onClose={onClose} />
          </aside>
        </>
      )}
    </>
  )
}
