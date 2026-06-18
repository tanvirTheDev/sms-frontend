import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { GraduationCap, Plus, Search, Loader2, UserX } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useStudents } from '@/features/students/hooks'
import { useClasses } from '@/features/academic-setup/hooks'
import { classApi } from '@/api/academic'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { GROUP_COLORS } from '@/features/students/constants'
import type { StudentSubjectGroup } from '@/types/student'
import type { ClassSection } from '@/types/academic'

export const Route = createFileRoute('/_authenticated/students/')({
  component: StudentsListPage,
})

const CAN_MANAGE = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'OFFICE_STAFF']

function StudentsListPage() {
  const { user } = useAuthStore()
  const schoolId = user?.schoolId ?? null
  const canManage = CAN_MANAGE.includes(user?.role ?? '')

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [classId, setClassId] = useState('')
  const [sectionId, setSectionId] = useState('')
  const [isActive, setIsActive] = useState<string>('true')
  const [page, setPage] = useState(1)
  const [sections, setSections] = useState<ClassSection[]>([])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  // Reset page on filter change
  useEffect(() => { setPage(1) }, [debouncedSearch, classId, sectionId, isActive])

  // Load sections when class changes
  useEffect(() => {
    setSectionId('')
    setSections([])
    if (!classId || !schoolId) return
    classApi.listSections(schoolId, classId).then((res) => {
      setSections(res.data.data ?? [])
    }).catch(() => {})
  }, [classId, schoolId])

  const { data: classes = [] } = useClasses(schoolId)
  const { data, isLoading } = useStudents(schoolId, {
    page,
    limit: 20,
    search: debouncedSearch || undefined,
    classId: classId || undefined,
    sectionId: sectionId || undefined,
    isActive: isActive === '' ? undefined : isActive === 'true',
  })

  const students = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Students</h1>
          <p className="text-sm text-muted-foreground">
            {meta ? `${meta.total} student${meta.total !== 1 ? 's' : ''}` : 'Loading...'}
          </p>
        </div>
        {canManage && (
          <Link to="/students/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1.5" /> Enroll Student
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48 max-w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search name / ID..."
            className="pl-9 h-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
        >
          <option value="">All Classes</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        {sections.length > 0 && (
          <select
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
            value={sectionId}
            onChange={(e) => setSectionId(e.target.value)}
          >
            <option value="">All Sections</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>Section {s.name}</option>
            ))}
          </select>
        )}
        <select
          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
          value={isActive}
          onChange={(e) => setIsActive(e.target.value)}
        >
          <option value="true">Active</option>
          <option value="false">Dropped</option>
          <option value="">All</option>
        </select>
      </div>

      {/* List */}
      {isLoading && (
        <div className="flex items-center gap-2 text-muted-foreground text-sm py-8 justify-center">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading students...
        </div>
      )}

      {!isLoading && students.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <GraduationCap className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="font-medium">No students found</p>
            <p className="text-xs mt-1">
              {debouncedSearch ? 'Try a different search term.' : 'Enroll your first student to get started.'}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {students.map((student) => (
          <Link key={student.id} to="/students/$studentId" params={{ studentId: student.id }}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="p-4">
                {/* Avatar + name */}
                <div className="flex items-start gap-3 mb-3">
                  <div className={cn(
                    'h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0',
                    student.gender === 'FEMALE' ? 'bg-pink-500' : student.gender === 'MALE' ? 'bg-blue-500' : 'bg-gray-500',
                  )}>
                    {student.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm leading-tight truncate">{student.name}</p>
                    {student.nameBn && (
                      <p className="text-xs text-muted-foreground truncate">{student.nameBn}</p>
                    )}
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">{student.studentId}</p>
                  </div>
                </div>

                {/* Class/Section */}
                {student.section && (
                  <p className="text-xs text-muted-foreground mb-2">
                    {student.section.class.name} · Section {student.section.name}
                  </p>
                )}

                {/* Badges */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {student.subjectGroup && student.subjectGroup !== 'NONE' && (
                    <Badge className={cn('text-[10px] h-4 px-1.5', GROUP_COLORS[student.subjectGroup as StudentSubjectGroup])}>
                      {student.subjectGroup.replace(/_/g, ' ')}
                    </Badge>
                  )}
                  {!student.isActive && (
                    <Badge variant="outline" className="text-[10px] h-4 px-1.5 border-red-400 text-red-500">
                      <UserX className="h-2.5 w-2.5 mr-0.5" /> Dropped
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">
            Page {meta.page} of {meta.totalPages} · {meta.total} students
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline" size="sm" disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline" size="sm" disabled={page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
