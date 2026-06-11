import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod/v4'
import { useAuthStore } from '@/store/authStore'
import { useMe } from '@/features/auth/hooks'
import { authApi } from '@/api/auth'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Phone, Mail, Shield, Building2, CheckCircle2, XCircle, Loader2, KeyRound } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/profile')({
  component: ProfilePage,
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Required'),
  newPassword: z.string().min(8, 'At least 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type PasswordForm = z.infer<typeof passwordSchema>

const ROLE_DESCRIPTIONS: Record<string, string> = {
  SUPER_ADMIN: 'Full platform access — manages all schools',
  SCHOOL_ADMIN: 'Manages one school — students, staff, fees',
  PRINCIPAL: 'School principal — academic & administrative access',
  TEACHER: 'Class teacher — attendance, results, notices',
  ACCOUNTANT: 'Finance access — fees, salary, expenses',
  OFFICE_STAFF: 'Office admin — students, attendance, notices',
  LIBRARIAN: 'Library management',
  PARENT: 'Parent — view child info, fees, notices',
  GUARDIAN: 'Guardian — same as parent',
  STUDENT: 'Student — view own info, results, notices',
}

export default function ProfilePage() {
  const { user, logout } = useAuthStore()
  const { isLoading } = useMe()
  const [changingPassword, setChangingPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })

  const handleLogout = async () => {
    logout()
    window.location.href = '/auth/login'
  }

  const onChangePassword = async (data: PasswordForm) => {
    setSubmitting(true)
    try {
      // Call change password endpoint when available
      await authApi.forgotPassword({ phone: user?.phone ?? '' })
      toast.success('Password change request sent to your phone')
      form.reset()
      setChangingPassword(false)
    } catch {
      toast.error('Failed to change password')
    } finally {
      setSubmitting(false)
    }
  }

  const initials = user?.phone
    ? user.phone.slice(-4)
    : (user?.email?.slice(0, 2).toUpperCase() ?? '??')

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading profile…
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16">
      {/* Profile card */}
      <Card>
        <CardContent className="pt-6 pb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Avatar */}
            <div className="relative shrink-0">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-xl font-bold bg-primary text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {user?.isVerified && (
                <CheckCircle2 className="absolute -bottom-1 -right-1 h-5 w-5 text-green-500 bg-background rounded-full" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div>
                <h2 className="text-xl font-bold">
                  {user?.email?.split('@')[0] ?? user?.phone ?? 'User'}
                </h2>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1">
                  {user?.role && (
                    <Badge variant="secondary">{user.role.replace(/_/g, ' ')}</Badge>
                  )}
                  <Badge variant={user?.isActive ? 'outline' : 'destructive'} className="text-xs">
                    {user?.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  {user?.isVerified && (
                    <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
              {user?.role && (
                <p className="text-sm text-muted-foreground">
                  {ROLE_DESCRIPTIONS[user.role] ?? user.role}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Phone className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="text-sm font-medium">{user?.phone ?? '—'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{user?.email ?? 'Not set'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Shield className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Role</p>
                <p className="text-sm font-medium">{user?.role?.replace(/_/g, ' ') ?? '—'}</p>
              </div>
            </div>

            {user?.schoolId && (
              <div className="flex items-start gap-3">
                <Building2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">School ID</p>
                  <p className="text-sm font-medium font-mono text-xs">{user.schoolId}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Verification</p>
                <p className="text-sm font-medium flex items-center gap-1">
                  {user?.isVerified
                    ? <><CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> Verified</>
                    : <><XCircle className="h-3.5 w-3.5 text-destructive" /> Not verified</>
                  }
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Shield className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Account Status</p>
                <p className="text-sm font-medium">
                  {user?.isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <KeyRound className="h-4 w-4" /> Change Password
            </CardTitle>
            {!changingPassword && (
              <Button variant="outline" size="sm" onClick={() => setChangingPassword(true)}>
                Change
              </Button>
            )}
          </div>
        </CardHeader>

        {changingPassword && (
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onChangePassword)} className="space-y-4">
                <FormField control={form.control} name="currentPassword" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="newPassword" render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="flex gap-2 pt-2">
                  <Button type="submit" size="sm" disabled={submitting}>
                    {submitting && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
                    Update Password
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => { form.reset(); setChangingPassword(false) }}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        )}
      </Card>

      {/* Danger zone */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base text-destructive">Sign Out</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Sign out of your account on this device.
          </p>
          <Button variant="destructive" onClick={handleLogout}>
            <XCircle className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
