import { apiClient } from './client'
import type { ApiResponse } from '@/types'
import type {
  LibraryBook, LibraryIssue, BookStatus,
  CreateBookPayload, UpdateBookPayload,
  CreateIssuePayload, ReturnIssuePayload,
} from '@/types/library'

export interface ListBooksQuery {
  page?: number
  limit?: number
  search?: string
  category?: string
  status?: BookStatus
}

export interface ListIssuesQuery {
  page?: number
  limit?: number
  studentId?: string
  bookId?: string
  isOverdue?: boolean
  finePaid?: boolean
  isReturned?: boolean
}

export interface BookListResponse {
  success: boolean
  data: LibraryBook[]
  meta: { total: number; page: number; limit: number; totalPages: number }
}

export interface IssueListResponse {
  success: boolean
  data: LibraryIssue[]
  meta: { total: number; page: number; limit: number; totalPages: number }
}

export const libraryBooksApi = {
  list: (schoolId: string, query: ListBooksQuery = {}) =>
    apiClient.get<BookListResponse>(`/schools/${schoolId}/library/books`, { params: query }),

  create: (schoolId: string, payload: CreateBookPayload) =>
    apiClient.post<ApiResponse<LibraryBook>>(`/schools/${schoolId}/library/books`, payload),

  update: (schoolId: string, id: string, payload: UpdateBookPayload) =>
    apiClient.patch<ApiResponse<LibraryBook>>(`/schools/${schoolId}/library/books/${id}`, payload),

  delete: (schoolId: string, id: string) =>
    apiClient.delete<ApiResponse>(`/schools/${schoolId}/library/books/${id}`),
}

export const libraryIssuesApi = {
  list: (schoolId: string, query: ListIssuesQuery = {}) =>
    apiClient.get<IssueListResponse>(`/schools/${schoolId}/library/issues`, { params: query }),

  create: (schoolId: string, payload: CreateIssuePayload) =>
    apiClient.post<ApiResponse<LibraryIssue>>(`/schools/${schoolId}/library/issues`, payload),

  return: (schoolId: string, id: string, payload: ReturnIssuePayload) =>
    apiClient.patch<ApiResponse<LibraryIssue>>(`/schools/${schoolId}/library/issues/${id}/return`, payload),
}
