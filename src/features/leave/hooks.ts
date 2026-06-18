import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { staffLeavesApi, schoolLeavesApi } from '@/api/leaves'
import type { CreateLeavePayload, ReviewLeavePayload, CancelLeavePayload } from '@/types/leave'

const SK = (schoolId: string, staffId: string) => ['leaves', schoolId, staffId]
const AK = (schoolId: string) => ['all-leaves', schoolId]

// ── Staff-scoped ───────────────────────────────────────────────

export function useStaffLeaves(
  schoolId: string | null,
  staffId: string | null,
  params: { status?: string; type?: string; year?: number } = {}
) {
  return useQuery({
    queryKey: [...SK(schoolId ?? '', staffId ?? ''), params],
    queryFn: async () => {
      const r = await staffLeavesApi.list(schoolId!, staffId!, params)
      return r.data.data ?? []
    },
    enabled: !!schoolId && !!staffId,
    staleTime: 20 * 1000,
  })
}

export function useCreateLeave(schoolId: string, staffId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p: CreateLeavePayload) => staffLeavesApi.create(schoolId, staffId, p),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SK(schoolId, staffId) })
      qc.invalidateQueries({ queryKey: AK(schoolId) })
      toast.success('Leave application submitted')
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message ?? ''
      if (msg === 'LEAVE_ONCE_PER_TENURE') toast.error('This leave type can only be applied once per tenure')
      else if (msg === 'LEAVE_INVALID_DATE_RANGE') toast.error('End date must be on or after start date')
      else toast.error(msg || 'Failed to apply for leave')
    },
  })
}

export function useReviewLeave(schoolId: string, staffId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ leaveId, payload }: { leaveId: string; payload: ReviewLeavePayload }) =>
      staffLeavesApi.review(schoolId, staffId, leaveId, payload),
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: SK(schoolId, staffId) })
      qc.invalidateQueries({ queryKey: AK(schoolId) })
      toast.success(v.payload.status === 'APPROVED' ? 'Leave approved' : 'Leave rejected')
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message ?? ''
      if (msg === 'LEAVE_NOT_PENDING') toast.error('Leave is no longer pending')
      else toast.error(msg || 'Failed to review')
    },
  })
}

export function useCancelLeave(schoolId: string, staffId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ leaveId, payload }: { leaveId: string; payload?: CancelLeavePayload }) =>
      staffLeavesApi.cancel(schoolId, staffId, leaveId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SK(schoolId, staffId) })
      qc.invalidateQueries({ queryKey: AK(schoolId) })
      toast.success('Leave cancelled')
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message ?? ''
      if (msg === 'LEAVE_NOT_PENDING') toast.error('Only pending leaves can be cancelled')
      else if (msg === 'LEAVE_NOT_OWN_LEAVE') toast.error('Cannot cancel another staff member\'s leave')
      else toast.error(msg || 'Failed to cancel')
    },
  })
}

export function useDeleteLeave(schoolId: string, staffId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (leaveId: string) => staffLeavesApi.delete(schoolId, staffId, leaveId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SK(schoolId, staffId) })
      qc.invalidateQueries({ queryKey: AK(schoolId) })
      toast.success('Leave application deleted')
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message ?? ''
      if (msg === 'LEAVE_CANNOT_DELETE_NON_PENDING') toast.error('Only pending leaves can be deleted')
      else toast.error(msg || 'Failed to delete')
    },
  })
}

// ── School-wide (admin dashboard) ─────────────────────────────

export function useAllLeaves(
  schoolId: string | null,
  params: { status?: string; type?: string; year?: number } = {}
) {
  return useQuery({
    queryKey: [...AK(schoolId ?? ''), params],
    queryFn: async () => {
      const r = await schoolLeavesApi.list(schoolId!, params)
      return r.data.data ?? []
    },
    enabled: !!schoolId,
    staleTime: 20 * 1000,
  })
}
