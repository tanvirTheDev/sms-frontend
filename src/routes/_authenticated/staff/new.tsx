import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod/v4'
import { useAuthStore } from '@/store/authStore'
import { useCreateStaff } from '@/features/staff/hooks'
import { STAFF_ROLE_OPTIONS, RELIGIONS, BLOOD_GROUPS, MPO_STATUSES, GENDERS } from '@/features/staff/constants'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { SelectField } from '@/components/common/SelectField'
import { ArrowLeft, Loader2 } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/staff/new')({
  beforeLoad: () => {
    const raw = localStorage.getItem('sms-auth')
    if (raw) {
      const state = JSON.parse(raw)
      const role = state.state?.user?.role
      if (!['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'].includes(role)) {
        throw redirect({ to: '/staff' })
      }
    }
  },
  component: CreateStaffPage,
})

const bdPhone = z.string().regex(/^01[3-9]\d{8}$/, 'Valid BD phone required (01XXXXXXXXX)')

const schema = z.object({
  // Identity
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  nameBn: z.string().max(100).optional().or(z.literal('')),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  religion: z.enum(['ISLAM', 'HINDUISM', 'CHRISTIANITY', 'BUDDHISM', 'OTHER']).optional(),
  bloodGroup: z.enum(['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE']).optional(),
  dateOfBirth: z.string().date('Must be YYYY-MM-DD').optional().or(z.literal('')),
  nid: z.string().regex(/^\d{10}(\d{7})?$/, 'NID must be 10 or 17 digits').optional().or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal('')),

  // Contact & Login
  phone: bdPhone,
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100),

  // Employment
  designation: z.string().min(2, 'Designation required').max(100),
  role: z.enum([
    'PRINCIPAL', 'HEADMASTER', 'VICE_PRINCIPAL', 'ASSISTANT_HEADMASTER',
    'SENIOR_TEACHER', 'TEACHER', 'ASSISTANT_TEACHER', 'LECTURER', 'DEMONSTRATOR',
    'LIBRARIAN', 'LAB_ASSISTANT', 'COMPUTER_OPERATOR', 'ACCOUNTANT',
    'OFFICE_ASSISTANT', 'PEON', 'GUARD',
  ]),
  joiningDate: z.string().date('Must be YYYY-MM-DD'),
  employeeId: z.string().max(50).optional().or(z.literal('')),
  indexNo: z.string().max(50).optional().or(z.literal('')),
  mpoStatus: z.enum(['GOVERNMENT', 'SEMI_GOVERNMENT', 'MPO', 'NON_MPO', 'PRIVATE', 'AUTONOMOUS']).optional(),
  mpoIndex: z.string().max(50).optional().or(z.literal('')),
  tin: z.string().regex(/^\d{12}$/, 'TIN must be 12 digits').optional().or(z.literal('')),
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

function CreateStaffPage() {
  const { user } = useAuthStore()
  const schoolId = user?.schoolId ?? ''
  const { mutate: createStaff, isPending } = useCreateStaff(schoolId)

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '', nameBn: '', nid: '', address: '',
      phone: '', email: '', password: '',
      designation: '', joiningDate: '', employeeId: '',
      indexNo: '', mpoIndex: '', tin: '', subjectSpec: '',
      dateOfBirth: '',
    },
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
      password: data.password,
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
    createStaff(payload as any)
  }

  if (!schoolId) {
    return (
      <div className="text-center py-16 text-sm text-muted-foreground">
        No school assigned. Cannot add staff.
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      <div className="flex items-center gap-3">
        <Link to="/staff">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add Staff Member</h1>
          <p className="text-sm text-muted-foreground">Fill in the details below</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">

          {/* ── Personal Info ── */}
          <Section title="Personal Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Full Name (English)</FormLabel>
                  <FormControl><Input placeholder="Md. Rahim Uddin" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="nameBn" render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name (Bengali) <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                  <FormControl><Input placeholder="মোঃ রহিম উদ্দিন" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <SelectField control={form.control} name="gender" label="Gender" options={GENDERS} />

              <SelectField control={form.control} name="religion" label="Religion" options={RELIGIONS} optional />

              <SelectField control={form.control} name="bloodGroup" label="Blood Group" options={BLOOD_GROUPS} optional />

              <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="nid" render={({ field }) => (
                <FormItem>
                  <FormLabel>NID Number <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                  <FormControl><Input placeholder="10 or 17 digits" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Address <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                  <FormControl><Input placeholder="Village/Area, Upazila, District" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </Section>

          {/* ── Contact & Login ── */}
          <Section title="Contact & Login">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone (Login ID)</FormLabel>
                  <FormControl><Input placeholder="01XXXXXXXXX" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                  <FormControl><Input type="email" placeholder="rahim@school.edu.bd" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Initial Password</FormLabel>
                  <FormControl><Input type="password" placeholder="Min. 6 characters" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </Section>

          {/* ── Employment ── */}
          <Section title="Employment Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="designation" render={({ field }) => (
                <FormItem>
                  <FormLabel>Designation</FormLabel>
                  <FormControl><Input placeholder="e.g. Mathematics Teacher" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <SelectField control={form.control} name="role" label="Staff Role" options={STAFF_ROLE_OPTIONS} />

              <FormField control={form.control} name="joiningDate" render={({ field }) => (
                <FormItem>
                  <FormLabel>Joining Date</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="employeeId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee ID <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                  <FormControl><Input placeholder="EMP-2024-001" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="indexNo" render={({ field }) => (
                <FormItem>
                  <FormLabel>Index No. <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                  <FormControl><Input placeholder="Board index number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="subjectSpec" render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject Specialization <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                  <FormControl><Input placeholder="Mathematics, Physics" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </Section>

          {/* ── MPO & Finance ── */}
          <Section title="MPO & Finance">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField control={form.control} name="mpoStatus" label="MPO Status" options={MPO_STATUSES} optional />

              <FormField control={form.control} name="mpoIndex" render={({ field }) => (
                <FormItem>
                  <FormLabel>MPO Index <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                  <FormControl><Input placeholder="MPO index number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="tin" render={({ field }) => (
                <FormItem>
                  <FormLabel>TIN <span className="text-muted-foreground font-normal">(optional, 12 digits)</span></FormLabel>
                  <FormControl><Input placeholder="123456789012" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </Section>

          {/* Submit */}
          <div className="flex items-center gap-3 pt-4 border-t">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Staff Member
            </Button>
            <Link to="/staff">
              <Button type="button" variant="outline">Cancel</Button>
            </Link>
          </div>
        </form>
      </Form>
    </div>
  )
}
