import { apiClient } from './client'
import type {
  Vehicle, TransportRoute, TransportAssignment,
  CreateVehiclePayload, UpdateVehiclePayload,
  CreateTransportRoutePayload, UpdateTransportRoutePayload,
  CreateTransportAssignmentPayload,
} from '@/types/transport'

type SR<T> = { success: boolean; data: T }
type Paginated<T> = { success: boolean; data: T[]; meta: { total: number; page: number; limit: number; totalPages: number } }

const b = (schoolId: string) => `/schools/${schoolId}/transport`

export const vehiclesApi = {
  list: (schoolId: string, params: { page?: number; limit?: number; isActive?: boolean; search?: string } = {}) =>
    apiClient.get<Paginated<Vehicle>>(`${b(schoolId)}/vehicles`, { params }),

  get: (schoolId: string, id: string) =>
    apiClient.get<SR<Vehicle>>(`${b(schoolId)}/vehicles/${id}`),

  create: (schoolId: string, payload: CreateVehiclePayload) =>
    apiClient.post<SR<Vehicle>>(`${b(schoolId)}/vehicles`, payload),

  update: (schoolId: string, id: string, payload: UpdateVehiclePayload) =>
    apiClient.patch<SR<Vehicle>>(`${b(schoolId)}/vehicles/${id}`, payload),

  deactivate: (schoolId: string, id: string) =>
    apiClient.delete<SR<null>>(`${b(schoolId)}/vehicles/${id}`),
}

export const transportRoutesApi = {
  list: (schoolId: string, params: { page?: number; limit?: number; vehicleId?: string; isActive?: boolean; search?: string } = {}) =>
    apiClient.get<Paginated<TransportRoute>>(`${b(schoolId)}/routes`, { params }),

  get: (schoolId: string, id: string) =>
    apiClient.get<SR<TransportRoute>>(`${b(schoolId)}/routes/${id}`),

  create: (schoolId: string, payload: CreateTransportRoutePayload) =>
    apiClient.post<SR<TransportRoute>>(`${b(schoolId)}/routes`, payload),

  update: (schoolId: string, id: string, payload: UpdateTransportRoutePayload) =>
    apiClient.patch<SR<TransportRoute>>(`${b(schoolId)}/routes/${id}`, payload),

  delete: (schoolId: string, id: string) =>
    apiClient.delete<SR<null>>(`${b(schoolId)}/routes/${id}`),
}

export const transportAssignmentsApi = {
  list: (schoolId: string, params: { page?: number; limit?: number; routeId?: string; academicYearId?: string; studentId?: string } = {}) =>
    apiClient.get<Paginated<TransportAssignment>>(`${b(schoolId)}/assignments`, { params }),

  create: (schoolId: string, payload: CreateTransportAssignmentPayload) =>
    apiClient.post<SR<TransportAssignment>>(`${b(schoolId)}/assignments`, payload),

  delete: (schoolId: string, id: string) =>
    apiClient.delete<SR<null>>(`${b(schoolId)}/assignments/${id}`),
}
