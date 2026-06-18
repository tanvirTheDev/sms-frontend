import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { feeStructureApi, feeCollectionApi, type ListFeeStructuresQuery, type ListFeeCollectionsQuery } from '@/api/fees'
import type {
  CreateFeeStructurePayload, UpdateFeeStructurePayload,
  CreateFeeCollectionPayload, UpdateFeeCollectionPayload,
} from '@/types/fee'

const FS_KEY = 'fee-structures'
const FC_KEY = 'fee-collections'

const ERR: Record<string, string> = {
  FEE_STRUCTURE_NOT_FOUND: 'Fee structure not found.',
  FEE_STRUCTURE_CONFLICT: 'Fee structure for this type already exists for this class/year.',
  FEE_STRUCTURE_HAS_COLLECTIONS: 'Cannot delete — collections exist for this structure.',
  FEE_COLLECTION_NOT_FOUND: 'Fee collection not found.',
  FEE_COLLECTION_WAIVED: 'Cannot edit a waived collection.',
  DISCOUNT_EXCEEDS_AMOUNT: 'Discount exceeds the fee amount.',
  PAID_AMOUNT_EXCEEDS_DUE: 'Paid amount exceeds outstanding due.',
  STUDENT_NOT_FOUND: 'Student not found.',
  ACADEMIC_YEAR_NOT_FOUND: 'Academic year not found.',
}

const handleErr = (err: { response?: { data?: { message?: string } } }, fallback: string) => {
  const msg = err.response?.data?.message ?? fallback
  toast.error(ERR[msg] ?? msg)
}

// ── Fee Structures ────────────────────────────────────────────────

export function useFeeStructures(schoolId: string | null, query: ListFeeStructuresQuery = {}) {
  return useQuery({
    queryKey: [FS_KEY, schoolId, query],
    queryFn: async () => {
      const res = await feeStructureApi.list(schoolId!, query)
      return res.data.data ?? []
    },
    enabled: !!schoolId,
    staleTime: 60 * 1000,
  })
}

export function useCreateFeeStructure(schoolId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateFeeStructurePayload) => feeStructureApi.create(schoolId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [FS_KEY, schoolId] })
      toast.success('Fee structure created')
    },
    onError: (err: any) => handleErr(err, 'Failed to create fee structure'),
  })
}

export function useUpdateFeeStructure(schoolId: string, id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateFeeStructurePayload) => feeStructureApi.update(schoolId, id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [FS_KEY, schoolId] })
      toast.success('Fee structure updated')
    },
    onError: (err: any) => handleErr(err, 'Failed to update'),
  })
}

export function useDeleteFeeStructure(schoolId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => feeStructureApi.delete(schoolId, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [FS_KEY, schoolId] })
      toast.success('Fee structure deleted')
    },
    onError: (err: any) => handleErr(err, 'Failed to delete'),
  })
}

// ── Fee Collections ───────────────────────────────────────────────

export function useFeeCollections(schoolId: string | null, query: ListFeeCollectionsQuery = {}) {
  return useQuery({
    queryKey: [FC_KEY, schoolId, query],
    queryFn: async () => {
      const res = await feeCollectionApi.list(schoolId!, query)
      return { data: res.data.data ?? [], meta: res.data.meta }
    },
    enabled: !!schoolId,
    staleTime: 30 * 1000,
  })
}

export function useCreateFeeCollection(schoolId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateFeeCollectionPayload) => feeCollectionApi.create(schoolId, payload),
    onSuccess: ({ data }) => {
      qc.invalidateQueries({ queryKey: [FC_KEY, schoolId] })
      const receipt = data.data?.receiptNo
      toast.success(receipt ? `Payment recorded — Receipt: ${receipt}` : 'Fee entry recorded')
    },
    onError: (err: any) => handleErr(err, 'Failed to record payment'),
  })
}

export function useUpdateFeeCollection(schoolId: string, id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateFeeCollectionPayload) => feeCollectionApi.update(schoolId, id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [FC_KEY, schoolId] })
      toast.success('Payment updated')
    },
    onError: (err: any) => handleErr(err, 'Failed to update payment'),
  })
}

// ── Due Report ────────────────────────────────────────────────────

export function useDueReport(
  schoolId: string | null,
  query: { academicYearId?: string; classId?: string; sectionId?: string },
) {
  return useQuery({
    queryKey: ['due-report', schoolId, query],
    queryFn: async () => {
      const res = await feeCollectionApi.dueReport(schoolId!, query)
      return res.data.data ?? []
    },
    enabled: !!schoolId,
    staleTime: 60 * 1000,
  })
}

// ── My Fees (student/parent self-service) ─────────────────────────

export function useMyFees(
  schoolId: string | null,
  studentId: string | null,
  query: { academicYearId?: string; status?: import('@/types/fee').PaymentStatus; billingYear?: number } = {},
) {
  return useQuery({
    queryKey: ['my-fees', schoolId, studentId, query],
    queryFn: async () => {
      const res = await feeCollectionApi.myFees(schoolId!, studentId!, query)
      const d = res.data.data
      return d ? { fees: d.fees ?? [], summary: d.summary } : null
    },
    enabled: !!schoolId && !!studentId,
    staleTime: 30 * 1000,
  })
}

// ── Summary ───────────────────────────────────────────────────────

export function useFeeSummary(
  schoolId: string | null,
  query: { academicYearId?: string; billingMonth?: number; billingYear?: number } = {},
) {
  return useQuery({
    queryKey: ['fee-summary', schoolId, query],
    queryFn: async () => {
      const res = await feeCollectionApi.summary(schoolId!, query)
      return res.data.data
    },
    enabled: !!schoolId,
    staleTime: 60 * 1000,
  })
}
