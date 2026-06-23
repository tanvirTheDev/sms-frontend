import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { format } from 'date-fns'
import {
  Plus, Loader2, Pencil, Trash2, X, Save, Send, EyeOff,
  Bell, FileText, Search, ChevronDown, ChevronUp, ExternalLink, Paperclip,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useClasses } from '@/features/academic-setup/hooks'
import { classApi } from '@/api/academic'
import {
  useNotices, useCreateNotice, useUpdateNotice, usePublishNotice, useDeleteNotice,
  useCirculars, useCreateCircular, useUpdateCircular, usePublishCircular, useDeleteCircular,
} from '@/features/communication/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { Notice, Circular, NoticeTarget, WingType } from '@/types/communication'
import type { ClassSection } from '@/types/academic'

export const Route = createFileRoute('/_authenticated/notices/')({
  component: NoticesPage,
})

type Tab = 'notices' | 'circulars'

const NOTICE_TARGETS: { value: NoticeTarget; label: string }[] = [
  { value: 'ALL', label: 'Everyone' },
  { value: 'STAFF', label: 'Staff Only' },
  { value: 'PARENTS', label: 'Parents Only' },
  { value: 'WING', label: 'Wing' },
  { value: 'CLASS', label: 'Class' },
  { value: 'SECTION', label: 'Section' },
]

const WINGS: { value: WingType; label: string }[] = [
  { value: 'PRE_PRIMARY', label: 'Pre-Primary' },
  { value: 'PRIMARY', label: 'Primary' },
  { value: 'SECONDARY', label: 'Secondary' },
  { value: 'HIGHER_SECONDARY', label: 'Higher Secondary' },
  { value: 'MADRASA', label: 'Madrasa' },
  { value: 'VOCATIONAL', label: 'Vocational' },
]

const TARGET_COLORS: Record<NoticeTarget, string> = {
  ALL: 'bg-blue-100 text-blue-700',
  STAFF: 'bg-violet-100 text-violet-700',
  PARENTS: 'bg-pink-100 text-pink-700',
  WING: 'bg-amber-100 text-amber-700',
  CLASS: 'bg-teal-100 text-teal-700',
  SECTION: 'bg-cyan-100 text-cyan-700',
}

function PublishBadge({ isPublished }: { isPublished: boolean }) {
  return (
    <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded border',
      isPublished ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'
    )}>
      {isPublished ? 'Published' : 'Draft'}
    </span>
  )
}

// ── Notices Tab ───────────────────────────────────────────────────

function NoticesTab({ schoolId, canWrite }: { schoolId: string; canWrite: boolean }) {
  const { data: classes = [] } = useClasses(schoolId)
  const [sections, setSections] = useState<ClassSection[]>([])

  const [search, setSearch] = useState('')
  const [dSearch, setDSearch] = useState('')
  const [targetFilter, setTargetFilter] = useState('')
  const [publishedFilter, setPublishedFilter] = useState('')
  const [page, setPage] = useState(1)

  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const [form, setForm] = useState({
    title: '', body: '', target: 'ALL' as NoticeTarget,
    wingTarget: '' as WingType | '', classId: '', sectionId: '', isPublished: false,
  })

  useEffect(() => {
    const t = setTimeout(() => { setDSearch(search); setPage(1) }, 400)
    return () => clearTimeout(t)
  }, [search])

  // Load sections when classId changes in form
  useEffect(() => {
    setForm((f) => ({ ...f, sectionId: '' }))
    setSections([])
    if (!form.classId) return
    classApi.listSections(schoolId, form.classId).then((res) => setSections(res.data.data ?? [])).catch(() => {})
  }, [form.classId, schoolId])

  const { data, isLoading } = useNotices(schoolId, {
    page, limit: 15,
    search: dSearch || undefined,
    target: targetFilter ? targetFilter as NoticeTarget : undefined,
    isPublished: publishedFilter === '' ? undefined : publishedFilter === 'true',
  })
  const notices = data?.data ?? []
  const meta = data?.meta

  const { mutate: create, isPending: creating } = useCreateNotice(schoolId)
  const { mutate: update, isPending: updating } = useUpdateNotice(schoolId, editId ?? '')
  const { mutate: publish } = usePublishNotice(schoolId)
  const { mutate: del } = useDeleteNotice(schoolId)

  const resetForm = () => {
    setForm({ title: '', body: '', target: 'ALL', wingTarget: '', classId: '', sectionId: '', isPublished: false })
    setEditId(null)
    setShowForm(false)
  }

  const startEdit = (n: Notice) => {
    setForm({
      title: n.title, body: n.body, target: n.target,
      wingTarget: (n.wingTarget as WingType | null) ?? '',
      classId: n.classId ?? '', sectionId: n.sectionId ?? '',
      isPublished: n.isPublished,
    })
    setEditId(n.id)
    setShowForm(true)
    setExpandedId(null)
  }

  const handleSubmit = () => {
    const payload = {
      title: form.title.trim(), body: form.body.trim(), target: form.target,
      wingTarget: (form.wingTarget || undefined) as WingType | undefined,
      classId: form.classId || undefined,
      sectionId: form.sectionId || undefined,
      isPublished: form.isPublished,
    }
    if (editId) update(payload, { onSuccess: resetForm })
    else create(payload, { onSuccess: resetForm })
  }

  const needsWing = form.target === 'WING'
  const needsClass = form.target === 'CLASS' || form.target === 'SECTION'
  const needsSection = form.target === 'SECTION'

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48 max-w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9 h-9" placeholder="Search notices…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          value={targetFilter} onChange={(e) => setTargetFilter(e.target.value)}>
          <option value="">All Targets</option>
          {NOTICE_TARGETS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <select className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          value={publishedFilter} onChange={(e) => setPublishedFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="true">Published</option>
          <option value="false">Draft</option>
        </select>
        {canWrite && (
          <Button size="sm" className="ml-auto" onClick={() => { resetForm(); setShowForm(true) }}>
            <Plus className="h-3.5 w-3.5 mr-1" /> New Notice
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <Card className="border-primary/30">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">{editId ? 'Edit' : 'New'} Notice</h3>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={resetForm}><X className="h-3.5 w-3.5" /></Button>
            </div>
            <div>
              <label className="text-xs font-medium">Title</label>
              <Input className="mt-1 h-9" placeholder="Notice title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium">Body</label>
              <textarea
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                rows={4}
                placeholder="Notice content…"
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-medium">Target</label>
                <select className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value as NoticeTarget, wingTarget: '', classId: '', sectionId: '' })}>
                  {NOTICE_TARGETS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              {needsWing && (
                <div>
                  <label className="text-xs font-medium">Wing</label>
                  <select className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                    value={form.wingTarget} onChange={(e) => setForm({ ...form, wingTarget: e.target.value as WingType })}>
                    <option value="">Select</option>
                    {WINGS.map((w) => <option key={w.value} value={w.value}>{w.label}</option>)}
                  </select>
                </div>
              )}
              {needsClass && (
                <div>
                  <label className="text-xs font-medium">Class</label>
                  <select className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                    value={form.classId} onChange={(e) => setForm({ ...form, classId: e.target.value })}>
                    <option value="">Select</option>
                    {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              )}
              {needsSection && sections.length > 0 && (
                <div>
                  <label className="text-xs font-medium">Section</label>
                  <select className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                    value={form.sectionId} onChange={(e) => setForm({ ...form, sectionId: e.target.value })}>
                    <option value="">All sections</option>
                    {sections.map((s) => <option key={s.id} value={s.id}>Section {s.name}</option>)}
                  </select>
                </div>
              )}
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} />
              Publish immediately
            </label>
            <div className="flex gap-2 pt-1">
              <Button size="sm" disabled={creating || updating || !form.title || !form.body} onClick={handleSubmit}>
                {(creating || updating) ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Save className="h-3.5 w-3.5 mr-1" />}
                {editId ? 'Save' : 'Create'}
              </Button>
              <Button size="sm" variant="outline" onClick={resetForm}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading && <div className="flex items-center gap-2 text-sm text-muted-foreground py-8"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>}
      {!isLoading && notices.length === 0 && <div className="text-center py-12 text-muted-foreground text-sm">No notices found.</div>}

      <div className="space-y-2">
        {notices.map((n) => {
          const expanded = expandedId === n.id
          return (
            <Card key={n.id} className={cn(!n.isPublished && 'opacity-80')}>
              <CardContent className="p-0">
                <button
                  className="w-full flex items-start gap-3 px-4 py-3 hover:bg-muted/30 text-left transition-colors"
                  onClick={() => setExpandedId(expanded ? null : n.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm">{n.title}</span>
                      <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded', TARGET_COLORS[n.target])}>
                        {NOTICE_TARGETS.find((t) => t.value === n.target)?.label ?? n.target}
                      </span>
                      <PublishBadge isPublished={n.isPublished} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {format(new Date(n.createdAt), 'dd MMM yyyy')}
                      {n.publishedAt && ` · Published ${format(new Date(n.publishedAt), 'dd MMM')}`}
                    </p>
                  </div>
                  {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />}
                </button>
                {expanded && (
                  <div className="border-t px-4 py-3 space-y-3 bg-muted/20">
                    <p className="text-sm whitespace-pre-wrap">{n.body}</p>
                    {canWrite && (
                      <div className="flex gap-2 flex-wrap">
                        <Button size="sm" variant="outline"
                          onClick={() => publish({ id: n.id, isPublished: !n.isPublished })}>
                          {n.isPublished ? <EyeOff className="h-3.5 w-3.5 mr-1" /> : <Send className="h-3.5 w-3.5 mr-1" />}
                          {n.isPublished ? 'Unpublish' : 'Publish'}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => startEdit(n)}>
                          <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                        </Button>
                        <Button size="sm" variant="outline" className="text-destructive hover:text-destructive"
                          onClick={() => del(n.id)}>
                          <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

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

// ── Circulars Tab ─────────────────────────────────────────────────

function CircularsTab({ schoolId, canWrite }: { schoolId: string; canWrite: boolean }) {
  const [search, setSearch] = useState('')
  const [dSearch, setDSearch] = useState('')
  const [publishedFilter, setPublishedFilter] = useState('')
  const [page, setPage] = useState(1)

  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const [form, setForm] = useState({
    circularNo: '', title: '', body: '', isPublished: false,
  })
  const [existingFileUrl, setExistingFileUrl] = useState<string | null>(null)
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const t = setTimeout(() => { setDSearch(search); setPage(1) }, 400)
    return () => clearTimeout(t)
  }, [search])

  const { data, isLoading } = useCirculars(schoolId, {
    page, limit: 15,
    search: dSearch || undefined,
    isPublished: publishedFilter === '' ? undefined : publishedFilter === 'true',
  })
  const circulars = data?.data ?? []
  const meta = data?.meta

  const { mutate: create, isPending: creating } = useCreateCircular(schoolId)
  const { mutate: update, isPending: updating } = useUpdateCircular(schoolId, editId ?? '')
  const { mutate: publish } = usePublishCircular(schoolId)
  const { mutate: del } = useDeleteCircular(schoolId)

  const resetForm = () => {
    setForm({ circularNo: '', title: '', body: '', isPublished: false })
    setExistingFileUrl(null)
    setAttachmentFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    setEditId(null)
    setShowForm(false)
  }

  const startEdit = (c: Circular) => {
    setForm({ circularNo: c.circularNo ?? '', title: c.title, body: c.body, isPublished: c.isPublished })
    setExistingFileUrl(c.fileUrl ?? null)
    setAttachmentFile(null)
    setEditId(c.id)
    setShowForm(true)
    setExpandedId(null)
  }

  const handleSubmit = () => {
    const payload = {
      circularNo: form.circularNo.trim() || undefined,
      title: form.title.trim(), body: form.body.trim(),
      isPublished: form.isPublished,
    }
    if (editId) update({ payload, attachmentFile: attachmentFile ?? undefined }, { onSuccess: resetForm })
    else create({ payload, attachmentFile: attachmentFile ?? undefined }, { onSuccess: resetForm })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48 max-w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9 h-9" placeholder="Search circulars…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          value={publishedFilter} onChange={(e) => setPublishedFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="true">Published</option>
          <option value="false">Draft</option>
        </select>
        {canWrite && (
          <Button size="sm" className="ml-auto" onClick={() => { resetForm(); setShowForm(true) }}>
            <Plus className="h-3.5 w-3.5 mr-1" /> New Circular
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <Card className="border-primary/30">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">{editId ? 'Edit' : 'New'} Circular</h3>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={resetForm}><X className="h-3.5 w-3.5" /></Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium">Circular No. (optional)</label>
                <Input className="mt-1 h-9" placeholder="e.g. CIRC/2025/001" value={form.circularNo} onChange={(e) => setForm({ ...form, circularNo: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium">Title</label>
                <Input className="mt-1 h-9" placeholder="Circular title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium">Body</label>
              <textarea
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                rows={4}
                placeholder="Circular content…"
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-medium">Attachment <span className="text-muted-foreground">(optional)</span></label>
              <div className="mt-1 flex items-center gap-2">
                <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" className="hidden"
                  onChange={(e) => { setAttachmentFile(e.target.files?.[0] ?? null) }} />
                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <Paperclip className="h-3.5 w-3.5 mr-1" />
                  {attachmentFile ? attachmentFile.name : 'Choose File'}
                </Button>
                {attachmentFile && (
                  <button type="button" onClick={() => { setAttachmentFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                    className="text-muted-foreground hover:text-destructive">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
                {!attachmentFile && existingFileUrl && (
                  <a href={existingFileUrl} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-primary flex items-center gap-1 hover:underline">
                    <ExternalLink className="h-3 w-3" /> Current file
                  </a>
                )}
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} />
              Publish immediately
            </label>
            <div className="flex gap-2 pt-1">
              <Button size="sm" disabled={creating || updating || !form.title || !form.body} onClick={handleSubmit}>
                {(creating || updating) ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Save className="h-3.5 w-3.5 mr-1" />}
                {editId ? 'Save' : 'Create'}
              </Button>
              <Button size="sm" variant="outline" onClick={resetForm}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading && <div className="flex items-center gap-2 text-sm text-muted-foreground py-8"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>}
      {!isLoading && circulars.length === 0 && <div className="text-center py-12 text-muted-foreground text-sm">No circulars found.</div>}

      <div className="space-y-2">
        {circulars.map((c) => {
          const expanded = expandedId === c.id
          return (
            <Card key={c.id} className={cn(!c.isPublished && 'opacity-80')}>
              <CardContent className="p-0">
                <button
                  className="w-full flex items-start gap-3 px-4 py-3 hover:bg-muted/30 text-left transition-colors"
                  onClick={() => setExpandedId(expanded ? null : c.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {c.circularNo && <span className="text-xs text-muted-foreground font-mono">{c.circularNo}</span>}
                      <span className="font-semibold text-sm">{c.title}</span>
                      <PublishBadge isPublished={c.isPublished} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {format(new Date(c.createdAt), 'dd MMM yyyy')}
                      {c.publishedAt && ` · Published ${format(new Date(c.publishedAt), 'dd MMM')}`}
                    </p>
                  </div>
                  {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />}
                </button>
                {expanded && (
                  <div className="border-t px-4 py-3 space-y-3 bg-muted/20">
                    <p className="text-sm whitespace-pre-wrap">{c.body}</p>
                    {c.fileUrl && (
                      <a href={c.fileUrl} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline">
                        <ExternalLink className="h-3 w-3" /> View attached file
                      </a>
                    )}
                    {canWrite && (
                      <div className="flex gap-2 flex-wrap">
                        <Button size="sm" variant="outline"
                          onClick={() => publish({ id: c.id, isPublished: !c.isPublished })}>
                          {c.isPublished ? <EyeOff className="h-3.5 w-3.5 mr-1" /> : <Send className="h-3.5 w-3.5 mr-1" />}
                          {c.isPublished ? 'Unpublish' : 'Publish'}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => startEdit(c)}>
                          <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                        </Button>
                        <Button size="sm" variant="outline" className="text-destructive hover:text-destructive"
                          onClick={() => del(c.id)}>
                          <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

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

// ── Main Page ─────────────────────────────────────────────────────

function NoticesPage() {
  const { user } = useAuthStore()
  const schoolId = user?.schoolId ?? ''
  const role = user?.role ?? ''
  const canWriteNotice = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'OFFICE_STAFF'].includes(role)
  const canWriteCircular = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'].includes(role)
  const [tab, setTab] = useState<Tab>('notices')

  if (!schoolId) return <div className="text-center py-16 text-muted-foreground text-sm">No school assigned.</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Notices & Circulars</h1>
        <p className="text-sm text-muted-foreground">Broadcast announcements to staff, students, and parents.</p>
      </div>

      <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
        <button
          type="button"
          onClick={() => setTab('notices')}
          className={cn('flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors',
            tab === 'notices' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}
        >
          <Bell className="h-4 w-4" /> Notices
        </button>
        <button
          type="button"
          onClick={() => setTab('circulars')}
          className={cn('flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors',
            tab === 'circulars' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}
        >
          <FileText className="h-4 w-4" /> Circulars
        </button>
      </div>

      {tab === 'notices' && <NoticesTab schoolId={schoolId} canWrite={canWriteNotice} />}
      {tab === 'circulars' && <CircularsTab schoolId={schoolId} canWrite={canWriteCircular} />}
    </div>
  )
}
