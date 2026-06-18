import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  examSchedulesApi,
  examResultsApi,
  studentResultsApi,
  type ListSchedulesQuery,
  type ListResultsQuery,
} from '@/api/exams'
import type { CreateExamSchedulePayload, UpdateExamSchedulePayload, UpsertResultEntry } from '@/types/exam'

const SK = (schoolId: string) => ['exam-schedules', schoolId]
const RK = (schoolId: string, examScheduleId: string) => ['exam-results', schoolId, examScheduleId]

// ── Schedules ──────────────────────────────────────────────────

export function useExamSchedules(schoolId: string | null, query: ListSchedulesQuery = {}) {
  return useQuery({
    queryKey: [...SK(schoolId ?? ''), query],
    queryFn: async () => {
      const res = await examSchedulesApi.list(schoolId!, query)
      return res.data.data ?? []
    },
    enabled: !!schoolId,
    staleTime: 30 * 1000,
  })
}

export function useCreateExamSchedule(schoolId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateExamSchedulePayload) => examSchedulesApi.create(schoolId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SK(schoolId) })
      toast.success('Exam schedule created')
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message ?? ''
      if (msg === 'EXAM_SCHEDULE_CONFLICT') toast.error('Schedule for this class/exam type/year already exists')
      else toast.error(msg || 'Failed to create schedule')
    },
  })
}

export function useUpdateExamSchedule(schoolId: string, id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateExamSchedulePayload) => examSchedulesApi.update(schoolId, id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SK(schoolId) })
      toast.success('Schedule updated')
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? 'Failed to update'),
  })
}

export function useDeleteExamSchedule(schoolId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => examSchedulesApi.delete(schoolId, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SK(schoolId) })
      toast.success('Schedule deleted')
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message ?? ''
      const friendly: Record<string, string> = {
        EXAM_SCHEDULE_PUBLISHED: 'Cannot delete — schedule is published.',
        EXAM_SCHEDULE_HAS_RESULTS: 'Cannot delete — results have been entered.',
      }
      toast.error((friendly[msg] ?? msg) || 'Failed to delete')
    },
  })
}

export function usePublishExamSchedule(schoolId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isPublished }: { id: string; isPublished: boolean }) =>
      examSchedulesApi.publish(schoolId, id, isPublished),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: SK(schoolId) })
      toast.success(vars.isPublished ? 'Schedule published' : 'Schedule unpublished')
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? 'Failed to publish'),
  })
}

export function usePublishExamResults(schoolId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ examId, isPublished }: { examId: string; isPublished: boolean }) =>
      examResultsApi.publishResults(schoolId, examId, isPublished),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: SK(schoolId) })
      toast.success(vars.isPublished ? 'Results published to students' : 'Results unpublished')
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message ?? ''
      const friendly: Record<string, string> = {
        EXAM_RESULTS_ALREADY_PUBLISHED: 'Results already published.',
        NO_RESULTS_TO_PUBLISH: 'No results to publish yet.',
      }
      toast.error((friendly[msg] ?? msg) || 'Failed to publish results')
    },
  })
}

// ── Results ────────────────────────────────────────────────────

export function useExamResults(schoolId: string | null, examScheduleId: string | null, query: ListResultsQuery = {}) {
  return useQuery({
    queryKey: [...RK(schoolId ?? '', examScheduleId ?? ''), query],
    queryFn: async () => {
      const res = await examResultsApi.list(schoolId!, examScheduleId!, query)
      return res.data.data ?? []
    },
    enabled: !!schoolId && !!examScheduleId,
    staleTime: 15 * 1000,
  })
}

export function useBulkUpsertResults(schoolId: string, examScheduleId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (results: UpsertResultEntry[]) => examResultsApi.bulkUpsert(schoolId, examScheduleId, results),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: RK(schoolId, examScheduleId) })
      toast.success('Marks saved')
    },
    onError: (err: any) => {
      const msg: string = err.response?.data?.message ?? ''
      if (msg.startsWith('STUDENT_NOT_IN_SECTION:')) {
        toast.error(`Student not in section: ${msg.split(':')[1]}`)
      } else if (msg.startsWith('SUBJECT_NOT_FOUND:')) {
        toast.error(`Subject not found: ${msg.split(':')[1]}`)
      } else {
        toast.error(msg || 'Failed to save marks')
      }
    },
  })
}

// ── Student Results ────────────────────────────────────────────

export function useStudentResults(
  schoolId: string | null,
  studentId: string | null,
  query: { examScheduleId?: string; academicYearId?: string } = {}
) {
  return useQuery({
    queryKey: ['student-results', schoolId, studentId, query],
    queryFn: async () => {
      const res = await studentResultsApi.list(schoolId!, studentId!, query)
      return res.data.data ?? []
    },
    enabled: !!schoolId && !!studentId,
    staleTime: 30 * 1000,
  })
}
