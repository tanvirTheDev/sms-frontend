import type { FeeType, PaymentMethod, PaymentStatus } from '@/types/fee'

export const FEE_TYPES: { value: FeeType; label: string }[] = [
  { value: 'TUITION', label: 'Tuition Fee' },
  { value: 'SESSION', label: 'Session Fee' },
  { value: 'ADMISSION', label: 'Admission Fee' },
  { value: 'EXAM', label: 'Exam Fee' },
  { value: 'BOARD_FORM', label: 'Board Form' },
  { value: 'BOARD_CENTER', label: 'Board Center' },
  { value: 'SPORTS', label: 'Sports' },
  { value: 'LIBRARY', label: 'Library' },
  { value: 'TRANSPORT', label: 'Transport' },
  { value: 'DEVELOPMENT', label: 'Development' },
  { value: 'CAUTION_MONEY', label: 'Caution Money' },
  { value: 'FINE', label: 'Fine' },
  { value: 'OTHER', label: 'Other' },
]

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'CASH', label: 'Cash' },
  { value: 'BKASH', label: 'bKash' },
  { value: 'NAGAD', label: 'Nagad' },
  { value: 'ROCKET', label: 'Rocket' },
  { value: 'UPAY', label: 'Upay' },
  { value: 'BANK', label: 'Bank Transfer' },
  { value: 'CHEQUE', label: 'Cheque' },
  { value: 'MFS', label: 'Mobile Banking (Other)' },
]

export const PAYMENT_STATUSES: { value: PaymentStatus; label: string }[] = [
  { value: 'PAID', label: 'Paid' },
  { value: 'PARTIAL', label: 'Partial' },
  { value: 'UNPAID', label: 'Unpaid' },
  { value: 'WAIVED', label: 'Waived' },
]

export const STATUS_COLORS: Record<PaymentStatus, string> = {
  PAID: 'bg-green-100 text-green-700 border-green-200',
  PARTIAL: 'bg-amber-100 text-amber-700 border-amber-200',
  UNPAID: 'bg-red-100 text-red-700 border-red-200',
  WAIVED: 'bg-gray-100 text-gray-600 border-gray-200',
}

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export const BDT = (amount: number) =>
  new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(amount)
