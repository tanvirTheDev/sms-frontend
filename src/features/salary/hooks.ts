import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { salaryApi, type ListSalaryQuery } from '@/api/salary'
import type { CreateSalaryPayload, UpdateSalaryPayload } from '@/types/salary'

const SK = (schoolId: string) => ['salary', schoolId]

export function useSalaryRecords(schoolId: string | null, query: ListSalaryQuery = {}) {
  return useQuery({
    queryKey: [...SK(schoolId ?? ''), query],
    queryFn: async () => {
      const res = await salaryApi.list(schoolId!, query)
      return res.data.data ?? []
    },
    enabled: !!schoolId,
    staleTime: 30 * 1000,
  })
}

export function useSalarySlip(schoolId: string | null, id: string | null) {
  return useQuery({
    queryKey: ['salary-slip', schoolId, id],
    queryFn: async () => {
      const res = await salaryApi.getSlip(schoolId!, id!)
      return res.data.data!
    },
    enabled: !!schoolId && !!id,
    staleTime: 60 * 1000,
  })
}

export function useCreateSalaryRecord(schoolId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateSalaryPayload) => salaryApi.create(schoolId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SK(schoolId) })
      toast.success('Salary record created')
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message ?? ''
      if (msg === 'SALARY_RECORD_CONFLICT') toast.error('Record for this month/year already exists')
      else if (msg === 'STAFF_NOT_FOUND') toast.error('Staff not found')
      else if (msg === 'ACADEMIC_YEAR_NOT_FOUND') toast.error('Academic year not found')
      else toast.error(msg || 'Failed to create record')
    },
  })
}

export function useUpdateSalaryRecord(schoolId: string, id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateSalaryPayload) => salaryApi.update(schoolId, id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SK(schoolId) })
      toast.success('Salary record updated')
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? 'Failed to update'),
  })
}
