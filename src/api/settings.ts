import { apiClient } from './client'
import type { ApiResponse } from '@/types'

// ─── School Settings ────────────────────────────────────────────

export type WeekStart = 'SUNDAY' | 'SATURDAY' | 'MONDAY'
export type AttendanceMode = 'MANUAL' | 'QR_CODE' | 'BIOMETRIC'
export type ReceiptNumberFormat = 'SEQUENTIAL' | 'YEAR_SEQUENTIAL' | 'YEAR_MONTH_SEQ'
export type ResultPublishMode = 'MANUAL' | 'AUTOMATIC'
export type StudentIdFormat = 'YEAR_SEQ' | 'SCHOOL_YEAR_SEQ' | 'CUSTOM_PREFIX'
export type CounterType = 'RECEIPT_NUMBER' | 'STUDENT_ID'

export interface SchoolSettings {
  id: string
  schoolId: string
  weekStart: WeekStart
  workingDaysPerWeek: number
  classPeriodsPerDay: number
  periodDurationMinutes: number
  attendanceMode: AttendanceMode
  lateThresholdMinutes: number
  minAttendancePercent: number
  smsOnAbsence: boolean
  studentIdFormat: StudentIdFormat
  studentIdPrefix: string | null
  receiptNumberFormat: ReceiptNumberFormat
  receiptPrefix: string | null
  lateFeeEnabled: boolean
  lateFeeAmount: number | null
  lateFeeAfterDay: number | null
  waivingRequiresAdmin: boolean
  resultPublishMode: ResultPublishMode
  showGpaOnResult: boolean
  showPositionOnResult: boolean
  libraryEnabled: boolean
  maxBooksPerStudent: number
  maxIssueDays: number
  libraryFinePerDay: number
  transportEnabled: boolean
  parentPortalEnabled: boolean
  studentPortalEnabled: boolean
  showFeeInPortal: boolean
  showResultInPortal: boolean
  showAttendanceInPortal: boolean
  showNoticeInPortal: boolean
  notifyFeeReminder: boolean
  feeReminderDaysBefore: number
  notifyExamSchedule: boolean
  notifyResultPublished: boolean
  notifyAbsence: boolean
  primaryColor: string | null
  footerText: string | null
  updatedAt: string
}

export type UpdateSchoolSettingsPayload = Partial<Omit<SchoolSettings, 'id' | 'schoolId' | 'updatedAt'>>

export interface SchoolCounter {
  id: string
  schoolId: string
  counterType: CounterType
  lastValue: number
  prefix: string | null
  year: number | null
}

export interface ResetCounterPayload {
  counterType: CounterType
  resetToValue?: number
}

// ─── System Settings ────────────────────────────────────────────

export interface SystemSettings {
  id: string
  trialDays: number
  trialSmsQuota: number
  autoExpireTrials: boolean
  basicPlanMonthlyPrice: number
  standardPlanMonthlyPrice: number
  premiumPlanMonthlyPrice: number
  basicPlanSmsQuota: number
  standardPlanSmsQuota: number
  premiumPlanSmsQuota: number
  platformSmsProvider: string | null
  platformSmsSenderId: string | null
  maxUploadSizeMb: number
  allowedFileTypes: string[]
  storageProvider: string
  cdnBaseUrl: string | null
  maintenanceMode: boolean
  maintenanceMessage: string | null
  maintenanceAllowAdmin: boolean
  platformName: string
  platformUrl: string
  supportEmail: string
  supportPhone: string | null
  updatedAt: string
}

export type UpdateSystemSettingsPayload = Partial<Omit<SystemSettings, 'id' | 'updatedAt'>>

export interface ToggleMaintenancePayload {
  maintenanceMode: boolean
  maintenanceMessage?: string | null
  maintenanceAllowAdmin?: boolean
}

// ─── API ────────────────────────────────────────────────────────

export const settingsApi = {
  // School settings
  getSchool: (schoolId: string) =>
    apiClient.get<ApiResponse<SchoolSettings>>(`/schools/${schoolId}/settings`),

  updateSchool: (schoolId: string, payload: UpdateSchoolSettingsPayload) =>
    apiClient.patch<ApiResponse<SchoolSettings>>(`/schools/${schoolId}/settings`, payload),

  getCounters: (schoolId: string) =>
    apiClient.get<ApiResponse<SchoolCounter[]>>(`/schools/${schoolId}/settings/counters`),

  resetCounter: (schoolId: string, payload: ResetCounterPayload) =>
    apiClient.patch<ApiResponse<SchoolCounter>>(`/schools/${schoolId}/settings/counters/reset`, payload),

  // System settings (SUPER_ADMIN only)
  getSystem: () =>
    apiClient.get<ApiResponse<SystemSettings>>('/system/settings'),

  updateSystem: (payload: UpdateSystemSettingsPayload) =>
    apiClient.patch<ApiResponse<SystemSettings>>('/system/settings', payload),

  toggleMaintenance: (payload: ToggleMaintenancePayload) =>
    apiClient.patch<ApiResponse<SystemSettings>>('/system/settings/maintenance', payload),
}
