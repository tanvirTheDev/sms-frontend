export type FeeType =
  | 'TUITION' | 'SESSION' | 'ADMISSION' | 'EXAM' | 'BOARD_FORM' | 'BOARD_CENTER'
  | 'SPORTS' | 'LIBRARY' | 'TRANSPORT' | 'DEVELOPMENT' | 'CAUTION_MONEY' | 'FINE' | 'OTHER'

export type PaymentMethod = 'CASH' | 'BKASH' | 'NAGAD' | 'ROCKET' | 'UPAY' | 'BANK' | 'CHEQUE' | 'MFS'
export type PaymentStatus = 'PAID' | 'UNPAID' | 'PARTIAL' | 'WAIVED'

export interface FeeStructure {
  id: string
  schoolId: string
  academicYearId: string
  classId: string
  feeType: FeeType
  name: string
  amount: number
  dueDay: number | null
  isRecurring: boolean
  createdAt: string
  class: { id: string; name: string }
  academicYear: { id: string; name: string; year: number }
}

export interface CreateFeeStructurePayload {
  academicYearId: string
  classId: string
  feeType: FeeType
  name: string
  amount: number
  dueDay?: number
  isRecurring?: boolean
}

export type UpdateFeeStructurePayload = Partial<Omit<CreateFeeStructurePayload, 'academicYearId' | 'classId'>>

export interface FeeCollectionStudent {
  id: string
  name: string
  studentId: string
  section: { name: string; class: { name: string } } | null
}

export interface FeeCollection {
  id: string
  schoolId: string
  studentId: string
  academicYearId: string
  feeStructureId: string | null
  feeType: FeeType
  billingMonth: number | null
  billingYear: number
  amount: number
  discount: number
  waiverReason: string | null
  paidAmount: number
  status: PaymentStatus
  paymentMethod: PaymentMethod | null
  transactionId: string | null
  receiptNo: string | null
  paidAt: string | null
  collectedBy: string | null
  createdAt: string
  updatedAt: string
  student: FeeCollectionStudent
}

export interface CreateFeeCollectionPayload {
  studentId: string
  academicYearId: string
  feeStructureId?: string
  feeType: FeeType
  billingMonth?: number
  billingYear: number
  amount: number
  discount?: number
  waiverReason?: string
  paidAmount?: number
  paymentMethod?: PaymentMethod
  transactionId?: string
}

export interface UpdateFeeCollectionPayload {
  discount?: number
  waiverReason?: string
  paidAmount?: number
  status?: PaymentStatus
  paymentMethod?: PaymentMethod
  transactionId?: string
}

export interface StudentDueEntry {
  studentId: string
  studentName: string
  studentRoll: string
  sectionName: string
  className: string
  totalDue: number
  collections: {
    id: string
    feeType: FeeType
    billingMonth: number | null
    billingYear: number
    amount: number
    paidAmount: number
    outstanding: number
    status: PaymentStatus
  }[]
}

export interface FeeSummary {
  totalBilled: number
  totalCollected: number
  totalDiscount: number
  totalOutstanding: number
  totalCount: number
  byStatus: { status: PaymentStatus; billed: number; collected: number; count: number }[]
  byFeeType: { feeType: FeeType; billed: number; collected: number; count: number }[]
}
