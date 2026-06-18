export interface Vehicle {
  id: string
  schoolId: string
  registrationNo: string
  type: string
  capacity: number
  driverName: string
  driverPhone: string
  helperName: string | null
  helperPhone: string | null
  isActive: boolean
  createdAt: string
  routes?: { id: string; name: string; isActive: boolean }[]
}

export interface TransportRoute {
  id: string
  schoolId: string
  vehicleId: string
  name: string
  stops: string[]
  fare: number
  isActive: boolean
  createdAt: string
  vehicle?: { id: string; registrationNo: string; type: string; capacity: number; driverName?: string; driverPhone?: string }
  _count?: { assignments: number }
}

export interface TransportAssignment {
  id: string
  studentId: string
  routeId: string
  academicYearId: string
  stopName: string
  createdAt: string
  student?: { id: string; name: string; studentId: string }
  route?: { id: string; name: string; fare: number }
}

export interface CreateVehiclePayload {
  registrationNo: string
  type: string
  capacity: number
  driverName: string
  driverPhone: string
  helperName?: string
  helperPhone?: string
}

export type UpdateVehiclePayload = Partial<CreateVehiclePayload & { isActive: boolean }>

export interface CreateTransportRoutePayload {
  vehicleId: string
  name: string
  stops: string[]
  fare: number
  isActive?: boolean
}

export type UpdateTransportRoutePayload = Partial<CreateTransportRoutePayload>

export interface CreateTransportAssignmentPayload {
  studentId: string
  routeId: string
  academicYearId: string
  stopName: string
}
