import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { libraryBooksApi, libraryIssuesApi, type ListBooksQuery, type ListIssuesQuery } from '@/api/library'
import type { CreateBookPayload, UpdateBookPayload, CreateIssuePayload, ReturnIssuePayload } from '@/types/library'

const BK = (schoolId: string) => ['library-books', schoolId]
const IK = (schoolId: string) => ['library-issues', schoolId]

// ── Books ─────────────────────────────────────────────────────

export function useLibraryBooks(schoolId: string | null, query: ListBooksQuery = {}) {
  return useQuery({
    queryKey: [...BK(schoolId ?? ''), query],
    queryFn: async () => {
      const res = await libraryBooksApi.list(schoolId!, query)
      return { data: res.data.data ?? [], meta: res.data.meta }
    },
    enabled: !!schoolId,
    staleTime: 30 * 1000,
  })
}

export function useCreateBook(schoolId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateBookPayload) => libraryBooksApi.create(schoolId, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: BK(schoolId) }); toast.success('Book added') },
    onError: (err: any) => {
      const msg = err.response?.data?.message ?? ''
      if (msg === 'ISBN_CONFLICT') toast.error('A book with this ISBN already exists')
      else toast.error(msg || 'Failed to add book')
    },
  })
}

export function useUpdateBook(schoolId: string, id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateBookPayload) => libraryBooksApi.update(schoolId, id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: BK(schoolId) }); toast.success('Book updated') },
    onError: (err: any) => toast.error(err.response?.data?.message ?? 'Failed to update'),
  })
}

export function useDeleteBook(schoolId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => libraryBooksApi.delete(schoolId, id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: BK(schoolId) }); toast.success('Book removed') },
    onError: (err: any) => {
      const msg = err.response?.data?.message ?? ''
      if (msg === 'BOOK_HAS_ACTIVE_ISSUES') toast.error('Cannot delete — book has unreturned copies')
      else toast.error(msg || 'Failed to delete')
    },
  })
}

// ── Issues ────────────────────────────────────────────────────

export function useLibraryIssues(schoolId: string | null, query: ListIssuesQuery = {}) {
  return useQuery({
    queryKey: [...IK(schoolId ?? ''), query],
    queryFn: async () => {
      const res = await libraryIssuesApi.list(schoolId!, query)
      return { data: res.data.data ?? [], meta: res.data.meta }
    },
    enabled: !!schoolId,
    staleTime: 30 * 1000,
  })
}

export function useCreateIssue(schoolId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateIssuePayload) => libraryIssuesApi.create(schoolId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: IK(schoolId) })
      qc.invalidateQueries({ queryKey: BK(schoolId) })
      toast.success('Book issued')
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message ?? ''
      if (msg === 'BOOK_NOT_AVAILABLE') toast.error('No copies available')
      else if (msg === 'ISSUE_ALREADY_ACTIVE') toast.error('Student already has this book')
      else if (msg === 'INVALID_DUE_DATE') toast.error('Due date must be in the future')
      else toast.error(msg || 'Failed to issue book')
    },
  })
}

export function useReturnBook(schoolId: string, id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: ReturnIssuePayload) => libraryIssuesApi.return(schoolId, id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: IK(schoolId) })
      qc.invalidateQueries({ queryKey: BK(schoolId) })
      toast.success('Book returned')
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? 'Failed to process return'),
  })
}
