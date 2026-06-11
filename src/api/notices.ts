import { apiClient } from './client'
import type { ApiResponse, PaginatedResponse, Notice } from '@/types'

export const noticesApi = {
  list: (
    schoolId: string,
    params: { page?: number; limit?: number; isPublished?: boolean; target?: string } = {},
  ) =>
    apiClient.get<ApiResponse<PaginatedResponse<Notice>>>(
      `/schools/${schoolId}/notices`,
      { params },
    ),
}
