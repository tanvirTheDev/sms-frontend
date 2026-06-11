import { createFileRoute, Link, redirect, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod/v4'
import { useCreateSchool } from '@/features/schools/hooks'
import {
  MANAGEMENT_TYPES, INSTITUTION_TYPES, INSTITUTION_LEVELS,
  MEDIUMS, GENDERS, LOCATION_TYPES, BOARD_AFFILIATIONS, BD_DIVISIONS,
} from '@/features/schools/constants'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SelectField } from '@/components/common/SelectField'
import { ArrowLeft, Loader2, CheckCircle2, Copy, Check, ShieldAlert } from 'lucide-react'
import type { AdminCredentials } from '@/types/school'

export const Route = createFileRoute('/_authenticated/schools/new')({
  beforeLoad: () => {
    const raw = localStorage.getItem('sms-auth')
    if (raw) {
      const state = JSON.parse(raw)
      if (state.state?.user?.role !== 'SUPER_ADMIN') {
        throw redirect({ to: '/dashboard' })
      }
    }
  },
  component: CreateSchoolPage,
})

const schema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  nameBn: z.string().optional().or(z.literal('')),
  slug: z.string()
    .min(3, 'Slug required')
    .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, digits and hyphens'),
  managementType: z.enum(['GOVERNMENT', 'SEMI_GOVERNMENT', 'MPO', 'NON_MPO', 'PRIVATE', 'AUTONOMOUS']).optional(),
  institutionType: z.enum(['SCHOOL', 'MADRASA', 'COLLEGE', 'SCHOOL_AND_COLLEGE', 'TECHNICAL']).optional(),
  level: z.enum(['PRE_PRIMARY', 'PRIMARY', 'SECONDARY', 'HIGHER_SECONDARY', 'COMBINED']).optional(),
  medium: z.enum(['BANGLA', 'ENGLISH', 'BOTH']).optional(),
  gender: z.enum(['BOYS', 'GIRLS', 'CO_ED']).optional(),
  boardAffiliation: z.enum([
    'DHAKA', 'CHITTAGONG', 'RAJSHAHI', 'COMILLA', 'JESSORE',
    'SYLHET', 'BARISAL', 'DINAJPUR', 'MADRASA', 'TECHNICAL', 'PRIMARY',
  ]).optional(),
  eiin: z.string().optional().or(z.literal('')),
  banbisCode: z.string().optional().or(z.literal('')),
  recognitionNo: z.string().optional().or(z.literal('')),
  establishedYear: z.coerce.number().int().min(1800).max(new Date().getFullYear()).optional().or(z.literal('')),
  phone: z.string().regex(/^01[3-9]\d{8}$/, 'Enter valid BD phone (01XXXXXXXXX)'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().min(5, 'Address required'),
  division: z.string().min(1, 'Division required'),
  district: z.string().min(2, 'District required'),
  upazila: z.string().min(2, 'Upazila required'),
  unionParishad: z.string().optional().or(z.literal('')),
  ward: z.string().optional().or(z.literal('')),
  postCode: z.string().regex(/^\d{4}$/, '4 digits required').optional().or(z.literal('')),
  locationType: z.enum(['CITY_CORPORATION', 'PAURASHAVA', 'UPAZILA_SADAR', 'UNION', 'RURAL']).optional(),
})

type FormData = z.infer<typeof schema>

function toSlug(str: string) {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60)
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider pb-2 border-b mb-4">
      {children}
    </h2>
  )
}

const DIVISION_OPTIONS = BD_DIVISIONS.map((d) => ({ value: d, label: d }))

function CredentialsCard({ creds, schoolId }: { creds: AdminCredentials; schoolId: string }) {
  const navigate = useNavigate()
  const [copiedPhone, setCopiedPhone] = useState(false)
  const [copiedPass, setCopiedPass] = useState(false)

  const copy = async (text: string, setter: (v: boolean) => void) => {
    await navigator.clipboard.writeText(text)
    setter(true)
    setTimeout(() => setter(false), 2000)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold">School Registered!</h1>
          <p className="text-sm text-muted-foreground">A School Admin account was created automatically.</p>
        </div>
      </div>

      {/* Warning */}
      <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-700">
        <CardContent className="p-4 flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              Save these credentials now — they won't be shown again!
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
              The School Admin must change their password on first login.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Credentials */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            School Admin Credentials
          </h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-4 py-3">
              <div>
                <p className="text-xs text-muted-foreground">Phone (Login)</p>
                <p className="font-mono font-semibold text-base mt-0.5">{creds.phone}</p>
              </div>
              <Button
                variant="ghost" size="sm"
                onClick={() => copy(creds.phone, setCopiedPhone)}
                className="shrink-0"
              >
                {copiedPhone ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-4 py-3">
              <div>
                <p className="text-xs text-muted-foreground">Temporary Password</p>
                <p className="font-mono font-semibold text-base mt-0.5 tracking-widest">{creds.tempPassword}</p>
              </div>
              <Button
                variant="ghost" size="sm"
                onClick={() => copy(creds.tempPassword, setCopiedPass)}
                className="shrink-0"
              >
                {copiedPass ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <Button
            className="w-full mt-2"
            onClick={() => navigate({ to: '/schools/$schoolId', params: { schoolId } })}
          >
            Go to School Page
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function CreateSchoolPage() {
  const { mutate: createSchool, isPending, data: mutationData } = useCreateSchool()

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '', nameBn: '', slug: '',
      eiin: '', banbisCode: '', recognitionNo: '',
      establishedYear: '',
      phone: '', email: '',
      address: '', division: '', district: '', upazila: '',
      unionParishad: '', ward: '', postCode: '',
    },
  })

  // Show credentials card after successful creation
  if (mutationData?.data?.data) {
    const { school, adminCredentials } = mutationData.data.data
    return <CredentialsCard creds={adminCredentials} schoolId={school.id} />
  }

  const onSubmit = (data: FormData) => {
    const clean = (v?: string) => v || undefined
    const payload = {
      name: data.name,
      nameBn: clean(data.nameBn),
      slug: data.slug,
      managementType: data.managementType,
      institutionType: data.institutionType,
      level: data.level,
      medium: data.medium,
      gender: data.gender,
      boardAffiliation: data.boardAffiliation,
      eiin: clean(data.eiin),
      banbisCode: clean(data.banbisCode),
      recognitionNo: clean(data.recognitionNo),
      establishedYear: data.establishedYear ? Number(data.establishedYear) : undefined,
      phone: data.phone,
      email: clean(data.email),
      address: data.address,
      division: data.division,
      district: data.district,
      upazila: data.upazila,
      unionParishad: clean(data.unionParishad),
      ward: clean(data.ward),
      postCode: clean(data.postCode),
      locationType: data.locationType,
    }
    createSchool(payload as any)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/schools">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Register New School</h1>
          <p className="text-sm text-muted-foreground">
            A School Admin account will be created using the phone number provided.
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">

          {/* ── Basic Info ── */}
          <div>
            <SectionTitle>Basic Information</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>School Name (English)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Dhaka Model High School"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e)
                        const currentSlug = form.getValues('slug')
                        const autoSlug = toSlug(form.getValues('name'))
                        if (!currentSlug || currentSlug === autoSlug) {
                          form.setValue('slug', toSlug(e.target.value), { shouldValidate: false })
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="nameBn" render={({ field }) => (
                <FormItem>
                  <FormLabel>School Name (Bengali) <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                  <FormControl><Input placeholder="ঢাকা মডেল হাই স্কুল" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="slug" render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl><Input placeholder="dhaka-model-high-school" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <SelectField control={form.control} name="managementType" label="Management Type" options={MANAGEMENT_TYPES} optional />
              <SelectField control={form.control} name="institutionType" label="Institution Type" options={INSTITUTION_TYPES} optional />
            </div>
          </div>

          {/* ── Academic ── */}
          <div>
            <SectionTitle>Academic Details</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField control={form.control} name="level" label="Level" options={INSTITUTION_LEVELS} optional />
              <SelectField control={form.control} name="medium" label="Medium of Instruction" options={MEDIUMS} optional />
              <SelectField control={form.control} name="gender" label="Gender" options={GENDERS} optional />
              <SelectField control={form.control} name="boardAffiliation" label="Board Affiliation" options={BOARD_AFFILIATIONS} optional />
              <FormField control={form.control} name="establishedYear" render={({ field }) => (
                <FormItem>
                  <FormLabel>Established Year <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                  <FormControl><Input type="number" placeholder="1985" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </div>

          {/* ── Identification ── */}
          <div>
            <SectionTitle>Identification Numbers</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField control={form.control} name="eiin" render={({ field }) => (
                <FormItem>
                  <FormLabel>EIIN <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                  <FormControl><Input placeholder="108234" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="banbisCode" render={({ field }) => (
                <FormItem>
                  <FormLabel>BANBEIS Code <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                  <FormControl><Input placeholder="100301" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="recognitionNo" render={({ field }) => (
                <FormItem>
                  <FormLabel>Recognition No. <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                  <FormControl><Input placeholder="REC-2004-0012" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </div>

          {/* ── Location ── */}
          <div>
            <SectionTitle>Location</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Full Address</FormLabel>
                  <FormControl><Input placeholder="123 School Road, Mirpur" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <SelectField control={form.control} name="division" label="Division" options={DIVISION_OPTIONS} />
              <FormField control={form.control} name="district" render={({ field }) => (
                <FormItem>
                  <FormLabel>District</FormLabel>
                  <FormControl><Input placeholder="Dhaka" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="upazila" render={({ field }) => (
                <FormItem>
                  <FormLabel>Upazila / Thana</FormLabel>
                  <FormControl><Input placeholder="Mirpur" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <SelectField control={form.control} name="locationType" label="Location Type" options={LOCATION_TYPES} optional />
              <FormField control={form.control} name="unionParishad" render={({ field }) => (
                <FormItem>
                  <FormLabel>Union Parishad <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="ward" render={({ field }) => (
                <FormItem>
                  <FormLabel>Ward <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                  <FormControl><Input placeholder="Ward 7" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="postCode" render={({ field }) => (
                <FormItem>
                  <FormLabel>Post Code <span className="text-muted-foreground font-normal">(optional, 4 digits)</span></FormLabel>
                  <FormControl><Input placeholder="1216" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </div>

          {/* ── Contact ── */}
          <div>
            <SectionTitle>Contact & Admin Account</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl><Input placeholder="01XXXXXXXXX" {...field} /></FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">
                    This phone will be the School Admin login. A temporary password will be generated.
                  </p>
                </FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                  <FormControl><Input type="email" placeholder="info@school.edu.bd" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center gap-3 pt-4 border-t">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Register School
            </Button>
            <Link to="/schools">
              <Button type="button" variant="outline">Cancel</Button>
            </Link>
          </div>
        </form>
      </Form>
    </div>
  )
}
