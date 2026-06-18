import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { guardiansApi } from '@/api/guardians'
import type { CreateGuardianPayload, UpdateGuardianPayload } from '@/types/guardian'

const GK = (schoolId: string, studentId: string) => ['guardians', schoolId, studentId]

export function useGuardians(schoolId: string | null, studentId: string | null) {
  return useQuery({
    queryKey: GK(schoolId ?? '', studentId ?? ''),
    queryFn: async () => {
      const res = await guardiansApi.list(schoolId!, studentId!)
      return res.data.data ?? []
    },
    enabled: !!schoolId && !!studentId,
    staleTime: 30 * 1000,
  })
}

function extractValidationErrors(err: any): string {
  const data = err.response?.data
  if (!data) return 'Failed to add guardian'
  if (data.message !== 'Validation failed') return data.message || 'Failed to add guardian'
  // flatten Zod errors into one readable string
  const fieldErrors: Record<string, string[]> = data.errors?.fieldErrors ?? {}
  const lines = Object.entries(fieldErrors)
    .filter(([, msgs]) => msgs?.length)
    .map(([field, msgs]) => `${field}: ${msgs[0]}`)
  return lines.length ? lines.join(' · ') : 'Validation failed'
}

export function useCreateGuardian(schoolId: string, studentId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateGuardianPayload) =>
      guardiansApi.create(schoolId, studentId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: GK(schoolId, studentId) })
      toast.success('Guardian added')
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message ?? ''
      if (msg === 'GUARDIAN_RELATION_CONFLICT') toast.error('A guardian with this relation already exists')
      else toast.error(extractValidationErrors(err))
    },
  })
}

export function useUpdateGuardian(schoolId: string, studentId: string, id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateGuardianPayload) =>
      guardiansApi.update(schoolId, studentId, id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: GK(schoolId, studentId) })
      toast.success('Guardian updated')
    },
    onError: (err: any) => toast.error(extractValidationErrors(err)),
  })
}

export function useDeleteGuardian(schoolId: string, studentId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => guardiansApi.delete(schoolId, studentId, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: GK(schoolId, studentId) })
      toast.success('Guardian removed')
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message ?? ''
      if (msg === 'GUARDIAN_LAST_EMERGENCY_CONTACT') toast.error('Cannot remove last emergency contact')
      else toast.error(msg || 'Failed to remove guardian')
    },
  })
}
