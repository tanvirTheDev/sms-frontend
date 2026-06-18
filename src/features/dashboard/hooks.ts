import { useQuery } from '@tanstack/react-query'
import { studentsApi } from '@/api/students'
import { staffApi } from '@/api/staff'
import type { StaffListResponse } from '@/api/staff'
import { feeCollectionApi } from '@/api/fees'
import { noticesApi } from '@/api/notices'

const currentYear = new Date().getFullYear()

export function useStudentCount(schoolId: string | null) {
  return useQuery({
    queryKey: ['students', 'count', schoolId],
    queryFn: async () => {
      const res = await studentsApi.list(schoolId!, { page: 1, limit: 1, isActive: true })
      const body = res.data as unknown as { meta: { total: number } }
      return body.meta?.total ?? 0
    },
    enabled: !!schoolId,
    staleTime: 5 * 60 * 1000,
  })
}

export function useStaffCount(schoolId: string | null) {
  return useQuery({
    queryKey: ['staff', 'count', schoolId],
    queryFn: async () => {
      const res = await staffApi.list(schoolId!, { page: 1, limit: 1, isActive: true })
      const body = res.data as unknown as StaffListResponse
      return body.meta?.total ?? 0
    },
    enabled: !!schoolId,
    staleTime: 5 * 60 * 1000,
  })
}

export function useFeeSummary(schoolId: string | null) {
  return useQuery({
    queryKey: ['fees', 'summary', schoolId, currentYear],
    queryFn: async () => {
      const res = await feeCollectionApi.summary(schoolId!, { billingYear: currentYear })
      return res.data.data
    },
    enabled: !!schoolId,
    staleTime: 5 * 60 * 1000,
  })
}

export function useDueReport(schoolId: string | null) {
  return useQuery({
    queryKey: ['fees', 'due-report', schoolId],
    queryFn: async () => {
      const res = await feeCollectionApi.dueReport(schoolId!, {})
      return res.data.data ?? []
    },
    enabled: !!schoolId,
    staleTime: 5 * 60 * 1000,
  })
}

export function useRecentNotices(schoolId: string | null) {
  return useQuery({
    queryKey: ['notices', 'recent', schoolId],
    queryFn: async () => {
      const res = await noticesApi.list(schoolId!, { isPublished: true, limit: 5, page: 1 })
      // Flat list shape: { success, data: Notice[], meta }
      const body = res.data as unknown as { data: NonNullable<typeof res.data.data>[number][] }
      return body.data ?? []
    },
    enabled: !!schoolId,
    staleTime: 2 * 60 * 1000,
  })
}
