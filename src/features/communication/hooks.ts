import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { noticesApi, type ListNoticesQuery } from '@/api/notices'
import { circularsApi, type ListCircularsQuery } from '@/api/circulars'
import type { CreateNoticePayload, UpdateNoticePayload, CreateCircularPayload, UpdateCircularPayload } from '@/types/communication'

// ── Notices ───────────────────────────────────────────────────────

const NK = 'notices'

export function useNotices(schoolId: string | null, query: ListNoticesQuery = {}) {
  return useQuery({
    queryKey: [NK, schoolId, query],
    queryFn: async () => {
      const res = await noticesApi.list(schoolId!, query)
      return { data: res.data.data ?? [], meta: res.data.meta }
    },
    enabled: !!schoolId,
    staleTime: 30 * 1000,
  })
}

export function useCreateNotice(schoolId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateNoticePayload) => noticesApi.create(schoolId, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [NK, schoolId] }); toast.success('Notice created') },
    onError: (err: any) => toast.error(err.response?.data?.message ?? 'Failed to create notice'),
  })
}

export function useUpdateNotice(schoolId: string, id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateNoticePayload) => noticesApi.update(schoolId, id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [NK, schoolId] }); toast.success('Notice updated') },
    onError: (err: any) => toast.error(err.response?.data?.message ?? 'Failed to update notice'),
  })
}

export function usePublishNotice(schoolId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isPublished }: { id: string; isPublished: boolean }) =>
      noticesApi.publish(schoolId, id, isPublished),
    onSuccess: (_, { isPublished }) => {
      qc.invalidateQueries({ queryKey: [NK, schoolId] })
      toast.success(isPublished ? 'Notice published' : 'Notice unpublished')
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? 'Failed'),
  })
}

export function useDeleteNotice(schoolId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => noticesApi.delete(schoolId, id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [NK, schoolId] }); toast.success('Notice deleted') },
    onError: (err: any) => toast.error(err.response?.data?.message ?? 'Failed to delete'),
  })
}

// ── Circulars ─────────────────────────────────────────────────────

const CK = 'circulars'

export function useCirculars(schoolId: string | null, query: ListCircularsQuery = {}) {
  return useQuery({
    queryKey: [CK, schoolId, query],
    queryFn: async () => {
      const res = await circularsApi.list(schoolId!, query)
      return { data: res.data.data ?? [], meta: res.data.meta }
    },
    enabled: !!schoolId,
    staleTime: 30 * 1000,
  })
}

export function useCreateCircular(schoolId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateCircularPayload) => circularsApi.create(schoolId, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [CK, schoolId] }); toast.success('Circular created') },
    onError: (err: any) => toast.error(err.response?.data?.message ?? 'Failed to create circular'),
  })
}

export function useUpdateCircular(schoolId: string, id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateCircularPayload) => circularsApi.update(schoolId, id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [CK, schoolId] }); toast.success('Circular updated') },
    onError: (err: any) => toast.error(err.response?.data?.message ?? 'Failed to update circular'),
  })
}

export function usePublishCircular(schoolId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isPublished }: { id: string; isPublished: boolean }) =>
      circularsApi.publish(schoolId, id, isPublished),
    onSuccess: (_, { isPublished }) => {
      qc.invalidateQueries({ queryKey: [CK, schoolId] })
      toast.success(isPublished ? 'Circular published' : 'Circular unpublished')
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? 'Failed'),
  })
}

export function useDeleteCircular(schoolId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => circularsApi.delete(schoolId, id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [CK, schoolId] }); toast.success('Circular deleted') },
    onError: (err: any) => toast.error(err.response?.data?.message ?? 'Failed to delete'),
  })
}
