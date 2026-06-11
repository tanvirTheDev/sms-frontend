import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { schoolsApi, type ListSchoolsQuery } from '@/api/schools'
import type { CreateSchoolPayload, UpdateSchoolPayload } from '@/types/school'

const QUERY_KEY = 'schools'

export function useSchools(query: ListSchoolsQuery = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, query],
    queryFn: async () => {
      const { data } = await schoolsApi.list(query)
      return data  // shape: { success, data: School[], meta }
    },
    staleTime: 30 * 1000,
  })
}

export function useSchool(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      const { data } = await schoolsApi.getById(id!)
      return data.data
    },
    enabled: !!id,
    staleTime: 60 * 1000,
  })
}

export function useSchoolDashboard(schoolId: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, schoolId, 'dashboard'],
    queryFn: async () => {
      const { data } = await schoolsApi.getDashboard(schoolId!)
      return data.data
    },
    enabled: !!schoolId,
    staleTime: 2 * 60 * 1000,
  })
}

const errorMessages: Record<string, string> = {
  SLUG_CONFLICT: 'This slug is already taken.',
  EIIN_CONFLICT: 'A school with this EIIN already exists.',
  BANBIS_CODE_CONFLICT: 'A school with this BANBEIS code already exists.',
  PHONE_CONFLICT: 'This phone number is already registered to another user.',
}

// Does NOT auto-navigate — caller reads mutation.data to get adminCredentials
export function useCreateSchool() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateSchoolPayload) => schoolsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      const msg = err.response?.data?.message ?? 'Failed to create school'
      toast.error(errorMessages[msg] ?? msg)
    },
  })
}

export function useUpdateSchool(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateSchoolPayload) => schoolsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success('School updated')
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      const msg = err.response?.data?.message ?? 'Failed to update school'
      toast.error(errorMessages[msg] ?? msg)
    },
  })
}

export function useDeactivateSchool() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (id: string) => schoolsApi.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success('School deactivated')
      navigate({ to: '/schools' })
    },
    onError: () => toast.error('Failed to deactivate school'),
  })
}
