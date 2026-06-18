export type BookStatus = 'AVAILABLE' | 'ISSUED' | 'RESERVED' | 'LOST' | 'DAMAGED' | 'WITHDRAWN'

export interface LibraryBook {
  id: string
  schoolId: string
  title: string
  author: string | null
  isbn: string | null
  category: string | null
  totalCopies: number
  availableCopies: number
  status: BookStatus
  createdAt: string
}

export interface LibraryIssue {
  id: string
  bookId: string
  studentId: string
  issuedAt: string
  dueDate: string
  returnedAt: string | null
  fine: number
  finePaid: boolean
  book: { id: string; title: string; isbn: string | null }
  student: { id: string; name: string; studentId: string }
}

export interface CreateBookPayload {
  title: string
  author?: string
  isbn?: string
  category?: string
  totalCopies?: number
  availableCopies?: number
}

export interface UpdateBookPayload {
  title?: string
  author?: string
  isbn?: string
  category?: string
  totalCopies?: number
  availableCopies?: number
  status?: BookStatus
}

export interface CreateIssuePayload {
  bookId: string
  studentId: string
  dueDate: string
}

export interface ReturnIssuePayload {
  fine: number
  finePaid?: boolean
}
