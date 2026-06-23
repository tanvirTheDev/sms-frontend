import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod/v4'
import { ArrowLeft, Loader2, Camera, X } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useCreateStudent } from '@/features/students/hooks'
import { useClasses } from '@/features/academic-setup/hooks'
import { classApi } from '@/api/academic'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  STUDENT_SUBJECT_GROUPS, RELIGIONS, BLOOD_GROUPS, GENDERS,
} from '@/features/students/constants'
import type { ClassSection } from '@/types/academic'

export const Route = createFileRoute('/_authenticated/students/new')({
  beforeLoad: () => {
    const raw = localStorage.getItem('sms-auth')
    if (raw) {
      const state = JSON.parse(raw)
      const role = state.state?.user?.role
      if (!['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'OFFICE_STAFF'].includes(role ?? '')) {
        throw redirect({ to: '/students' })
      }
    }
  },
  component: EnrollStudentPage,
})

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  nameBn: z.string().optional().or(z.literal('')),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  classId: z.string().min(1, 'Select a class'),
  sectionId: z.string().min(1, 'Select a section'),
  subjectGroup: z.enum(['NONE', 'SCIENCE', 'HUMANITIES', 'COMMERCE', 'GENERAL', 'DAKHIL_SCIENCE', 'DAKHIL_GENERAL', 'ALIM_SCIENCE', 'ALIM_GENERAL']).optional(),
  studentId: z.string().optional().or(z.literal('')),
  password: z.string().min(6, 'Minimum 6 characters'),
  dateOfBirth: z.string().optional().or(z.literal('')),
  religion: z.enum(['ISLAM', 'HINDUISM', 'CHRISTIANITY', 'BUDDHISM', 'OTHER']).optional(),
  bloodGroup: z.enum(['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE']).optional(),
  nid: z.string().optional().or(z.literal('')),
  birthRegNo: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  previousSchool: z.string().optional().or(z.literal('')),
})

type FormData = z.infer<typeof schema>

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider pb-2 border-b mb-4">
      {children}
    </h2>
  )
}

function EnrollStudentPage() {
  const { user } = useAuthStore()
  const schoolId = user?.schoolId ?? ''
  const { mutate: create, isPending } = useCreateStudent(schoolId)

  const { data: classes = [] } = useClasses(schoolId || null)
  const [sections, setSections] = useState<ClassSection[]>([])
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '', nameBn: '', gender: 'MALE', classId: '', sectionId: '',
      subjectGroup: 'NONE', studentId: '', password: '',
      dateOfBirth: '', nid: '', birthRegNo: '', address: '', previousSchool: '',
    },
  })

  const watchedClassId = form.watch('classId')

  useEffect(() => {
    setSections([])
    form.setValue('sectionId', '')
    if (!watchedClassId || !schoolId) return
    classApi.listSections(schoolId, watchedClassId).then((res) => {
      setSections(res.data.data ?? [])
    }).catch(() => {})
  }, [watchedClassId, schoolId])

  const onPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const clearPhoto = () => {
    setPhotoFile(null)
    setPhotoPreview(null)
    if (photoInputRef.current) photoInputRef.current.value = ''
  }

  const onSubmit = (data: FormData) => {
    const clean = (v?: string) => v?.trim() || undefined
    create({
      payload: {
        name: data.name,
        nameBn: clean(data.nameBn),
        gender: data.gender,
        sectionId: data.sectionId,
        password: data.password,
        studentId: clean(data.studentId),
        subjectGroup: data.subjectGroup,
        dateOfBirth: clean(data.dateOfBirth),
        religion: data.religion,
        bloodGroup: data.bloodGroup,
        nid: clean(data.nid),
        birthRegNo: clean(data.birthRegNo),
        address: clean(data.address),
        previousSchool: clean(data.previousSchool),
      },
      photoFile: photoFile ?? undefined,
    })
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      <div className="flex items-center gap-3">
        <Link to="/students">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Enroll New Student</h1>
          <p className="text-sm text-muted-foreground">Add a student to a class section.</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">

          {/* ── Personal Info ── */}
          <Card>
            <CardContent className="p-6">
              <SectionTitle>Personal Information</SectionTitle>

              {/* Photo upload */}
              <div className="flex items-start gap-4 mb-6">
                <div className="relative h-24 w-24 rounded-full border-2 border-dashed border-muted-foreground/30 bg-muted/30 flex items-center justify-center overflow-hidden shrink-0">
                  {photoPreview
                    ? <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                    : <Camera className="h-7 w-7 text-muted-foreground/50" />}
                  {photoPreview && (
                    <button type="button" onClick={clearPhoto}
                      className="absolute top-0.5 right-0.5 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center">
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Student Photo <span className="text-muted-foreground text-xs">(optional)</span></p>
                  <p className="text-xs text-muted-foreground mb-2">JPG, PNG, WEBP — max 5 MB</p>
                  <input ref={photoInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onPhotoChange} />
                  <Button type="button" variant="outline" size="sm" onClick={() => photoInputRef.current?.click()}>
                    Choose Photo
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name (English)</FormLabel>
                    <FormControl><Input placeholder="Md. Rahim Uddin" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="nameBn" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name (Bengali) <span className="text-muted-foreground text-xs">(optional)</span></FormLabel>
                    <FormControl><Input placeholder="মো. রহিম উদ্দিন" {...field} /></FormControl>
                    <FormMessage />
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
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth <span className="text-muted-foreground text-xs">(optional)</span></FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="religion" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Religion <span className="text-muted-foreground text-xs">(optional)</span></FormLabel>
                    <FormControl>
                      <select className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm" {...field}>
                        <option value="">Select religion</option>
                        {RELIGIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="bloodGroup" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Blood Group <span className="text-muted-foreground text-xs">(optional)</span></FormLabel>
                    <FormControl>
                      <select className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm" {...field}>
                        <option value="">Select blood group</option>
                        {BLOOD_GROUPS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="nid" render={({ field }) => (
                  <FormItem>
                    <FormLabel>NID / Birth Cert No. <span className="text-muted-foreground text-xs">(optional)</span></FormLabel>
                    <FormControl><Input placeholder="National ID number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="birthRegNo" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Birth Registration No. <span className="text-muted-foreground text-xs">(optional)</span></FormLabel>
                    <FormControl><Input placeholder="BDRIS registration number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="address" render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Address <span className="text-muted-foreground text-xs">(optional)</span></FormLabel>
                    <FormControl><Input placeholder="Village, Upazila, District" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </CardContent>
          </Card>

          {/* ── Academic ── */}
          <Card>
            <CardContent className="p-6">
              <SectionTitle>Academic Details</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="classId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class</FormLabel>
                    <FormControl>
                      <select
                        className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                        value={field.value}
                        onChange={field.onChange}
                      >
                        <option value="">Select class</option>
                        {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="sectionId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Section</FormLabel>
                    <FormControl>
                      <select
                        className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                        value={field.value}
                        onChange={field.onChange}
                        disabled={sections.length === 0}
                      >
                        <option value="">{sections.length === 0 ? 'Select class first' : 'Select section'}</option>
                        {sections.map((s) => (
                          <option key={s.id} value={s.id}>Section {s.name} (cap: {s.capacity})</option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="subjectGroup" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject Group <span className="text-muted-foreground text-xs">(optional)</span></FormLabel>
                    <FormControl>
                      <select className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm" {...field}>
                        {STUDENT_SUBJECT_GROUPS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="studentId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student ID <span className="text-muted-foreground text-xs">(auto-generated if empty)</span></FormLabel>
                    <FormControl><Input placeholder="e.g. 2025001" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="previousSchool" render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Previous School <span className="text-muted-foreground text-xs">(optional)</span></FormLabel>
                    <FormControl><Input placeholder="Name of previous school" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </CardContent>
          </Card>

          {/* ── Account ── */}
          <Card>
            <CardContent className="p-6">
              <SectionTitle>Login Account</SectionTitle>
              <div className="max-w-sm">
                <FormField control={form.control} name="password" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl><Input type="password" placeholder="Minimum 6 characters" {...field} /></FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">Student will use their Student ID + this password to login.</p>
                  </FormItem>
                )} />
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-3 pt-2 border-t">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Enroll Student
            </Button>
            <Link to="/students">
              <Button type="button" variant="outline">Cancel</Button>
            </Link>
          </div>
        </form>
      </Form>
    </div>
  )
}
