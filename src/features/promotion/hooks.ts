import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { promotionApi, type BulkPromotePayload, type UpdateGroupPayload, type ListPromotionsQuery } from '@/api/promotion'

const QK = 'promotions'

const ERR: Record<string, string> = {
  STUDENT_ALREADY_PROMOTED: 'One or more students already have a promotion record for this year.',
  STUDENT_NOT_IN_SECTION: 'One or more students do not belong to the selected section.',
  PROMOTION_TO_SECTION_NOT_FOUND: 'Target section not found.',
  PROMOTION_SECTION_ALREADY_PROCESSED: 'This section has already been fully processed.',
  PROMOTION_CANNOT_DELETE_PROMOTED: 'Cannot delete a PROMOTED record. Update the student section first.',
  SCHOOL_NOT_FOUND: 'School not found.',
  ACADEMIC_YEAR_NOT_FOUND: 'Academic year not found.',
  SECTION_NOT_FOUND: 'Section not found.',
  PROMOTION_NOT_FOUND: 'Promotion record not found.',
}

const handleErr = (err: any, fallback: string) => {
  const msg = err.response?.data?.message ?? fallback
  toast.error(ERR[msg] ?? msg)
}

export function usePromotions(schoolId: string | null, query: ListPromotionsQuery = {}) {
  return useQuery({
    queryKey: [QK, schoolId, query],
    queryFn: async () => {
      const res = await promotionApi.list(schoolId!, query)
      return res.data.data ?? []
    },
    enabled: !!schoolId,
    staleTime: 30 * 1000,
  })
}

export function useBulkPromote(schoolId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: BulkPromotePayload) => promotionApi.bulkPromote(schoolId, payload),
    onSuccess: ({ data }) => {
      qc.invalidateQueries({ queryKey: [QK, schoolId] })
      toast.success(`Promotion complete — ${data.data?.processed} student(s) processed`)
    },
    onError: (err: any) => handleErr(err, 'Promotion failed'),
  })
}

export function useUpdatePromotionGroup(schoolId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateGroupPayload }) =>
      promotionApi.updateGroup(schoolId, id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK, schoolId] })
      toast.success('Subject group updated')
    },
    onError: (err: any) => handleErr(err, 'Failed to update group'),
  })
}

export function useDeletePromotion(schoolId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => promotionApi.delete(schoolId, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK, schoolId] })
      toast.success('Promotion record deleted')
    },
    onError: (err: any) => handleErr(err, 'Failed to delete'),
  })
}
