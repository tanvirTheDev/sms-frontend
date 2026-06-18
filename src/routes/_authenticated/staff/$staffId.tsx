import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod/v4'
import { format } from 'date-fns'
import { useAuthStore } from '@/store/authStore'
import {
  useStaffMember, useUpdateStaff, useDeactivateStaff,
  useServiceBook, useCreateServiceBookEntry, useDeleteServiceBookEntry,
} from '@/features/staff/hooks'
import {
  STAFF_ROLE_OPTIONS, RELIGIONS, BLOOD_GROUPS, MPO_STATUSES, GENDERS, STAFF_ROLES,
  SERVICE_BOOK_ENTRY_TYPES, SERVICE_BOOK_TYPE_COLORS,
} from '@/features/staff/constants'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { SelectField } from '@/components/common/SelectField'
import {
  ArrowLeft, Edit2, Loader2, AlertTriangle, Phone, Mail,
  Briefcase, Calendar, User, BookOpen, Plus, Trash2, ClipboardList,
} from 'lucide-react'
import type { ServiceBookEntryType } from '@/types/staff'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_authenticated/staff/$staffId')({
  component: StaffDetailPage,
})

const bdPhone = z.string().regex(/^01[3-9]\d{8}$/, 'Valid BD phone required')

const schema = z.object({
  name: z.string().min(2).max(100),
  nameBn: z.string().max(100).optional().or(z.literal('')),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  religion: z.enum(['ISLAM', 'HINDUISM', 'CHRISTIANITY', 'BUDDHISM', 'OTHER']).optional(),
  bloodGroup: z.enum(['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE']).optional(),
  dateOfBirth: z.string().date().optional().or(z.literal('')),
  nid: z.string().regex(/^\d{10}(\d{7})?$/).optional().or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal('')),
  phone: bdPhone,
  email: z.string().email().optional().or(z.literal('')),
  designation: z.string().min(2).max(100),
  role: z.enum([
    'PRINCIPAL', 'HEADMASTER', 'VICE_PRINCIPAL', 'ASSISTANT_HEADMASTER',
    'SENIOR_TEACHER', 'TEACHER', 'ASSISTANT_TEACHER', 'LECTURER', 'DEMONSTRATOR',
    'LIBRARIAN', 'LAB_ASSISTANT', 'COMPUTER_OPERATOR', 'ACCOUNTANT',
    'OFFICE_ASSISTANT', 'PEON', 'GUARD',
  ]),
  joiningDate: z.string().date(),
  employeeId: z.string().max(50).optional().or(z.literal('')),
  indexNo: z.string().max(50).optional().or(z.literal('')),
  mpoStatus: z.enum(['GOVERNMENT', 'SEMI_GOVERNMENT', 'MPO', 'NON_MPO', 'PRIVATE', 'AUTONOMOUS']).optional(),
  mpoIndex: z.string().max(50).optional().or(z.literal('')),
  tin: z.string().regex(/^\d{12}$/).optional().or(z.literal('')),
  subjectSpec: z.string().max(200).optional().or(z.literal('')),
})

type FormData = z.infer<typeof schema>

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider pb-2 border-b mb-4">
        {title}
      </h2>
      {children}
    </div>
  )
}

function StaffDetailPage() {
  const { staffId } = Route.useParams()
  const { user } = useAuthStore()
  const schoolId = user?.schoolId ?? ''
  const [editing, setEditing] = useState(false)
  const [confirmDeactivate, setConfirmDeactivate] = useState(false)
  const [showAddEntry, setShowAddEntry] = useState(false)
  const [sbType, setSbType] = useState<ServiceBookEntryType>('JOINING')
  const [sbDate, setSbDate] = useState('')
  const [sbDesc, setSbDesc] = useState('')
  const [sbRef, setSbRef] = useState('')

  const { data: staff, isLoading } = useStaffMember(schoolId, staffId)
  const { mutate: updateStaff, isPending: updating } = useUpdateStaff(schoolId, staffId)
  const { mutate: deactivateStaff, isPending: deactivating } = useDeactivateStaff(schoolId)
  const { data: serviceBook = [] } = useServiceBook(schoolId, staffId)
  const { mutate: addEntry, isPending: addingEntry } = useCreateServiceBookEntry(schoolId, staffId)
  const { mutate: deleteEntry } = useDeleteServiceBookEntry(schoolId, staffId)

  const canManage = user?.role && ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'].includes(user.role)

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '', nameBn: '', nid: '', address: '',
      phone: '', email: '', designation: '',
      joiningDate: '', employeeId: '', indexNo: '',
      mpoIndex: '', tin: '', subjectSpec: '', dateOfBirth: '',
    },
    values: staff
      ? {
          name: staff.name,
          nameBn: staff.nameBn ?? '',
          gender: staff.gender,
          religion: staff.religion ?? undefined,
          bloodGroup: staff.bloodGroup ?? undefined,
          dateOfBirth: staff.dateOfBirth ? staff.dateOfBirth.slice(0, 10) : '',
          nid: staff.nid ?? '',
          address: staff.address ?? '',
          phone: staff.phone,
          email: staff.email ?? '',
          designation: staff.designation,
          role: staff.role,
          joiningDate: staff.joiningDate ? staff.joiningDate.slice(0, 10) : '',
          employeeId: staff.employeeId ?? '',
          indexNo: staff.indexNo ?? '',
          mpoStatus: staff.mpoStatus ?? undefined,
          mpoIndex: staff.mpoIndex ?? '',
          tin: staff.tin ?? '',
          subjectSpec: staff.subjectSpec ?? '',
        }
      : undefined,
  })

  const onSubmit = (data: FormData) => {
    const clean = (v?: string) => v || undefined
    const payload = {
      name: data.name,
      nameBn: clean(data.nameBn),
      gender: data.gender,
      religion: data.religion,
      bloodGroup: data.bloodGroup,
      dateOfBirth: clean(data.dateOfBirth),
      nid: clean(data.nid),
      address: clean(data.address),
      phone: data.phone,
      email: clean(data.email),
      designation: data.designation,
      role: data.role,
      joiningDate: data.joiningDate,
      employeeId: clean(data.employeeId),
      indexNo: clean(data.indexNo),
      mpoStatus: data.mpoStatus,
      mpoIndex: clean(data.mpoIndex),
      tin: clean(data.tin),
      subjectSpec: clean(data.subjectSpec),
    }
    updateStaff(payload as any, { onSuccess: () => setEditing(false) })
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading staff member…
      </div>
    )
  }

  if (!staff) {
    return (
      <div className="text-center py-16 text-sm text-muted-foreground">
        Staff member not found.
        <Link to="/staff"><Button variant="link">Back to list</Button></Link>
      </div>
    )
  }

  const roleLabel = STAFF_ROLES.find(r => r.value === staff.role)?.label ?? staff.role
  const isMpo = staff.mpoStatus === 'MPO'
  const joiningYear = new Date(staff.joiningDate).getFullYear()

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link to="/staff">
            <Button variant="ghost" size="icon" className="h-8 w-8 mt-0.5">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold text-base">
              {staff.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold leading-snug">{staff.name}</h1>
              {staff.nameBn && <p className="text-sm text-muted-foreground">{staff.nameBn}</p>}
              <div className="flex flex-wrap gap-1.5 mt-1">
                <Badge variant="secondary">{roleLabel}</Badge>
                <Badge variant={staff.isActive ? 'outline' : 'destructive'}>
                  {staff.isActive ? 'Active' : 'Inactive'}
                </Badge>
                {isMpo && <Badge variant="default">MPO</Badge>}
              </div>
            </div>
          </div>
        </div>

        {canManage && !editing && (
          <div className="flex gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              <Edit2 className="h-4 w-4 mr-1.5" /> Edit
            </Button>
            {staff.isActive && (
              <Button variant="destructive" size="sm" onClick={() => setConfirmDeactivate(true)}>
                Deactivate
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Deactivate confirm */}
      {confirmDeactivate && (
        <Card className="border-destructive/40">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium">Deactivate this staff member?</p>
              <p className="text-xs text-muted-foreground mt-1">
                Their login access will be suspended. This action cannot be undone from the UI.
              </p>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="destructive" disabled={deactivating}
                  onClick={() => deactivateStaff(staffId)}>
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

      {/* Quick info cards */}
      {!editing && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-3 flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-[10px] text-muted-foreground">Phone</p>
                <p className="text-sm font-medium">{staff.phone}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-[10px] text-muted-foreground">Designation</p>
                <p className="text-sm font-medium truncate">{staff.designation}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-[10px] text-muted-foreground">Joined</p>
                <p className="text-sm font-medium">{joiningYear}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-[10px] text-muted-foreground">Gender</p>
                <p className="text-sm font-medium capitalize">{staff.gender.toLowerCase()}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Subjects (if any) */}
      {!editing && staff.classSubjects?.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Assigned Subjects</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {staff.classSubjects.map((cs) => (
                <Badge key={cs.id} variant="outline" className="text-xs">
                  {cs.subject.name} — {cs.class.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Email info (view only) */}
      {!editing && staff.email && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Mail className="h-4 w-4" />
          {staff.email}
        </div>
      )}

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">

          <Section title="Personal Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Full Name (English)</FormLabel>
                  <FormControl><Input {...field} disabled={!editing} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="nameBn" render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name (Bengali) <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                  <FormControl><Input {...field} disabled={!editing} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <SelectField control={form.control} name="gender" label="Gender" options={GENDERS} disabled={!editing} />
              <SelectField control={form.control} name="religion" label="Religion" options={RELIGIONS} optional disabled={!editing} />
              <SelectField control={form.control} name="bloodGroup" label="Blood Group" options={BLOOD_GROUPS} optional disabled={!editing} />
              <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                  <FormControl><Input type="date" {...field} disabled={!editing} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="nid" render={({ field }) => (
                <FormItem>
                  <FormLabel>NID <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                  <FormControl><Input {...field} disabled={!editing} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Address <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                  <FormControl><Input {...field} disabled={!editing} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </Section>

          <Section title="Contact">
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
          </Section>

          <Section title="Employment">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="designation" render={({ field }) => (
                <FormItem>
                  <FormLabel>Designation</FormLabel>
                  <FormControl><Input {...field} disabled={!editing} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <SelectField control={form.control} name="role" label="Staff Role" options={STAFF_ROLE_OPTIONS} disabled={!editing} />
              <FormField control={form.control} name="joiningDate" render={({ field }) => (
                <FormItem>
                  <FormLabel>Joining Date</FormLabel>
                  <FormControl><Input type="date" {...field} disabled={!editing} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="employeeId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee ID <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                  <FormControl><Input {...field} disabled={!editing} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="indexNo" render={({ field }) => (
                <FormItem>
                  <FormLabel>Index No. <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                  <FormControl><Input {...field} disabled={!editing} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="subjectSpec" render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject Specialization <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                  <FormControl><Input {...field} disabled={!editing} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </Section>

          <Section title="MPO & Finance">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField control={form.control} name="mpoStatus" label="MPO Status" options={MPO_STATUSES} optional disabled={!editing} />
              <FormField control={form.control} name="mpoIndex" render={({ field }) => (
                <FormItem>
                  <FormLabel>MPO Index <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                  <FormControl><Input {...field} disabled={!editing} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="tin" render={({ field }) => (
                <FormItem>
                  <FormLabel>TIN <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                  <FormControl><Input {...field} disabled={!editing} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </Section>

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

      {/* ── Service Book ── */}
      {!editing && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Service Book</h3>
                {serviceBook.length > 0 && (
                  <Badge variant="secondary" className="text-xs">{serviceBook.length}</Badge>
                )}
              </div>
              {canManage && (
                <Button size="sm" variant="outline" onClick={() => setShowAddEntry(v => !v)}>
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  {showAddEntry ? 'Cancel' : 'Add Entry'}
                </Button>
              )}
            </div>

            {showAddEntry && (
              <div className="mb-4 p-3 rounded-lg border bg-muted/30 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium">Type</label>
                    <select
                      className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                      value={sbType}
                      onChange={(e) => setSbType(e.target.value as ServiceBookEntryType)}
                    >
                      {SERVICE_BOOK_ENTRY_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium">Date</label>
                    <Input
                      type="date" className="mt-1 h-9"
                      value={sbDate}
                      onChange={(e) => setSbDate(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium">Description</label>
                  <Input
                    className="mt-1"
                    placeholder="Brief description of the event"
                    value={sbDesc}
                    onChange={(e) => setSbDesc(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">Order Ref. (optional)</label>
                  <Input
                    className="mt-1"
                    placeholder="Order/memo reference number"
                    value={sbRef}
                    onChange={(e) => setSbRef(e.target.value)}
                  />
                </div>
                <Button
                  size="sm"
                  disabled={addingEntry || !sbDate || !sbDesc.trim()}
                  onClick={() => {
                    addEntry(
                      { type: sbType, date: sbDate, description: sbDesc.trim(), orderRef: sbRef.trim() || undefined },
                      {
                        onSuccess: () => {
                          setShowAddEntry(false)
                          setSbDate(''); setSbDesc(''); setSbRef(''); setSbType('JOINING')
                        },
                      },
                    )
                  }}
                >
                  {addingEntry ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
                  Save Entry
                </Button>
              </div>
            )}

            {serviceBook.length === 0 && !showAddEntry && (
              <p className="text-sm text-muted-foreground text-center py-6">No service book entries yet.</p>
            )}

            <div className="space-y-2">
              {serviceBook.map((entry) => (
                <div key={entry.id} className="flex items-start gap-3 p-2.5 rounded-lg border group">
                  <Badge className={cn('text-[10px] px-1.5 shrink-0 mt-0.5', SERVICE_BOOK_TYPE_COLORS[entry.type])}>
                    {SERVICE_BOOK_ENTRY_TYPES.find(t => t.value === entry.type)?.label ?? entry.type}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-snug">{entry.description}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(entry.date), 'dd MMM yyyy')}
                      </span>
                      {entry.orderRef && (
                        <span className="text-xs text-muted-foreground">Ref: {entry.orderRef}</span>
                      )}
                    </div>
                  </div>
                  {canManage && (
                    <Button
                      variant="ghost" size="icon"
                      className="h-7 w-7 text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0"
                      onClick={() => deleteEntry(entry.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
