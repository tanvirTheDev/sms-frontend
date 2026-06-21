import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod/v4'
import {
  Settings, Cog, Clock, UserCheck, IdCard, DollarSign, BookOpen, Library,
  Bus, Eye, Bell, Palette, RotateCcw, Server, Loader2, AlertTriangle, Wrench,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import {
  useSchoolSettings, useUpdateSchoolSettings,
  useSchoolCounters, useResetCounter,
  useSystemSettings, useUpdateSystemSettings, useToggleMaintenance,
} from '@/features/settings/hooks'
import type { SchoolSettings, SystemSettings, CounterType } from '@/api/settings'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_authenticated/settings/')({
  component: SettingsPage,
})

// ─── Section wrapper ────────────────────────────────────────────

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Icon className="h-4 w-4 text-muted-foreground" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {children}
      </CardContent>
    </Card>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  )
}

function SwitchField({ label, description, checked, onChange }: {
  label: string; description?: string; checked: boolean; onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between py-1 col-span-full sm:col-span-1">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}

// ─── School Settings Tab ────────────────────────────────────────

const schoolSchema = z.object({
  weekStart: z.enum(['SUNDAY', 'SATURDAY', 'MONDAY']),
  workingDaysPerWeek: z.coerce.number().int().min(1).max(7),
  classPeriodsPerDay: z.coerce.number().int().min(1).max(15),
  periodDurationMinutes: z.coerce.number().int().min(15).max(120),
  attendanceMode: z.enum(['MANUAL', 'QR_CODE', 'BIOMETRIC']),
  lateThresholdMinutes: z.coerce.number().int().min(0).max(60),
  minAttendancePercent: z.coerce.number().int().min(0).max(100),
  smsOnAbsence: z.boolean(),
  studentIdFormat: z.enum(['YEAR_SEQ', 'SCHOOL_YEAR_SEQ', 'CUSTOM_PREFIX']),
  studentIdPrefix: z.string().max(10).nullable(),
  receiptNumberFormat: z.enum(['SEQUENTIAL', 'YEAR_SEQUENTIAL', 'YEAR_MONTH_SEQ']),
  receiptPrefix: z.string().max(10).nullable(),
  lateFeeEnabled: z.boolean(),
  lateFeeAmount: z.coerce.number().nullable(),
  lateFeeAfterDay: z.coerce.number().int().min(1).max(31).nullable(),
  waivingRequiresAdmin: z.boolean(),
  resultPublishMode: z.enum(['MANUAL', 'AUTOMATIC']),
  showGpaOnResult: z.boolean(),
  showPositionOnResult: z.boolean(),
  libraryEnabled: z.boolean(),
  maxBooksPerStudent: z.coerce.number().int().min(1).max(20),
  maxIssueDays: z.coerce.number().int().min(1).max(60),
  libraryFinePerDay: z.coerce.number().min(0),
  transportEnabled: z.boolean(),
  parentPortalEnabled: z.boolean(),
  studentPortalEnabled: z.boolean(),
  showFeeInPortal: z.boolean(),
  showResultInPortal: z.boolean(),
  showAttendanceInPortal: z.boolean(),
  showNoticeInPortal: z.boolean(),
  notifyFeeReminder: z.boolean(),
  feeReminderDaysBefore: z.coerce.number().int().min(1).max(30),
  notifyExamSchedule: z.boolean(),
  notifyResultPublished: z.boolean(),
  notifyAbsence: z.boolean(),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).nullable(),
  footerText: z.string().max(500).nullable(),
})
type SchoolForm = z.infer<typeof schoolSchema>

function SchoolSettingsTab({ schoolId }: { schoolId: string }) {
  const { data: settings, isLoading } = useSchoolSettings(schoolId)
  const { mutate: save, isPending } = useUpdateSchoolSettings(schoolId)
  const [dirty, setDirty] = useState(false)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<SchoolForm>({
    resolver: zodResolver(schoolSchema),
    values: settings ? {
      weekStart: settings.weekStart,
      workingDaysPerWeek: settings.workingDaysPerWeek,
      classPeriodsPerDay: settings.classPeriodsPerDay,
      periodDurationMinutes: settings.periodDurationMinutes,
      attendanceMode: settings.attendanceMode,
      lateThresholdMinutes: settings.lateThresholdMinutes,
      minAttendancePercent: settings.minAttendancePercent,
      smsOnAbsence: settings.smsOnAbsence,
      studentIdFormat: settings.studentIdFormat,
      studentIdPrefix: settings.studentIdPrefix,
      receiptNumberFormat: settings.receiptNumberFormat,
      receiptPrefix: settings.receiptPrefix,
      lateFeeEnabled: settings.lateFeeEnabled,
      lateFeeAmount: settings.lateFeeAmount,
      lateFeeAfterDay: settings.lateFeeAfterDay,
      waivingRequiresAdmin: settings.waivingRequiresAdmin,
      resultPublishMode: settings.resultPublishMode,
      showGpaOnResult: settings.showGpaOnResult,
      showPositionOnResult: settings.showPositionOnResult,
      libraryEnabled: settings.libraryEnabled,
      maxBooksPerStudent: settings.maxBooksPerStudent,
      maxIssueDays: settings.maxIssueDays,
      libraryFinePerDay: settings.libraryFinePerDay,
      transportEnabled: settings.transportEnabled,
      parentPortalEnabled: settings.parentPortalEnabled,
      studentPortalEnabled: settings.studentPortalEnabled,
      showFeeInPortal: settings.showFeeInPortal,
      showResultInPortal: settings.showResultInPortal,
      showAttendanceInPortal: settings.showAttendanceInPortal,
      showNoticeInPortal: settings.showNoticeInPortal,
      notifyFeeReminder: settings.notifyFeeReminder,
      feeReminderDaysBefore: settings.feeReminderDaysBefore,
      notifyExamSchedule: settings.notifyExamSchedule,
      notifyResultPublished: settings.notifyResultPublished,
      notifyAbsence: settings.notifyAbsence,
      primaryColor: settings.primaryColor,
      footerText: settings.footerText,
    } : undefined,
  })

  const watchLateFeeEnabled = watch('lateFeeEnabled')
  const watchStudentIdFormat = watch('studentIdFormat')

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm py-8">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading settings...
      </div>
    )
  }

  const onSubmit = (data: SchoolForm) => {
    save(data, { onSuccess: () => setDirty(false) })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} onChange={() => setDirty(true)} className="space-y-5">
      {/* Timetable */}
      <Section title="Timetable" icon={Clock}>
        <Field label="Week Start">
          <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" {...register('weekStart')}>
            <option value="SUNDAY">Sunday (BD default)</option>
            <option value="SATURDAY">Saturday</option>
            <option value="MONDAY">Monday</option>
          </select>
        </Field>
        <Field label="Working Days / Week">
          <Input type="number" min={1} max={7} {...register('workingDaysPerWeek')} />
        </Field>
        <Field label="Periods / Day">
          <Input type="number" min={1} max={15} {...register('classPeriodsPerDay')} />
        </Field>
        <Field label="Period Duration (minutes)">
          <Input type="number" min={15} max={120} {...register('periodDurationMinutes')} />
        </Field>
      </Section>

      {/* Attendance */}
      <Section title="Attendance" icon={UserCheck}>
        <Field label="Attendance Mode">
          <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" {...register('attendanceMode')}>
            <option value="MANUAL">Manual</option>
            <option value="QR_CODE">QR Code</option>
            <option value="BIOMETRIC">Biometric</option>
          </select>
        </Field>
        <Field label="Late Threshold (minutes)">
          <Input type="number" min={0} max={60} {...register('lateThresholdMinutes')} />
        </Field>
        <Field label="Min. Attendance % (for exams)">
          <Input type="number" min={0} max={100} {...register('minAttendancePercent')} />
        </Field>
        <div className="col-span-full">
          <SwitchField
            label="SMS on Absence"
            description="Send SMS to parent/guardian when student is absent"
            checked={watch('smsOnAbsence')}
            onChange={(v) => { setValue('smsOnAbsence', v); setDirty(true) }}
          />
        </div>
      </Section>

      {/* Student ID */}
      <Section title="Student ID Generation" icon={IdCard}>
        <Field label="ID Format">
          <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" {...register('studentIdFormat')}>
            <option value="YEAR_SEQ">Year + Sequence (2025001)</option>
            <option value="SCHOOL_YEAR_SEQ">School + Year + Seq (SCH2025001)</option>
            <option value="CUSTOM_PREFIX">Custom Prefix</option>
          </select>
        </Field>
        {watchStudentIdFormat === 'CUSTOM_PREFIX' && (
          <Field label="Prefix (e.g. RHS)">
            <Input placeholder="RHS" maxLength={10} {...register('studentIdPrefix')} />
          </Field>
        )}
      </Section>

      {/* Fee / Receipt */}
      <Section title="Fee & Receipt" icon={DollarSign}>
        <Field label="Receipt Number Format">
          <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" {...register('receiptNumberFormat')}>
            <option value="SEQUENTIAL">Sequential</option>
            <option value="YEAR_SEQUENTIAL">Year-Sequential (2025-000001)</option>
            <option value="YEAR_MONTH_SEQ">Year-Month-Seq (2025-06-0001)</option>
          </select>
        </Field>
        <Field label="Receipt Prefix (optional)">
          <Input placeholder="RCP" maxLength={10} {...register('receiptPrefix')} />
        </Field>
        <div className="col-span-full">
          <SwitchField
            label="Late Fee"
            description="Charge extra fee after a set day of the month"
            checked={watch('lateFeeEnabled')}
            onChange={(v) => { setValue('lateFeeEnabled', v); setDirty(true) }}
          />
        </div>
        {watchLateFeeEnabled && (
          <>
            <Field label="Late Fee Amount (৳)">
              <Input type="number" min={0} step={0.01} {...register('lateFeeAmount')} />
              {errors.lateFeeAmount && <p className="text-xs text-destructive">{errors.lateFeeAmount.message}</p>}
            </Field>
            <Field label="Charge After Day of Month">
              <Input type="number" min={1} max={31} {...register('lateFeeAfterDay')} />
            </Field>
          </>
        )}
        <div className="col-span-full">
          <SwitchField
            label="Waiving Requires Admin"
            description="Only admins can waive fee penalties"
            checked={watch('waivingRequiresAdmin')}
            onChange={(v) => { setValue('waivingRequiresAdmin', v); setDirty(true) }}
          />
        </div>
      </Section>

      {/* Exam & Result */}
      <Section title="Exam & Result" icon={BookOpen}>
        <Field label="Result Publish Mode">
          <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" {...register('resultPublishMode')}>
            <option value="MANUAL">Manual (admin publishes)</option>
            <option value="AUTOMATIC">Automatic (publish on entry)</option>
          </select>
        </Field>
        <div className="col-span-full grid grid-cols-1 sm:grid-cols-2 gap-2">
          <SwitchField
            label="Show GPA on Result"
            checked={watch('showGpaOnResult')}
            onChange={(v) => { setValue('showGpaOnResult', v); setDirty(true) }}
          />
          <SwitchField
            label="Show Position on Result"
            checked={watch('showPositionOnResult')}
            onChange={(v) => { setValue('showPositionOnResult', v); setDirty(true) }}
          />
        </div>
      </Section>

      {/* Library */}
      <Section title="Library" icon={Library}>
        <div className="col-span-full">
          <SwitchField
            label="Library Module Enabled"
            checked={watch('libraryEnabled')}
            onChange={(v) => { setValue('libraryEnabled', v); setDirty(true) }}
          />
        </div>
        <Field label="Max Books / Student">
          <Input type="number" min={1} max={20} {...register('maxBooksPerStudent')} />
        </Field>
        <Field label="Max Issue Days">
          <Input type="number" min={1} max={60} {...register('maxIssueDays')} />
        </Field>
        <Field label="Fine Per Day (৳)">
          <Input type="number" min={0} step={0.5} {...register('libraryFinePerDay')} />
        </Field>
      </Section>

      {/* Transport */}
      <Section title="Transport" icon={Bus}>
        <div className="col-span-full">
          <SwitchField
            label="Transport Module Enabled"
            checked={watch('transportEnabled')}
            onChange={(v) => { setValue('transportEnabled', v); setDirty(true) }}
          />
        </div>
      </Section>

      {/* Portal Visibility */}
      <Section title="Portal Visibility" icon={Eye}>
        <div className="col-span-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          <SwitchField label="Parent Portal" checked={watch('parentPortalEnabled')} onChange={(v) => { setValue('parentPortalEnabled', v); setDirty(true) }} />
          <SwitchField label="Student Portal" checked={watch('studentPortalEnabled')} onChange={(v) => { setValue('studentPortalEnabled', v); setDirty(true) }} />
          <SwitchField label="Show Fees in Portal" checked={watch('showFeeInPortal')} onChange={(v) => { setValue('showFeeInPortal', v); setDirty(true) }} />
          <SwitchField label="Show Results in Portal" checked={watch('showResultInPortal')} onChange={(v) => { setValue('showResultInPortal', v); setDirty(true) }} />
          <SwitchField label="Show Attendance in Portal" checked={watch('showAttendanceInPortal')} onChange={(v) => { setValue('showAttendanceInPortal', v); setDirty(true) }} />
          <SwitchField label="Show Notices in Portal" checked={watch('showNoticeInPortal')} onChange={(v) => { setValue('showNoticeInPortal', v); setDirty(true) }} />
        </div>
      </Section>

      {/* SMS Notifications */}
      <Section title="SMS Notifications" icon={Bell}>
        <div className="col-span-full grid grid-cols-1 sm:grid-cols-2 gap-2">
          <SwitchField label="Fee Reminder SMS" checked={watch('notifyFeeReminder')} onChange={(v) => { setValue('notifyFeeReminder', v); setDirty(true) }} />
          <SwitchField label="Exam Schedule SMS" checked={watch('notifyExamSchedule')} onChange={(v) => { setValue('notifyExamSchedule', v); setDirty(true) }} />
          <SwitchField label="Result Published SMS" checked={watch('notifyResultPublished')} onChange={(v) => { setValue('notifyResultPublished', v); setDirty(true) }} />
          <SwitchField label="Absence Alert SMS" checked={watch('notifyAbsence')} onChange={(v) => { setValue('notifyAbsence', v); setDirty(true) }} />
        </div>
        <Field label="Fee Reminder Days Before Due">
          <Input type="number" min={1} max={30} {...register('feeReminderDaysBefore')} />
        </Field>
      </Section>

      {/* Branding */}
      <Section title="Branding" icon={Palette}>
        <Field label="Primary Color (hex)">
          <div className="flex gap-2 items-center">
            <Input placeholder="#1a7c4f" maxLength={7} {...register('primaryColor')} className="font-mono" />
            {watch('primaryColor') && /^#[0-9a-fA-F]{6}$/.test(watch('primaryColor') ?? '') && (
              <div className="h-9 w-9 rounded-md border shrink-0" style={{ backgroundColor: watch('primaryColor') ?? undefined }} />
            )}
          </div>
          {errors.primaryColor && <p className="text-xs text-destructive">Must be valid hex e.g. #1a7c4f</p>}
        </Field>
        <div className="col-span-full sm:col-span-2">
          <Field label="Footer Text (printed on receipts / certificates)">
            <textarea
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[72px] resize-none"
              maxLength={500}
              placeholder="School address, phone, website..."
              {...register('footerText')}
            />
          </Field>
        </div>
      </Section>

      {/* Save */}
      <div className="flex items-center gap-3 sticky bottom-4">
        <Button type="submit" disabled={isPending || !dirty} className="shadow-md">
          {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Save Settings
        </Button>
        {dirty && <span className="text-xs text-muted-foreground">Unsaved changes</span>}
      </div>
    </form>
  )
}

// ─── Counters Tab ───────────────────────────────────────────────

function CountersTab({ schoolId }: { schoolId: string }) {
  const { data: counters = [], isLoading } = useSchoolCounters(schoolId)
  const { mutate: reset, isPending } = useResetCounter(schoolId)
  const [resetting, setResetting] = useState<CounterType | null>(null)

  const COUNTER_LABELS: Record<CounterType, string> = {
    RECEIPT_NUMBER: 'Receipt Number',
    STUDENT_ID: 'Student ID',
  }

  if (isLoading) {
    return <div className="flex items-center gap-2 text-muted-foreground text-sm py-8"><Loader2 className="h-4 w-4 animate-spin" /> Loading...</div>
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">
          Counters track auto-generated sequential numbers (receipt IDs, student IDs). Reset resets sequence to 0 (or specified value) for current year.
        </p>
      </div>

      {counters.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground text-sm">
            No counters yet — they are created on first use (first fee receipt or student ID generated).
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {counters.map((c) => (
          <Card key={c.id}>
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-sm">{COUNTER_LABELS[c.counterType] ?? c.counterType}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Last value: <span className="font-mono font-semibold">{c.lastValue}</span>
                  {c.year && ` · Year ${c.year}`}
                  {c.prefix && ` · Prefix: ${c.prefix}`}
                </p>
              </div>
              {resetting === c.counterType ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant="destructive" size="sm"
                    disabled={isPending}
                    onClick={() => {
                      reset({ counterType: c.counterType, resetToValue: 0 }, {
                        onSuccess: () => setResetting(null),
                        onError: () => setResetting(null),
                      })
                    }}
                  >
                    {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5 mr-1" />}
                    Confirm Reset to 0
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setResetting(null)}>Cancel</Button>
                </div>
              ) : (
                <Button
                  variant="outline" size="sm"
                  onClick={() => setResetting(c.counterType)}
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Reset
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-400">
            Resetting a counter does not change existing records. However, it may cause duplicate IDs if reset mid-year without care.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── System Settings Tab (SUPER_ADMIN only) ─────────────────────

const systemSchema = z.object({
  trialDays: z.coerce.number().int().min(1).max(365),
  trialSmsQuota: z.coerce.number().int().min(0),
  autoExpireTrials: z.boolean(),
  basicPlanMonthlyPrice: z.coerce.number().positive(),
  standardPlanMonthlyPrice: z.coerce.number().positive(),
  premiumPlanMonthlyPrice: z.coerce.number().positive(),
  basicPlanSmsQuota: z.coerce.number().int().min(0),
  standardPlanSmsQuota: z.coerce.number().int().min(0),
  premiumPlanSmsQuota: z.coerce.number().int().min(0),
  platformSmsProvider: z.string().nullable(),
  platformSmsSenderId: z.string().max(20).nullable(),
  maxUploadSizeMb: z.coerce.number().int().min(1).max(100),
  platformName: z.string().min(1).max(100),
  platformUrl: z.string().url(),
  supportEmail: z.string().email(),
  supportPhone: z.string().nullable(),
})
type SystemForm = z.infer<typeof systemSchema>

function SystemSettingsTab() {
  const { data: settings, isLoading } = useSystemSettings()
  const { mutate: save, isPending: saving } = useUpdateSystemSettings()
  const { mutate: toggleMaint, isPending: toggling } = useToggleMaintenance()
  const [dirty, setDirty] = useState(false)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<SystemForm>({
    resolver: zodResolver(systemSchema),
    values: settings ? {
      trialDays: settings.trialDays,
      trialSmsQuota: settings.trialSmsQuota,
      autoExpireTrials: settings.autoExpireTrials,
      basicPlanMonthlyPrice: settings.basicPlanMonthlyPrice,
      standardPlanMonthlyPrice: settings.standardPlanMonthlyPrice,
      premiumPlanMonthlyPrice: settings.premiumPlanMonthlyPrice,
      basicPlanSmsQuota: settings.basicPlanSmsQuota,
      standardPlanSmsQuota: settings.standardPlanSmsQuota,
      premiumPlanSmsQuota: settings.premiumPlanSmsQuota,
      platformSmsProvider: settings.platformSmsProvider,
      platformSmsSenderId: settings.platformSmsSenderId,
      maxUploadSizeMb: settings.maxUploadSizeMb,
      platformName: settings.platformName,
      platformUrl: settings.platformUrl,
      supportEmail: settings.supportEmail,
      supportPhone: settings.supportPhone,
    } : undefined,
  })

  if (isLoading) {
    return <div className="flex items-center gap-2 text-muted-foreground text-sm py-8"><Loader2 className="h-4 w-4 animate-spin" /> Loading...</div>
  }

  const onSubmit = (data: SystemForm) => {
    save(data, { onSuccess: () => setDirty(false) })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} onChange={() => setDirty(true)} className="space-y-5">
      {/* Maintenance Mode — prominent card at top */}
      <Card className={cn(
        'border-2',
        settings?.maintenanceMode
          ? 'border-red-400 bg-red-50 dark:bg-red-950/20'
          : 'border-border',
      )}>
        <CardContent className="p-5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3">
            <Wrench className={cn('h-5 w-5 mt-0.5', settings?.maintenanceMode ? 'text-red-500' : 'text-muted-foreground')} />
            <div>
              <p className="font-semibold text-sm">Maintenance Mode</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {settings?.maintenanceMode
                  ? 'Platform is in maintenance mode — users cannot log in.'
                  : 'Platform is live and accessible to all users.'}
              </p>
              {settings?.maintenanceMessage && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1 italic">"{settings.maintenanceMessage}"</p>
              )}
            </div>
          </div>
          <Button
            type="button"
            variant={settings?.maintenanceMode ? 'destructive' : 'outline'}
            disabled={toggling}
            onClick={() =>
              toggleMaint({ maintenanceMode: !settings?.maintenanceMode })
            }
          >
            {toggling && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {settings?.maintenanceMode ? 'Disable Maintenance' : 'Enable Maintenance'}
          </Button>
        </CardContent>
      </Card>

      {/* Trial / Onboarding */}
      <Section title="Trial & Onboarding" icon={Settings}>
        <Field label="Trial Days">
          <Input type="number" min={1} max={365} {...register('trialDays')} />
        </Field>
        <Field label="Trial SMS Quota">
          <Input type="number" min={0} {...register('trialSmsQuota')} />
        </Field>
        <div className="col-span-full">
          <SwitchField
            label="Auto Expire Trials"
            description="Automatically deactivate schools when trial period ends"
            checked={watch('autoExpireTrials')}
            onChange={(v) => { setValue('autoExpireTrials', v); setDirty(true) }}
          />
        </div>
      </Section>

      {/* Subscription Pricing */}
      <Section title="Subscription Pricing (৳/month)" icon={DollarSign}>
        <Field label="Basic Plan">
          <Input type="number" min={0} step={100} {...register('basicPlanMonthlyPrice')} />
          {errors.basicPlanMonthlyPrice && <p className="text-xs text-destructive">{errors.basicPlanMonthlyPrice.message}</p>}
        </Field>
        <Field label="Standard Plan">
          <Input type="number" min={0} step={100} {...register('standardPlanMonthlyPrice')} />
          {errors.standardPlanMonthlyPrice && <p className="text-xs text-destructive">{errors.standardPlanMonthlyPrice.message}</p>}
        </Field>
        <Field label="Premium Plan">
          <Input type="number" min={0} step={100} {...register('premiumPlanMonthlyPrice')} />
          {errors.premiumPlanMonthlyPrice && <p className="text-xs text-destructive">{errors.premiumPlanMonthlyPrice.message}</p>}
        </Field>
      </Section>

      {/* SMS Quotas */}
      <Section title="SMS Quota per Plan" icon={Bell}>
        <Field label="Basic Plan SMS">
          <Input type="number" min={0} {...register('basicPlanSmsQuota')} />
        </Field>
        <Field label="Standard Plan SMS">
          <Input type="number" min={0} {...register('standardPlanSmsQuota')} />
        </Field>
        <Field label="Premium Plan SMS">
          <Input type="number" min={0} {...register('premiumPlanSmsQuota')} />
        </Field>
      </Section>

      {/* Platform SMS Gateway */}
      <Section title="Platform SMS Gateway" icon={Bell}>
        <Field label="SMS Provider">
          <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" {...register('platformSmsProvider')}>
            <option value="">None</option>
            <option value="SSL_WIRELESS">SSL Wireless</option>
            <option value="BANGLALINK_BT">Banglalink BT</option>
            <option value="ROBI_AXIATA">Robi Axiata</option>
            <option value="CUSTOM">Custom</option>
          </select>
        </Field>
        <Field label="Sender ID">
          <Input placeholder="EDUMGBD" maxLength={20} {...register('platformSmsSenderId')} />
        </Field>
      </Section>

      {/* File / Storage */}
      <Section title="File & Storage" icon={Server}>
        <Field label="Max Upload Size (MB)">
          <Input type="number" min={1} max={100} {...register('maxUploadSizeMb')} />
        </Field>
      </Section>

      {/* Platform Info */}
      <Section title="Platform Info" icon={Cog}>
        <Field label="Platform Name">
          <Input {...register('platformName')} />
          {errors.platformName && <p className="text-xs text-destructive">{errors.platformName.message}</p>}
        </Field>
        <Field label="Platform URL">
          <Input type="url" placeholder="https://..." {...register('platformUrl')} />
          {errors.platformUrl && <p className="text-xs text-destructive">{errors.platformUrl.message}</p>}
        </Field>
        <Field label="Support Email">
          <Input type="email" {...register('supportEmail')} />
          {errors.supportEmail && <p className="text-xs text-destructive">{errors.supportEmail.message}</p>}
        </Field>
        <Field label="Support Phone">
          <Input placeholder="+880..." {...register('supportPhone')} />
        </Field>
      </Section>

      <div className="flex items-center gap-3 sticky bottom-4">
        <Button type="submit" disabled={saving || !dirty} className="shadow-md">
          {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Save System Settings
        </Button>
        {dirty && <span className="text-xs text-muted-foreground">Unsaved changes</span>}
      </div>
    </form>
  )
}

// ─── Main Page ──────────────────────────────────────────────────

type Tab = 'school' | 'counters' | 'system'

function SettingsPage() {
  const { user } = useAuthStore()
  const schoolId = user?.schoolId ?? null
  const role = user?.role

  const isSuperAdmin = role === 'SUPER_ADMIN'
  const canManage = role === 'SUPER_ADMIN' || role === 'SCHOOL_ADMIN' || role === 'PRINCIPAL'

  const [tab, setTab] = useState<Tab>(isSuperAdmin && !schoolId ? 'system' : 'school')

  const tabs: { key: Tab; label: string; icon: React.ElementType; hidden?: boolean }[] = [
    { key: 'school', label: 'School Settings', icon: Cog, hidden: !schoolId },
    { key: 'counters', label: 'Counters', icon: RotateCcw, hidden: !schoolId || (!canManage) },
    { key: 'system', label: 'System', icon: Server, hidden: !isSuperAdmin },
  ]

  const visibleTabs = tabs.filter((t) => !t.hidden)

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage school and platform configuration.</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b pb-0 overflow-x-auto">
        {visibleTabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap',
              tab === key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === 'school' && schoolId && <SchoolSettingsTab schoolId={schoolId} />}
      {tab === 'counters' && schoolId && <CountersTab schoolId={schoolId} />}
      {tab === 'system' && isSuperAdmin && <SystemSettingsTab />}
    </div>
  )
}
