import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { vehiclesApi, transportRoutesApi, transportAssignmentsApi } from '@/api/transport'
import type {
  CreateVehiclePayload, UpdateVehiclePayload,
  CreateTransportRoutePayload, UpdateTransportRoutePayload,
  CreateTransportAssignmentPayload,
} from '@/types/transport'

// ── Vehicles ───────────────────────────────────────────────────

const VK = (schoolId: string) => ['vehicles', schoolId]

export function useVehicles(
  schoolId: string | null,
  params: { page?: number; limit?: number; isActive?: boolean; search?: string } = {}
) {
  return useQuery({
    queryKey: [...VK(schoolId ?? ''), params],
    queryFn: async () => {
      const r = await vehiclesApi.list(schoolId!, params)
      return r.data
    },
    enabled: !!schoolId,
    staleTime: 30 * 1000,
  })
}

export function useCreateVehicle(schoolId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p: CreateVehiclePayload) => vehiclesApi.create(schoolId, p),
    onSuccess: () => { qc.invalidateQueries({ queryKey: VK(schoolId) }); toast.success('Vehicle added') },
    onError: (err: any) => {
      const msg = err.response?.data?.message ?? ''
      if (msg === 'REGISTRATION_NO_CONFLICT') toast.error('Registration number already exists')
      else toast.error(msg || 'Failed to add vehicle')
    },
  })
}

export function useUpdateVehicle(schoolId: string, id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p: UpdateVehiclePayload) => vehiclesApi.update(schoolId, id, p),
    onSuccess: () => { qc.invalidateQueries({ queryKey: VK(schoolId) }); toast.success('Vehicle updated') },
    onError: (err: any) => {
      const msg = err.response?.data?.message ?? ''
      if (msg === 'REGISTRATION_NO_CONFLICT') toast.error('Registration number already exists')
      else toast.error(msg || 'Failed to update')
    },
  })
}

export function useDeactivateVehicle(schoolId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => vehiclesApi.deactivate(schoolId, id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: VK(schoolId) }); toast.success('Vehicle deactivated') },
    onError: (err: any) => toast.error(err.response?.data?.message ?? 'Failed to deactivate'),
  })
}

// ── Routes ─────────────────────────────────────────────────────

const RK = (schoolId: string) => ['transport-routes', schoolId]

export function useTransportRoutes(
  schoolId: string | null,
  params: { page?: number; limit?: number; vehicleId?: string; isActive?: boolean; search?: string } = {}
) {
  return useQuery({
    queryKey: [...RK(schoolId ?? ''), params],
    queryFn: async () => {
      const r = await transportRoutesApi.list(schoolId!, params)
      return r.data
    },
    enabled: !!schoolId,
    staleTime: 30 * 1000,
  })
}

export function useCreateTransportRoute(schoolId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p: CreateTransportRoutePayload) => transportRoutesApi.create(schoolId, p),
    onSuccess: () => { qc.invalidateQueries({ queryKey: RK(schoolId) }); toast.success('Route created') },
    onError: (err: any) => {
      const msg = err.response?.data?.message ?? ''
      if (msg === 'ROUTE_NAME_CONFLICT') toast.error('Route name already exists')
      else if (msg === 'VEHICLE_NOT_FOUND') toast.error('Vehicle not found')
      else toast.error(msg || 'Failed to create route')
    },
  })
}

export function useUpdateTransportRoute(schoolId: string, id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p: UpdateTransportRoutePayload) => transportRoutesApi.update(schoolId, id, p),
    onSuccess: () => { qc.invalidateQueries({ queryKey: RK(schoolId) }); toast.success('Route updated') },
    onError: (err: any) => {
      const msg = err.response?.data?.message ?? ''
      if (msg === 'ROUTE_NAME_CONFLICT') toast.error('Route name already exists')
      else toast.error(msg || 'Failed to update')
    },
  })
}

export function useDeleteTransportRoute(schoolId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => transportRoutesApi.delete(schoolId, id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: RK(schoolId) }); toast.success('Route deleted') },
    onError: (err: any) => {
      const msg = err.response?.data?.message ?? ''
      if (msg === 'ROUTE_HAS_ASSIGNMENTS') toast.error('Cannot delete — students assigned to this route')
      else toast.error(msg || 'Failed to delete')
    },
  })
}

// ── Assignments ────────────────────────────────────────────────

const AK = (schoolId: string) => ['transport-assignments', schoolId]

export function useTransportAssignments(
  schoolId: string | null,
  params: { page?: number; limit?: number; routeId?: string; academicYearId?: string; studentId?: string } = {}
) {
  return useQuery({
    queryKey: [...AK(schoolId ?? ''), params],
    queryFn: async () => {
      const r = await transportAssignmentsApi.list(schoolId!, params)
      return r.data
    },
    enabled: !!schoolId,
    staleTime: 30 * 1000,
  })
}

export function useCreateTransportAssignment(schoolId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p: CreateTransportAssignmentPayload) => transportAssignmentsApi.create(schoolId, p),
    onSuccess: () => { qc.invalidateQueries({ queryKey: AK(schoolId) }); toast.success('Student assigned to route') },
    onError: (err: any) => {
      const msg = err.response?.data?.message ?? ''
      if (msg === 'ASSIGNMENT_CONFLICT') toast.error('Student already has a transport assignment')
      else if (msg === 'INVALID_STOP_NAME') toast.error('Stop name not on this route')
      else if (msg === 'STUDENT_NOT_FOUND') toast.error('Student not found')
      else if (msg === 'ROUTE_NOT_FOUND') toast.error('Route not found')
      else toast.error(msg || 'Failed to assign')
    },
  })
}

export function useDeleteTransportAssignment(schoolId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => transportAssignmentsApi.delete(schoolId, id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: AK(schoolId) }); toast.success('Assignment removed') },
    onError: (err: any) => toast.error(err.response?.data?.message ?? 'Failed to remove'),
  })
}
