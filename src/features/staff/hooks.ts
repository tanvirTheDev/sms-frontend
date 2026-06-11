import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { staffApi, type ListStaffQuery } from '@/api/staff'
import type { CreateStaffPayload, UpdateStaffPayload } from '@/types/staff'

const QUERY_KEY = 'staff'

export function useStaffList(schoolId: string | null | undefined, query: ListStaffQuery = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, schoolId, query],
    queryFn: async () => {
      const { data } = await staffApi.list(schoolId!, query)
      return data
    },
    enabled: !!schoolId,
    staleTime: 30 * 1000,
  })
}

export function useStaffMember(schoolId: string | null | undefined, id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, schoolId, id],
    queryFn: async () => {
      const { data } = await staffApi.getById(schoolId!, id!)
      return data.data
    },
    enabled: !!schoolId && !!id,
    staleTime: 60 * 1000,
  })
}

const ERROR_MESSAGES: Record<string, string> = {
  PHONE_CONFLICT: 'This phone number is already registered.',
  EMAIL_CONFLICT: 'This email is already registered.',
  EMPLOYEE_ID_CONFLICT: 'This employee ID already exists in this school.',
  STAFF_NOT_FOUND: 'Staff member not found.',
  STAFF_ALREADY_INACTIVE: 'This staff member is already inactive.',
}

export function useCreateStaff(schoolId: string) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: CreateStaffPayload) => staffApi.create(schoolId, payload),
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, schoolId] })
      toast.success('Staff member added successfully')
      navigate({ to: '/staff/$staffId', params: { staffId: data.data!.id } })
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      const msg = err.response?.data?.message ?? 'Failed to add staff'
      toast.error(ERROR_MESSAGES[msg] ?? msg)
    },
  })
}

export function useUpdateStaff(schoolId: string, id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateStaffPayload) => staffApi.update(schoolId, id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, schoolId, id] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, schoolId] })
      toast.success('Staff updated')
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      const msg = err.response?.data?.message ?? 'Failed to update staff'
      toast.error(ERROR_MESSAGES[msg] ?? msg)
    },
  })
}

export function useDeactivateStaff(schoolId: string) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (id: string) => staffApi.deactivate(schoolId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, schoolId] })
      toast.success('Staff member deactivated')
      navigate({ to: '/staff' })
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      const msg = err.response?.data?.message ?? 'Failed to deactivate'
      toast.error(ERROR_MESSAGES[msg] ?? msg)
    },
  })
}
