import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod/v4'
import { useSchool, useSchoolDashboard, useUpdateSchool, useDeactivateSchool } from '@/features/schools/hooks'
import {
  MANAGEMENT_TYPES, INSTITUTION_TYPES, INSTITUTION_LEVELS,
  MEDIUMS, GENDERS, LOCATION_TYPES, BOARD_AFFILIATIONS, BD_DIVISIONS,
} from '@/features/schools/constants'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SelectField } from '@/components/common/SelectField'
import {
  ArrowLeft, Loader2, Users, GraduationCap, DollarSign,
  Bell, Edit2, AlertTriangle, CheckCircle2,
} from 'lucide-react'

export const Route = createFileRoute('/_authenticated/schools/$schoolId')({
  beforeLoad: () => {
    const raw = localStorage.getItem('sms-auth')
    if (raw) {
      const state = JSON.parse(raw)
      if (state.state?.user?.role !== 'SUPER_ADMIN') {
        throw redirect({ to: '/dashboard' })
      }
    }
  },
  component: SchoolDetailPage,
})

const schema = z.object({
  name: z.string().min(3),
  nameBn: z.string().optional(),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/, 'Only lowercase letters, digits, hyphens'),
  managementType: z.enum(['GOVERNMENT', 'SEMI_GOVERNMENT', 'MPO', 'NON_MPO', 'PRIVATE', 'AUTONOMOUS']),
  institutionType: z.enum(['SCHOOL', 'MADRASA', 'COLLEGE', 'SCHOOL_AND_COLLEGE', 'TECHNICAL']),
  level: z.enum(['PRE_PRIMARY', 'PRIMARY', 'SECONDARY', 'HIGHER_SECONDARY', 'COMBINED']),
  medium: z.enum(['BANGLA', 'ENGLISH', 'BOTH']),
  gender: z.enum(['BOYS', 'GIRLS', 'CO_ED']),
  boardAffiliation: z.enum([
    'DHAKA', 'CHITTAGONG', 'RAJSHAHI', 'COMILLA', 'JESSORE',
    'SYLHET', 'BARISAL', 'DINAJPUR', 'MADRASA', 'TECHNICAL', 'PRIMARY',
  ]).optional(),
  eiin: z.string().optional(),
  banbisCode: z.string().optional(),
  recognitionNo: z.string().optional(),
  establishedYear: z.coerce.number().int().min(1800).max(new Date().getFullYear()).optional().or(z.literal('')),
  phone: z.string().regex(/^01[3-9]\d{8}$/, 'Valid BD phone required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().min(5),
  division: z.string().min(1),
  district: z.string().min(2),
  upazila: z.string().min(2),
  unionParishad: z.string().optional(),
  ward: z.string().optional(),
  postCode: z.string().optional(),
  locationType: z.enum(['CITY_CORPORATION', 'PAURASHAVA', 'UPAZILA_SADAR', 'UNION', 'RURAL']),
})

type FormData = z.infer<typeof schema>

const DIVISION_OPTIONS = BD_DIVISIONS.map((d) => ({ value: d, label: d }))

function StatCard({ label, value, icon: Icon, sub }: {
  label: string; value: number | string; icon: React.ElementType; sub?: string
}) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-2xl font-bold leading-none">{value}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider pb-2 border-b mb-4">
      {children}
    </h2>
  )
}

function SchoolDetailPage() {
  const { schoolId } = Route.useParams()
  const [editing, setEditing] = useState(false)
  const [confirmDeactivate, setConfirmDeactivate] = useState(false)

  const { data: school, isLoading } = useSchool(schoolId)
  const { data: stats } = useSchoolDashboard(schoolId)
  const { mutate: updateSchool, isPending: updating } = useUpdateSchool(schoolId)
  const { mutate: deactivateSchool, isPending: deactivating } = useDeactivateSchool()

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    values: school
      ? {
          name: school.name,
          nameBn: school.nameBn ?? '',
          slug: school.slug,
          managementType: school.managementType,
          institutionType: school.institutionType,
          level: school.level,
          medium: school.medium,
          gender: school.gender,
          boardAffiliation: school.boardAffiliation ?? undefined,
          eiin: school.eiin ?? '',
          banbisCode: school.banbisCode ?? '',
          recognitionNo: school.recognitionNo ?? '',
          establishedYear: school.establishedYear ?? '',
          phone: school.phone,
          email: school.email ?? '',
          address: school.address,
          division: school.division,
          district: school.district,
          upazila: school.upazila,
          unionParishad: school.unionParishad ?? '',
          ward: school.ward ?? '',
          postCode: school.postCode ?? '',
          locationType: school.locationType,
        }
      : undefined,
  })

  const onSubmit = (data: FormData) => {
    const payload = {
      ...data,
      nameBn: data.nameBn || undefined,
      eiin: data.eiin || undefined,
      banbisCode: data.banbisCode || undefined,
      recognitionNo: data.recognitionNo || undefined,
      email: data.email || undefined,
      unionParishad: data.unionParishad || undefined,
      ward: data.ward || undefined,
      postCode: data.postCode || undefined,
      establishedYear: data.establishedYear ? Number(data.establishedYear) : undefined,
    }
    updateSchool(payload as any, { onSuccess: () => setEditing(false) })
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading school…
      </div>
    )
  }

  if (!school) {
    return (
      <div className="text-center py-16 text-muted-foreground text-sm">
        School not found.
        <Link to="/schools"><Button variant="link">Back to list</Button></Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link to="/schools">
            <Button variant="ghost" size="icon" className="h-8 w-8 mt-0.5">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{school.name}</h1>
            {school.nameBn && (
              <p className="text-sm text-muted-foreground">{school.nameBn}</p>
            )}
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={school.isActive ? 'secondary' : 'outline'}>
                {school.isActive ? 'Active' : 'Inactive'}
              </Badge>
              <Badge variant="outline">{school.managementType.replace('_', ' ')}</Badge>
              {school.eiin && <span className="text-xs text-muted-foreground">EIIN: {school.eiin}</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!editing && (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              <Edit2 className="h-4 w-4 mr-1.5" /> Edit
            </Button>
          )}
          {school.isActive && !editing && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setConfirmDeactivate(true)}
            >
              Deactivate
            </Button>
          )}
        </div>
      </div>

      {/* Deactivate confirm */}
      {confirmDeactivate && (
        <Card className="border-destructive">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium">Deactivate this school?</p>
              <p className="text-xs text-muted-foreground mt-1">
                All access for users of this school will be suspended. This cannot be undone from the UI.
              </p>
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={deactivating}
                  onClick={() => deactivateSchool(schoolId)}
                >
                  {deactivating && <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />}
                  Yes, deactivate
                </Button>
                <Button size="sm" variant="outline" onClick={() => setConfirmDeactivate(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Students" value={stats.totalStudents} icon={GraduationCap} />
          <StatCard label="Staff" value={stats.totalStaff} icon={Users} />
          <StatCard
            label="Today's Attendance"
            value={`${stats.todayStudentAttendance.percentage}%`}
            icon={CheckCircle2}
            sub={`${stats.todayStudentAttendance.present} present`}
          />
          <StatCard
            label="Fee Due"
            value={`৳${Number(stats.totalFeeDue).toLocaleString()}`}
            icon={DollarSign}
          />
          <div className="col-span-2 md:col-span-4">
            <StatCard label="Active Notices" value={stats.activeNotices} icon={Bell} />
          </div>
        </div>
      )}

      {/* View / Edit form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">

          <div>
            <SectionTitle>Basic Information</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>School Name (English)</FormLabel>
                  <FormControl><Input {...field} disabled={!editing} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="nameBn" render={({ field }) => (
                <FormItem>
                  <FormLabel>School Name (Bengali) <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                  <FormControl><Input {...field} disabled={!editing} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="slug" render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl><Input {...field} disabled={!editing} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <SelectField control={form.control} name="managementType" label="Management Type" options={MANAGEMENT_TYPES} disabled={!editing} />
              <SelectField control={form.control} name="institutionType" label="Institution Type" options={INSTITUTION_TYPES} disabled={!editing} />
            </div>
          </div>

          <div>
            <SectionTitle>Academic Details</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField control={form.control} name="level" label="Level" options={INSTITUTION_LEVELS} disabled={!editing} />
              <SelectField control={form.control} name="medium" label="Medium" options={MEDIUMS} disabled={!editing} />
              <SelectField control={form.control} name="gender" label="Gender" options={GENDERS} disabled={!editing} />
              <SelectField control={form.control} name="boardAffiliation" label="Board Affiliation" options={BOARD_AFFILIATIONS} optional disabled={!editing} />
              <FormField control={form.control} name="establishedYear" render={({ field }) => (
                <FormItem>
                  <FormLabel>Established Year <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                  <FormControl><Input type="number" {...field} disabled={!editing} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </div>

          <div>
            <SectionTitle>Identification</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField control={form.control} name="eiin" render={({ field }) => (
                <FormItem>
                  <FormLabel>EIIN <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                  <FormControl><Input {...field} disabled={!editing} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="banbisCode" render={({ field }) => (
                <FormItem>
                  <FormLabel>BANBEIS Code <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                  <FormControl><Input {...field} disabled={!editing} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="recognitionNo" render={({ field }) => (
                <FormItem>
                  <FormLabel>Recognition No. <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                  <FormControl><Input {...field} disabled={!editing} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </div>

          <div>
            <SectionTitle>Location</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Address</FormLabel>
                  <FormControl><Input {...field} disabled={!editing} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <SelectField control={form.control} name="division" label="Division" options={DIVISION_OPTIONS} disabled={!editing} />
              <FormField control={form.control} name="district" render={({ field }) => (
                <FormItem>
                  <FormLabel>District</FormLabel>
                  <FormControl><Input {...field} disabled={!editing} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="upazila" render={({ field }) => (
                <FormItem>
                  <FormLabel>Upazila</FormLabel>
                  <FormControl><Input {...field} disabled={!editing} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <SelectField control={form.control} name="locationType" label="Location Type" options={LOCATION_TYPES} disabled={!editing} />
              <FormField control={form.control} name="unionParishad" render={({ field }) => (
                <FormItem>
                  <FormLabel>Union Parishad <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                  <FormControl><Input {...field} disabled={!editing} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="ward" render={({ field }) => (
                <FormItem>
                  <FormLabel>Ward <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                  <FormControl><Input {...field} disabled={!editing} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="postCode" render={({ field }) => (
                <FormItem>
                  <FormLabel>Post Code <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                  <FormControl><Input {...field} disabled={!editing} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </div>

          <div>
            <SectionTitle>Contact</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl><Input {...field} disabled={!editing} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                  <FormControl><Input type="email" {...field} disabled={!editing} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </div>

          {editing && (
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button type="submit" disabled={updating}>
                {updating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
              <Button type="button" variant="outline" onClick={() => { form.reset(); setEditing(false) }}>
                Cancel
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  )
}
