export type LeaveType = 'SICK' | 'CASUAL' | 'EARNED' | 'MATERNITY' | 'PATERNITY' | 'HAJJ' | 'EXTRAORDINARY' | 'OTHER'
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'

export interface LeaveApplication {
  id: string
  staffId: string
  type: LeaveType
  fromDate: string
  toDate: string
  days: number
  year: number
  reason: string
  status: LeaveStatus
  reviewedBy: string | null
  reviewNote: string | null
  reviewedAt: string | null
  createdAt: string
  staff: {
    id: string
    name: string
    nameBn: string | null
    designation: string
    role: string
    employeeId: string | null
  }
}

export interface CreateLeavePayload {
  type: LeaveType
  fromDate: string
  toDate: string
  days: number
  year?: number
  reason: string
}

export interface ReviewLeavePayload {
  status: 'APPROVED' | 'REJECTED'
  reviewNote?: string
}

export interface CancelLeavePayload {
  reason?: string
}
