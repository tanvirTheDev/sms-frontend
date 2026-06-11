import { useQuery } from '@tanstack/react-query'
import { studentsApi } from '@/api/students'
import { staffApi } from '@/api/staff'
import { feesApi } from '@/api/fees'
import { noticesApi } from '@/api/notices'

const currentYear = new Date().getFullYear()

export function useStudentCount(schoolId: string | null) {
  return useQuery({
    queryKey: ['students', 'count', schoolId],
    queryFn: async () => {
      const { data } = await studentsApi.list(schoolId!, { page: 1, limit: 1, isActive: true })
      return data.data?.meta.total ?? 0
    },
    enabled: !!schoolId,
    staleTime: 5 * 60 * 1000,
  })
}

export function useStaffCount(schoolId: string | null) {
  return useQuery({
    queryKey: ['staff', 'count', schoolId],
    queryFn: async () => {
      const { data } = await staffApi.list(schoolId!, { page: 1, limit: 1, isActive: true })
      return data.data?.meta.total ?? 0
    },
    enabled: !!schoolId,
    staleTime: 5 * 60 * 1000,
  })
}

export function useFeeSummary(schoolId: string | null) {
  return useQuery({
    queryKey: ['fees', 'summary', schoolId, currentYear],
    queryFn: async () => {
      const { data } = await feesApi.getSummary(schoolId!, { year: currentYear })
      return data.data
    },
    enabled: !!schoolId,
    staleTime: 5 * 60 * 1000,
  })
}

export function useDueReport(schoolId: string | null) {
  return useQuery({
    queryKey: ['fees', 'due-report', schoolId],
    queryFn: async () => {
      const { data } = await feesApi.getDueReport(schoolId!, { limit: 5 })
      return data.data
    },
    enabled: !!schoolId,
    staleTime: 5 * 60 * 1000,
  })
}

export function useRecentNotices(schoolId: string | null) {
  return useQuery({
    queryKey: ['notices', 'recent', schoolId],
    queryFn: async () => {
      const { data } = await noticesApi.list(schoolId!, {
        isPublished: true,
        limit: 5,
        page: 1,
      })
      return data.data?.data ?? []
    },
    enabled: !!schoolId,
    staleTime: 2 * 60 * 1000,
  })
}
