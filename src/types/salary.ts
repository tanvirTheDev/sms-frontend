export type SalaryPaymentMethod =
  | 'CASH' | 'BKASH' | 'NAGAD' | 'ROCKET' | 'UPAY' | 'BANK' | 'CHEQUE' | 'MFS'

export interface SalaryRecord {
  id: string
  staffId: string
  month: number
  year: number
  isMPOEligible: boolean
  mpoAmount: number
  schoolAmount: number
  bonus: number
  deduction: number
  netAmount: number
  isPaid: boolean
  paidAt: string | null
  paymentMethod: SalaryPaymentMethod | null
  note: string | null
}

export interface SalarySlip {
  record: SalaryRecord & {
    staff: {
      id: string
      name: string
      nameBn: string | null
      designation: string
      employeeId: string | null
      mpoStatus: 'MPO' | 'NON_MPO'
      mpoIndex: string | null
      phone: string
    }
    academicYear: { id: string; name: string; year: number }
  }
  slipGeneratedAt: string
}

export interface CreateSalaryPayload {
  staffId: string
  academicYearId: string
  month: number
  year: number
  isMPOEligible?: boolean
  mpoAmount?: number
  schoolAmount?: number
  bonus?: number
  deduction?: number
  netAmount: number
  isPaid?: boolean
  paymentMethod?: SalaryPaymentMethod
  note?: string
}

export type UpdateSalaryPayload = Partial<CreateSalaryPayload>
