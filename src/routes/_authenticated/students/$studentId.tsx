import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod/v4'
import { format } from 'date-fns'
import {
  ArrowLeft, Pencil, X, Loader2, GraduationCap, Phone,
  MapPin, BookOpen, UserX, AlertTriangle, Save,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useStudent, useUpdateStudent, useDropStudent } from '@/features/students/hooks'
import { useClasses } from '@/features/academic-setup/hooks'
import { classApi } from '@/api/academic'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { STUDENT_SUBJECT_GROUPS, RELIGIONS, BLOOD_GROUPS, GENDERS, GROUP_COLORS } from '@/features/students/constants'
import type { ClassSection } from '@/types/academic'
import type { StudentSubjectGroup } from '@/types/student'

export const Route = createFileRoute('/_authenticated/students/$studentId')({
  component: StudentDetailPage,
})

const CAN_MANAGE = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'OFFICE_STAFF']

const updateSchema = z.object({
  name: z.string().min(2),
  nameBn: z.string().optional().or(z.literal('')),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  classId: z.string().optional().or(z.literal('')),
  sectionId: z.string().optional().or(z.literal('')),
  subjectGroup: z.enum(['NONE', 'SCIENCE', 'HUMANITIES', 'COMMERCE', 'GENERAL', 'DAKHIL_SCIENCE', 'DAKHIL_GENERAL', 'ALIM_SCIENCE', 'ALIM_GENERAL']).optional(),
  dateOfBirth: z.string().optional().or(z.literal('')),
  religion: z.enum(['ISLAM', 'HINDUISM', 'CHRISTIANITY', 'BUDDHISM', 'OTHER']).optional(),
  bloodGroup: z.enum(['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE']).optional(),
  nid: z.string().optional().or(z.literal('')),
  birthRegNo: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  previousSchool: z.string().optional().or(z.literal('')),
})
type UpdateForm = z.infer<typeof updateSchema>

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  )
}

function StudentDetailPage() {
  const { studentId } = Route.useParams()
  const { user } = useAuthStore()
  const schoolId = user?.schoolId ?? ''
  const canManage = CAN_MANAGE.includes(user?.role ?? '')

  const { data: student, isLoading } = useStudent(schoolId || null, studentId)
  const { mutate: update, isPending: updating } = useUpdateStudent(schoolId, studentId)
  const { mutate: drop, isPending: dropping } = useDropStudent(schoolId)

  const [editing, setEditing] = useState(false)
  const [dropReason, setDropReason] = useState('')
  const [showDrop, setShowDrop] = useState(false)

  const { data: classes = [] } = useClasses(schoolId || null)
  const [sections, setSections] = useState<ClassSection[]>([])

  const form = useForm<UpdateForm>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      name: '', nameBn: '', gender: 'MALE', classId: '', sectionId: '',
      subjectGroup: 'NONE', dateOfBirth: '', nid: '', birthRegNo: '', address: '', previousSchool: '',
    },
  })

  // Populate form when student data loads
  useEffect(() => {
    if (!student) return
    form.reset({
      name: student.name,
      nameBn: student.nameBn ?? '',
      gender: student.gender,
      classId: student.section?.class.id ?? '',
      sectionId: student.sectionId,
      subjectGroup: student.subjectGroup,
      dateOfBirth: student.dateOfBirth ? student.dateOfBirth.slice(0, 10) : '',
      religion: student.religion ?? undefined,
      bloodGroup: student.bloodGroup ?? undefined,
      nid: student.nid ?? '',
      birthRegNo: student.birthRegNo ?? '',
      address: student.address ?? '',
      previousSchool: student.previousSchool ?? '',
    })
  }, [student])

  const watchedClassId = form.watch('classId')

  useEffect(() => {
    if (!watchedClassId || !schoolId) { setSections([]); return }
    classApi.listSections(schoolId, watchedClassId).then((res) => {
      setSections(res.data.data ?? [])
    }).catch(() => setSections([]))
  }, [watchedClassId, schoolId])

  const onSubmit = (data: UpdateForm) => {
    const clean = (v?: string) => v?.trim() || undefined
    update({
      name: data.name,
      nameBn: clean(data.nameBn),
      gender: data.gender,
      sectionId: clean(data.sectionId),
      subjectGroup: data.subjectGroup,
      dateOfBirth: clean(data.dateOfBirth),
      religion: data.religion ?? undefined,
      bloodGroup: data.bloodGroup ?? undefined,
      nid: clean(data.nid),
      birthRegNo: clean(data.birthRegNo),
      address: clean(data.address),
      previousSchool: clean(data.previousSchool),
    }, { onSuccess: () => setEditing(false) })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!student) {
    return (
      <div className="text-center py-24 text-muted-foreground">
        <p>Student not found.</p>
        <Link to="/students"><Button variant="outline" className="mt-4">Back to Students</Button></Link>
      </div>
    )
  }

  const avatarColor = student.gender === 'FEMALE' ? 'bg-pink-500' : student.gender === 'MALE' ? 'bg-blue-500' : 'bg-gray-500'

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Back + title */}
      <div className="flex items-center gap-3">
        <Link to="/students">
          <Button variant="ghost" size="icon" className="h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{student.name}</h1>
          <p className="text-sm text-muted-foreground font-mono">{student.studentId}</p>
        </div>
        {canManage && student.isActive && !editing && (
          <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
            <Pencil className="h-3.5 w-3.5 mr-1.5" /> Edit
          </Button>
        )}
        {editing && (
          <Button size="sm" variant="ghost" onClick={() => { setEditing(false); form.reset() }}>
            <X className="h-3.5 w-3.5 mr-1.5" /> Cancel
          </Button>
        )}
      </div>

      {/* Quick info bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className={cn('h-14 w-14 rounded-full flex items-center justify-center text-white font-bold text-xl shrink-0', avatarColor)}>
          {student.name.charAt(0).toUpperCase()}
        </div>
        <div className="space-y-1">
          {student.nameBn && <p className="text-muted-foreground text-sm">{student.nameBn}</p>}
          <div className="flex items-center gap-2 flex-wrap">
            {student.section && (
              <Badge variant="outline" className="text-xs">
                <BookOpen className="h-3 w-3 mr-1" />
                {student.section.class.name} · Section {student.section.name}
              </Badge>
            )}
            {student.subjectGroup && student.subjectGroup !== 'NONE' && (
              <Badge className={cn('text-xs', GROUP_COLORS[student.subjectGroup as StudentSubjectGroup])}>
                {student.subjectGroup.replace(/_/g, ' ')}
              </Badge>
            )}
            {!student.isActive && (
              <Badge variant="destructive" className="text-xs">
                <UserX className="h-3 w-3 mr-1" /> Dropped
              </Badge>
            )}
          </div>
        </div>
      </div>

      {!editing ? (
        /* ── View mode ── */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Personal</h3>
              <InfoRow label="Gender" value={student.gender} />
              <InfoRow label="Date of Birth" value={student.dateOfBirth ? format(new Date(student.dateOfBirth), 'dd MMM yyyy') : null} />
              <InfoRow label="Religion" value={student.religion} />
              <InfoRow label="Blood Group" value={student.bloodGroup?.replace(/_/g, ' ')} />
              <InfoRow label="NID / Reg. No." value={student.nid} />
              <InfoRow label="Birth Reg. No." value={student.birthRegNo} />
              <InfoRow label="Address" value={student.address} />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Academic</h3>
              <InfoRow label="Class" value={student.section?.class.name} />
              <InfoRow label="Section" value={student.section ? `Section ${student.section.name}` : null} />
              <InfoRow label="Subject Group" value={student.subjectGroup !== 'NONE' ? student.subjectGroup?.replace(/_/g, ' ') : null} />
              <InfoRow label="Previous School" value={student.previousSchool} />
              <InfoRow label="Enrolled" value={format(new Date(student.createdAt), 'dd MMM yyyy')} />
              {student.droppedAt && <InfoRow label="Dropped On" value={format(new Date(student.droppedAt), 'dd MMM yyyy')} />}
              {student.dropReason && <InfoRow label="Drop Reason" value={student.dropReason} />}
            </CardContent>
          </Card>

          {/* Guardians */}
          {student.guardians.length > 0 && (
            <Card className="md:col-span-2">
              <CardContent className="p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Guardians</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {student.guardians.map((g) => (
                    <div key={g.id} className="flex items-center gap-3 p-3 rounded-lg border">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-primary">{g.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{g.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {g.relation}
                          {g.isEmergency && ' · Emergency Contact'}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <Phone className="h-3 w-3" /> {g.phone}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        /* ── Edit mode ── */
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider pb-2 border-b mb-4">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name (English)</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="nameBn" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name (Bengali)</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="gender" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <FormControl>
                        <select className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm" {...field}>
                          {GENDERS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                        </select>
                      </FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="religion" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Religion</FormLabel>
                      <FormControl>
                        <select className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm" {...field}>
                          <option value="">Select</option>
                          {RELIGIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </select>
                      </FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="bloodGroup" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Blood Group</FormLabel>
                      <FormControl>
                        <select className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm" {...field}>
                          <option value="">Select</option>
                          {BLOOD_GROUPS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
                        </select>
                      </FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="nid" render={({ field }) => (
                    <FormItem>
                      <FormLabel>NID</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="birthRegNo" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Birth Reg. No.</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="address" render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Address</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                    </FormItem>
                  )} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider pb-2 border-b mb-4">
                  Academic Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="classId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class (for section transfer)</FormLabel>
                      <FormControl>
                        <select className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm" value={field.value} onChange={field.onChange}>
                          <option value="">Select class</option>
                          {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="sectionId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Section</FormLabel>
                      <FormControl>
                        <select className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm" value={field.value} onChange={field.onChange} disabled={sections.length === 0}>
                          <option value="">Select section</option>
                          {sections.map((s) => <option key={s.id} value={s.id}>Section {s.name}</option>)}
                        </select>
                      </FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="subjectGroup" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject Group</FormLabel>
                      <FormControl>
                        <select className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm" {...field}>
                          {STUDENT_SUBJECT_GROUPS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                        </select>
                      </FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="previousSchool" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Previous School</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                    </FormItem>
                  )} />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3 pt-2 border-t">
              <Button type="submit" disabled={updating}>
                {updating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Changes
              </Button>
              <Button type="button" variant="outline" onClick={() => { setEditing(false); form.reset() }}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      )}

      {/* Drop Student */}
      {canManage && student.isActive && !editing && (
        <Card className="border-destructive/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-sm">Drop Student</p>
                <p className="text-xs text-muted-foreground mb-3">
                  Marking a student as dropped will deactivate their account. This action can't be undone easily.
                </p>
                {!showDrop ? (
                  <Button
                    variant="destructive" size="sm"
                    onClick={() => setShowDrop(true)}
                  >
                    <UserX className="h-3.5 w-3.5 mr-1.5" /> Drop Student
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium">Reason (required, min 5 chars)</label>
                      <Input
                        className="mt-1"
                        placeholder="e.g. TC issued, moved to another school"
                        value={dropReason}
                        onChange={(e) => setDropReason(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="destructive" size="sm"
                        disabled={dropping || dropReason.trim().length < 5}
                        onClick={() => drop({ id: studentId, payload: { dropReason: dropReason.trim() } })}
                      >
                        {dropping ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Confirm Drop'}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => { setShowDrop(false); setDropReason('') }}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
