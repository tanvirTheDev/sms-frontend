import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { format, differenceInDays } from 'date-fns'
import {
  Plus, Loader2, Search, Pencil, Trash2, X, Save,
  BookOpen, BookMarked, RotateCcw, AlertCircle,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { studentsApi } from '@/api/students'
import {
  useLibraryBooks, useCreateBook, useUpdateBook, useDeleteBook,
  useLibraryIssues, useCreateIssue, useReturnBook,
} from '@/features/library/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { LibraryBook, LibraryIssue, BookStatus, CreateBookPayload, UpdateBookPayload } from '@/types/library'

export const Route = createFileRoute('/_authenticated/library/')({
  component: LibraryPage,
})

type Tab = 'books' | 'issues'

const STATUS_COLORS: Record<BookStatus, string> = {
  AVAILABLE: 'bg-green-100 text-green-700',
  ISSUED: 'bg-amber-100 text-amber-700',
  RESERVED: 'bg-blue-100 text-blue-700',
  LOST: 'bg-red-100 text-red-700',
  DAMAGED: 'bg-orange-100 text-orange-700',
  WITHDRAWN: 'bg-gray-100 text-gray-600',
}

const ALL_STATUSES: BookStatus[] = ['AVAILABLE', 'ISSUED', 'RESERVED', 'LOST', 'DAMAGED', 'WITHDRAWN']

// ── Book Form ──────────────────────────────────────────────────

interface BookFormProps {
  schoolId: string
  editing: LibraryBook | null
  onClose: () => void
}

function BookForm({ schoolId, editing, onClose }: BookFormProps) {
  const [form, setForm] = useState<CreateBookPayload & { status?: BookStatus }>({
    title: '', author: '', isbn: '', category: '', totalCopies: 1, availableCopies: 1,
  })

  useEffect(() => {
    if (editing) {
      setForm({
        title: editing.title, author: editing.author ?? '', isbn: editing.isbn ?? '',
        category: editing.category ?? '', totalCopies: editing.totalCopies,
        availableCopies: editing.availableCopies, status: editing.status,
      })
    } else {
      setForm({ title: '', author: '', isbn: '', category: '', totalCopies: 1, availableCopies: 1 })
    }
  }, [editing])

  const { mutate: create, isPending: creating } = useCreateBook(schoolId)
  const { mutate: update, isPending: updating } = useUpdateBook(schoolId, editing?.id ?? '')

  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }))

  const handleSubmit = () => {
    if (editing) {
      const payload: UpdateBookPayload = {
        title: form.title.trim(), author: form.author?.trim() || undefined,
        isbn: form.isbn?.trim() || undefined, category: form.category?.trim() || undefined,
        totalCopies: form.totalCopies, availableCopies: form.availableCopies,
        status: form.status,
      }
      update(payload, { onSuccess: onClose })
    } else {
      const payload: CreateBookPayload = {
        title: form.title.trim(), author: form.author?.trim() || undefined,
        isbn: form.isbn?.trim() || undefined, category: form.category?.trim() || undefined,
        totalCopies: Number(form.totalCopies) || 1,
        availableCopies: Number(form.availableCopies) || undefined,
      }
      create(payload, { onSuccess: onClose })
    }
  }

  return (
    <Card className="border-primary/30">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">{editing ? 'Edit' : 'Add'} Book</h3>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}><X className="h-3.5 w-3.5" /></Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <label className="text-xs font-medium">Title *</label>
            <Input className="mt-1 h-9" placeholder="Book title" value={form.title} onChange={f('title')} />
          </div>
          <div>
            <label className="text-xs font-medium">Author</label>
            <Input className="mt-1 h-9" placeholder="Author name" value={form.author ?? ''} onChange={f('author')} />
          </div>
          <div>
            <label className="text-xs font-medium">ISBN</label>
            <Input className="mt-1 h-9" placeholder="ISBN number" value={form.isbn ?? ''} onChange={f('isbn')} />
          </div>
          <div>
            <label className="text-xs font-medium">Category</label>
            <Input className="mt-1 h-9" placeholder="e.g. Science, Fiction" value={form.category ?? ''} onChange={f('category')} />
          </div>
          <div>
            <label className="text-xs font-medium">Total Copies</label>
            <Input className="mt-1 h-9" type="number" min={1} value={form.totalCopies}
              onChange={(e) => setForm((f) => ({ ...f, totalCopies: Number(e.target.value) }))} />
          </div>
          <div>
            <label className="text-xs font-medium">Available Copies</label>
            <Input className="mt-1 h-9" type="number" min={0} value={form.availableCopies}
              onChange={(e) => setForm((f) => ({ ...f, availableCopies: Number(e.target.value) }))} />
          </div>
          {editing && (
            <div>
              <label className="text-xs font-medium">Status</label>
              <select className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                value={form.status} onChange={f('status')}>
                {ALL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}
        </div>
        <div className="flex gap-2 pt-1">
          <Button size="sm" disabled={!form.title.trim() || creating || updating} onClick={handleSubmit}>
            {(creating || updating) ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Save className="h-3.5 w-3.5 mr-1" />}
            {editing ? 'Save' : 'Add Book'}
          </Button>
          <Button size="sm" variant="outline" onClick={onClose}>Cancel</Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ── Return Dialog ─────────────────────────────────────────────

interface ReturnDialogProps {
  schoolId: string
  issue: LibraryIssue
  onClose: () => void
}

function ReturnDialog({ schoolId, issue, onClose }: ReturnDialogProps) {
  const [fine, setFine] = useState(0)
  const [finePaid, setFinePaid] = useState(false)
  const { mutate: returnBook, isPending } = useReturnBook(schoolId, issue.id)

  const daysOverdue = issue.dueDate ? differenceInDays(new Date(), new Date(issue.dueDate)) : 0
  const isOverdue = daysOverdue > 0

  return (
    <Card className="border-amber-200 bg-amber-50/30">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Return Book</h3>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}><X className="h-3.5 w-3.5" /></Button>
        </div>
        <div className="text-sm space-y-1">
          <p><span className="text-muted-foreground">Book:</span> {issue.book.title}</p>
          <p><span className="text-muted-foreground">Student:</span> {issue.student.name} ({issue.student.studentId})</p>
          <p><span className="text-muted-foreground">Due:</span> {format(new Date(issue.dueDate), 'dd MMM yyyy')}
            {isOverdue && <span className="ml-2 text-red-600 font-medium">{daysOverdue} days overdue</span>}
          </p>
        </div>
        <div className="flex items-end gap-3">
          <div>
            <label className="text-xs font-medium">Fine (৳)</label>
            <Input className="mt-1 h-9 w-28" type="number" min={0} value={fine}
              onChange={(e) => setFine(parseFloat(e.target.value) || 0)} />
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer pb-1">
            <input type="checkbox" checked={finePaid} onChange={(e) => setFinePaid(e.target.checked)} />
            Fine paid
          </label>
        </div>
        <div className="flex gap-2">
          <Button size="sm" disabled={isPending} onClick={() => returnBook({ fine, finePaid }, { onSuccess: onClose })}>
            {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <RotateCcw className="h-3.5 w-3.5 mr-1" />}
            Confirm Return
          </Button>
          <Button size="sm" variant="outline" onClick={onClose}>Cancel</Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ── Books Tab ──────────────────────────────────────────────────

function BooksTab({ schoolId, canWrite }: { schoolId: string; canWrite: boolean }) {
  const [search, setSearch] = useState('')
  const [dSearch, setDSearch] = useState('')
  const [category, setCategory] = useState('')
  const [statusFilter, setStatusFilter] = useState<BookStatus | ''>('')
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [editBook, setEditBook] = useState<LibraryBook | null>(null)

  useEffect(() => {
    const t = setTimeout(() => { setDSearch(search); setPage(1) }, 400)
    return () => clearTimeout(t)
  }, [search])

  const { data, isLoading } = useLibraryBooks(schoolId, {
    page, limit: 20, search: dSearch || undefined,
    category: category || undefined,
    status: statusFilter || undefined,
  })
  const books = data?.data ?? []
  const meta = data?.meta

  const { mutate: del } = useDeleteBook(schoolId)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48 max-w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9 h-9" placeholder="Search title, author, ISBN…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Input className="h-9 w-36" placeholder="Category…" value={category} onChange={(e) => setCategory(e.target.value)} />
        <select className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
          <option value="">All Status</option>
          {ALL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        {canWrite && (
          <Button size="sm" className="ml-auto" onClick={() => { setEditBook(null); setShowForm(true) }}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Book
          </Button>
        )}
      </div>

      {showForm && <BookForm schoolId={schoolId} editing={editBook} onClose={() => { setShowForm(false); setEditBook(null) }} />}

      {isLoading && <div className="flex items-center gap-2 text-sm text-muted-foreground py-8"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>}
      {!isLoading && books.length === 0 && <div className="text-center py-12 text-muted-foreground text-sm">No books found.</div>}

      {books.length > 0 && (
        <div className="rounded-md border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {['Title', 'Author', 'ISBN', 'Category', 'Copies', 'Available', 'Status', ''].map((h) => (
                  <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {books.map((b) => (
                <tr key={b.id} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2 font-medium max-w-48 truncate">{b.title}</td>
                  <td className="px-3 py-2 text-muted-foreground">{b.author ?? '—'}</td>
                  <td className="px-3 py-2 font-mono text-xs">{b.isbn ?? '—'}</td>
                  <td className="px-3 py-2">{b.category ?? '—'}</td>
                  <td className="px-3 py-2 text-center">{b.totalCopies}</td>
                  <td className="px-3 py-2 text-center font-semibold">{b.availableCopies}</td>
                  <td className="px-3 py-2">
                    <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded', STATUS_COLORS[b.status])}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    {canWrite && (
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7"
                          onClick={() => { setEditBook(b); setShowForm(true) }}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => del(b.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">Page {meta.page} of {meta.totalPages} · {meta.total} total</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Issues Tab ────────────────────────────────────────────────

function IssuesTab({ schoolId, canWrite }: { schoolId: string; canWrite: boolean }) {
  const [filterOverdue, setFilterOverdue] = useState(false)
  const [filterReturned, setFilterReturned] = useState<'' | 'true' | 'false'>('')
  const [page, setPage] = useState(1)
  const [showIssueForm, setShowIssueForm] = useState(false)
  const [returningIssue, setReturningIssue] = useState<LibraryIssue | null>(null)

  // Issue form state
  const [bookSearch, setBookSearch] = useState('')
  const [bookResults, setBookResults] = useState<LibraryBook[]>([])
  const [selectedBook, setSelectedBook] = useState<LibraryBook | null>(null)
  const [studentSearch, setStudentSearch] = useState('')
  const [studentResults, setStudentResults] = useState<{ id: string; name: string; studentId: string }[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [dueDate, setDueDate] = useState('')

  const { data, isLoading } = useLibraryIssues(schoolId, {
    page, limit: 20,
    isOverdue: filterOverdue || undefined,
    isReturned: filterReturned === '' ? undefined : filterReturned === 'true',
  })
  const issues = data?.data ?? []
  const meta = data?.meta

  const { mutate: createIssue, isPending: issuing } = useCreateIssue(schoolId)

  // Book search for issue form
  useEffect(() => {
    if (!bookSearch.trim() || bookSearch.trim().length < 2) { setBookResults([]); return }
    const t = setTimeout(async () => {
      try {
        const res = await libraryBooksApi.list(schoolId, { search: bookSearch.trim(), limit: 6, status: 'AVAILABLE' })
        setBookResults(res.data.data ?? [])
      } catch { }
    }, 350)
    return () => clearTimeout(t)
  }, [bookSearch, schoolId])

  // Student search for issue form
  useEffect(() => {
    if (!studentSearch.trim() || studentSearch.trim().length < 2) { setStudentResults([]); return }
    const t = setTimeout(async () => {
      try {
        const res = await studentsApi.list(schoolId, { search: studentSearch.trim(), limit: 6 })
        setStudentResults((res.data.data ?? []).map((s: any) => ({ id: s.id, name: s.name, studentId: s.studentId })))
      } catch { }
    }, 350)
    return () => clearTimeout(t)
  }, [studentSearch, schoolId])

  const handleIssue = () => {
    if (!selectedBook || !selectedStudentId || !dueDate) return
    createIssue({ bookId: selectedBook.id, studentId: selectedStudentId, dueDate }, {
      onSuccess: () => {
        setShowIssueForm(false); setBookSearch(''); setSelectedBook(null)
        setStudentSearch(''); setSelectedStudentId(''); setDueDate('')
      }
    })
  }

  const minDate = new Date()
  minDate.setDate(minDate.getDate() + 1)
  const minDateStr = minDate.toISOString().split('T')[0]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={filterOverdue} onChange={(e) => setFilterOverdue(e.target.checked)} />
          Overdue only
        </label>
        <select className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          value={filterReturned} onChange={(e) => setFilterReturned(e.target.value as any)}>
          <option value="">All</option>
          <option value="false">Active</option>
          <option value="true">Returned</option>
        </select>
        {canWrite && (
          <Button size="sm" className="ml-auto" onClick={() => setShowIssueForm(true)}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Issue Book
          </Button>
        )}
      </div>

      {/* Issue form */}
      {showIssueForm && (
        <Card className="border-primary/30">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Issue Book to Student</h3>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowIssueForm(false)}><X className="h-3.5 w-3.5" /></Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Book search */}
              <div className="relative">
                <label className="text-xs font-medium">Book *</label>
                <Input className="mt-1 h-9" placeholder="Search available books…" value={bookSearch}
                  onChange={(e) => { setBookSearch(e.target.value); setSelectedBook(null) }} />
                {bookResults.length > 0 && !selectedBook && (
                  <div className="absolute z-50 w-full mt-0.5 bg-popover border rounded-md shadow-md max-h-40 overflow-y-auto">
                    {bookResults.map((b) => (
                      <button key={b.id} className="w-full text-left px-3 py-2 hover:bg-muted text-sm border-b last:border-0"
                        onClick={() => { setSelectedBook(b); setBookSearch(b.title) }}>
                        <p className="font-medium">{b.title}</p>
                        <p className="text-xs text-muted-foreground">{b.availableCopies} available</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* Student search */}
              <div className="relative">
                <label className="text-xs font-medium">Student *</label>
                <Input className="mt-1 h-9" placeholder="Search student…" value={studentSearch}
                  onChange={(e) => { setStudentSearch(e.target.value); setSelectedStudentId('') }} />
                {studentResults.length > 0 && !selectedStudentId && (
                  <div className="absolute z-50 w-full mt-0.5 bg-popover border rounded-md shadow-md max-h-40 overflow-y-auto">
                    {studentResults.map((s) => (
                      <button key={s.id} className="w-full text-left px-3 py-2 hover:bg-muted text-sm border-b last:border-0"
                        onClick={() => { setSelectedStudentId(s.id); setStudentSearch(`${s.name} (${s.studentId})`) }}>
                        {s.name} <span className="text-muted-foreground text-xs">· {s.studentId}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* Due date */}
              <div>
                <label className="text-xs font-medium">Due Date *</label>
                <Input className="mt-1 h-9" type="date" min={minDateStr} value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button size="sm" disabled={!selectedBook || !selectedStudentId || !dueDate || issuing} onClick={handleIssue}>
                {issuing ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <BookMarked className="h-3.5 w-3.5 mr-1" />}
                Issue
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowIssueForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {returningIssue && (
        <ReturnDialog schoolId={schoolId} issue={returningIssue} onClose={() => setReturningIssue(null)} />
      )}

      {isLoading && <div className="flex items-center gap-2 text-sm text-muted-foreground py-8"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>}
      {!isLoading && issues.length === 0 && <div className="text-center py-12 text-muted-foreground text-sm">No issues found.</div>}

      {issues.length > 0 && (
        <div className="rounded-md border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {['Book', 'Student', 'Issued', 'Due', 'Status', 'Fine', ''].map((h) => (
                  <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {issues.map((issue) => {
                const overdue = !issue.returnedAt && new Date(issue.dueDate) < new Date()
                const days = differenceInDays(new Date(), new Date(issue.dueDate))
                return (
                  <tr key={issue.id} className={cn('border-t hover:bg-muted/30', overdue && 'bg-red-50/50')}>
                    <td className="px-3 py-2 font-medium max-w-40 truncate">{issue.book.title}</td>
                    <td className="px-3 py-2">
                      <p className="font-medium">{issue.student.name}</p>
                      <p className="text-xs text-muted-foreground">{issue.student.studentId}</p>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-muted-foreground">{format(new Date(issue.issuedAt), 'dd MMM yyyy')}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={cn('text-xs', overdue ? 'text-red-600 font-semibold' : 'text-muted-foreground')}>
                        {format(new Date(issue.dueDate), 'dd MMM yyyy')}
                        {overdue && <span className="ml-1">({days}d late)</span>}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      {issue.returnedAt ? (
                        <span className="text-xs text-green-700">Returned {format(new Date(issue.returnedAt), 'dd/MM')}</span>
                      ) : overdue ? (
                        <span className="flex items-center gap-1 text-red-600 text-xs"><AlertCircle className="h-3 w-3" />Overdue</span>
                      ) : (
                        <span className="text-xs text-blue-600">Active</span>
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs">
                      {issue.fine > 0 && (
                        <span className={cn(issue.finePaid ? 'text-green-600' : 'text-red-600')}>
                          ৳{issue.fine} {issue.finePaid ? '(paid)' : '(due)'}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {canWrite && !issue.returnedAt && (
                        <Button size="sm" variant="outline" className="h-7 text-xs"
                          onClick={() => setReturningIssue(issue)}>
                          <RotateCcw className="h-3 w-3 mr-1" /> Return
                        </Button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">Page {meta.page} of {meta.totalPages} · {meta.total} total</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Import for library API in Issues tab ──────────────────────
import { libraryBooksApi } from '@/api/library'

// ── Main Page ─────────────────────────────────────────────────

function LibraryPage() {
  const { user } = useAuthStore()
  const schoolId = user?.schoolId ?? ''
  const role = user?.role ?? ''
  const canWrite = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'LIBRARIAN'].includes(role)
  const [tab, setTab] = useState<Tab>('books')

  if (!schoolId) return <div className="text-center py-16 text-muted-foreground text-sm">No school assigned.</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Library</h1>
        <p className="text-sm text-muted-foreground">Manage books catalog and track issued copies.</p>
      </div>

      <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
        <button type="button" onClick={() => setTab('books')}
          className={cn('flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors',
            tab === 'books' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}>
          <BookOpen className="h-4 w-4" /> Books
        </button>
        <button type="button" onClick={() => setTab('issues')}
          className={cn('flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors',
            tab === 'issues' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}>
          <BookMarked className="h-4 w-4" /> Issued Books
        </button>
      </div>

      {tab === 'books' && <BooksTab schoolId={schoolId} canWrite={canWrite} />}
      {tab === 'issues' && <IssuesTab schoolId={schoolId} canWrite={canWrite} />}
    </div>
  )
}
