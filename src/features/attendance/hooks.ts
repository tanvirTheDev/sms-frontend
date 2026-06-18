import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { studentAttendanceApi, staffAttendanceApi } from '@/api/attendance'
import type { BulkStudentAttendancePayload, BulkStaffAttendancePayload } from '@/types/attendance'

// ── Student Attendance ────────────────────────────────────────────

export function useStudentAttendance(
  schoolId: string | null,
  params: { sectionId: string; date: string } | null,
) {
  return useQuery({
    queryKey: ['student-attendance', schoolId, params],
    queryFn: async () => {
      const res = await studentAttendanceApi.list(schoolId!, params!)
      return res.data.data ?? []
    },
    enabled: !!schoolId && !!params?.sectionId && !!params?.date,
    staleTime: 30 * 1000,
  })
}

export function useBulkStudentAttendance(schoolId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: BulkStudentAttendancePayload) =>
      studentAttendanceApi.bulkSave(schoolId, payload),
    onSuccess: (_, payload) => {
      qc.invalidateQueries({ queryKey: ['student-attendance', schoolId] })
      toast.success(`Attendance saved for ${payload.records.length} students`)
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? 'Failed to save attendance')
    },
  })
}

export function useMonthlyStudentReport(
  schoolId: string | null,
  params: { sectionId: string; month: number; year: number } | null,
) {
  return useQuery({
    queryKey: ['student-attendance-report', schoolId, params],
    queryFn: async () => {
      const res = await studentAttendanceApi.monthlyReport(schoolId!, params!)
      return res.data.data ?? []
    },
    enabled: !!schoolId && !!params?.sectionId,
    staleTime: 2 * 60 * 1000,
  })
}

// ── Staff Attendance ──────────────────────────────────────────────

export function useStaffAttendance(
  schoolId: string | null,
  date: string | null,
) {
  return useQuery({
    queryKey: ['staff-attendance', schoolId, date],
    queryFn: async () => {
      const res = await staffAttendanceApi.list(schoolId!, { date: date! })
      return res.data.data ?? []
    },
    enabled: !!schoolId && !!date,
    staleTime: 30 * 1000,
  })
}

export function useBulkStaffAttendance(schoolId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: BulkStaffAttendancePayload) =>
      staffAttendanceApi.bulkSave(schoolId, payload),
    onSuccess: (_, payload) => {
      qc.invalidateQueries({ queryKey: ['staff-attendance', schoolId] })
      toast.success(`Attendance saved for ${payload.records.length} staff`)
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? 'Failed to save attendance')
    },
  })
}
