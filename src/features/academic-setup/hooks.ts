import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { academicYearApi, wingApi, classApi, subjectApi } from '@/api/academic'
import type {
  CreateAcademicYearPayload, UpdateAcademicYearPayload,
  CreateWingPayload, UpdateWingPayload,
  CreateClassPayload, UpdateClassPayload,
  CreateSectionPayload, UpdateSectionPayload,
  CreateSubjectPayload, UpdateSubjectPayload,
  AssignSubjectPayload,
  WingType, AcademicSubjectGroup,
} from '@/types/academic'

// ── Academic Years ────────────────────────────────────────────────────────────

export function useAcademicYears(schoolId: string | null) {
  return useQuery({
    queryKey: ['academic-years', schoolId],
    queryFn: async () => {
      const res = await academicYearApi.list(schoolId!)
      return res.data.data
    },
    enabled: !!schoolId,
    staleTime: 2 * 60 * 1000,
  })
}

export function useCurrentAcademicYear(schoolId: string | null) {
  return useQuery({
    queryKey: ['academic-years', schoolId, 'current'],
    queryFn: async () => {
      const res = await academicYearApi.getCurrent(schoolId!)
      return res.data.data
    },
    enabled: !!schoolId,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateAcademicYear(schoolId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateAcademicYearPayload) => academicYearApi.create(schoolId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['academic-years', schoolId] })
      toast.success('Academic year created')
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message ?? 'Failed to create academic year'
      const friendly: Record<string, string> = {
        ACADEMIC_YEAR_CONFLICT: 'A year with this calendar year already exists.',
        ACADEMIC_YEAR_NAME_CONFLICT: 'A year with this name already exists.',
      }
      toast.error(friendly[msg] ?? msg)
    },
  })
}

export function useUpdateAcademicYear(schoolId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateAcademicYearPayload }) =>
      academicYearApi.update(schoolId, id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['academic-years', schoolId] })
      toast.success('Academic year updated')
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? 'Update failed'),
  })
}

export function useSetCurrentAcademicYear(schoolId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => academicYearApi.setCurrent(schoolId, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['academic-years', schoolId] })
      toast.success('Current academic year updated')
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? 'Failed to set current year'),
  })
}

// ── Wings ─────────────────────────────────────────────────────────────────────

export function useWings(schoolId: string | null) {
  return useQuery({
    queryKey: ['wings', schoolId],
    queryFn: async () => {
      const res = await wingApi.list(schoolId!)
      return res.data.data
    },
    enabled: !!schoolId,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateWing(schoolId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateWingPayload) => wingApi.create(schoolId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wings', schoolId] })
      toast.success('Wing created')
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message ?? 'Failed to create wing'
      toast.error(msg === 'WING_CONFLICT' ? 'This wing already exists.' : msg)
    },
  })
}

export function useUpdateWing(schoolId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateWingPayload }) =>
      wingApi.update(schoolId, id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wings', schoolId] })
      toast.success('Wing updated')
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? 'Update failed'),
  })
}

// ── Classes ───────────────────────────────────────────────────────────────────

export function useClasses(schoolId: string | null, params?: { academicYearId?: string; wingId?: string }) {
  return useQuery({
    queryKey: ['classes', schoolId, params],
    queryFn: async () => {
      const res = await classApi.list(schoolId!, params)
      return res.data.data
    },
    enabled: !!schoolId,
    staleTime: 2 * 60 * 1000,
  })
}

export function useCreateClass(schoolId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateClassPayload) => classApi.create(schoolId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['classes', schoolId] })
      toast.success('Class created')
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message ?? 'Failed to create class'
      const friendly: Record<string, string> = {
        CLASS_CONFLICT: 'A class with this name already exists in this wing and year.',
        WING_NOT_FOUND: 'Selected wing not found.',
        ACADEMIC_YEAR_NOT_FOUND: 'Selected academic year not found.',
      }
      toast.error(friendly[msg] ?? msg)
    },
  })
}

export function useUpdateClass(schoolId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateClassPayload }) =>
      classApi.update(schoolId, id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['classes', schoolId] })
      toast.success('Class updated')
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? 'Update failed'),
  })
}

export function useDeleteClass(schoolId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => classApi.delete(schoolId, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['classes', schoolId] })
      toast.success('Class deleted')
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message ?? 'Delete failed'
      toast.error(msg === 'CLASS_HAS_STUDENTS' ? 'Cannot delete — class has enrolled students.' : msg)
    },
  })
}

// ── Sections ──────────────────────────────────────────────────────────────────

export function useCreateSection(schoolId: string, classId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateSectionPayload) => classApi.createSection(schoolId, classId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['classes', schoolId] })
      toast.success('Section created')
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message ?? 'Failed to create section'
      toast.error(msg === 'SECTION_CONFLICT' ? 'Section name already exists in this class.' : msg)
    },
  })
}

export function useUpdateSection(schoolId: string, classId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateSectionPayload }) =>
      classApi.updateSection(schoolId, classId, id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['classes', schoolId] })
      toast.success('Section updated')
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? 'Update failed'),
  })
}

export function useDeleteSection(schoolId: string, classId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => classApi.deleteSection(schoolId, classId, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['classes', schoolId] })
      toast.success('Section deleted')
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message ?? 'Delete failed'
      toast.error(msg === 'SECTION_HAS_STUDENTS' ? 'Cannot delete — section has enrolled students.' : msg)
    },
  })
}

// ── Subjects ──────────────────────────────────────────────────────────────────

export function useSubjects(schoolId: string | null, params?: { wing?: WingType; subjectGroup?: AcademicSubjectGroup }) {
  return useQuery({
    queryKey: ['subjects', schoolId, params],
    queryFn: async () => {
      const res = await subjectApi.list(schoolId!, params)
      return res.data.data
    },
    enabled: !!schoolId,
    staleTime: 2 * 60 * 1000,
  })
}

export function useCreateSubject(schoolId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateSubjectPayload) => subjectApi.create(schoolId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subjects', schoolId] })
      toast.success('Subject created')
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message ?? 'Failed to create subject'
      toast.error(msg === 'SUBJECT_CONFLICT' ? 'Subject with this name already exists in this wing/group.' : msg)
    },
  })
}

export function useUpdateSubject(schoolId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateSubjectPayload }) =>
      subjectApi.update(schoolId, id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subjects', schoolId] })
      toast.success('Subject updated')
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? 'Update failed'),
  })
}

export function useDeleteSubject(schoolId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => subjectApi.delete(schoolId, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subjects', schoolId] })
      toast.success('Subject deleted')
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message ?? 'Delete failed'
      toast.error(msg === 'SUBJECT_IN_USE' ? 'Cannot delete — subject is assigned to a class.' : msg)
    },
  })
}

export function useAssignSubject(schoolId: string, classId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: AssignSubjectPayload) => classApi.assignSubject(schoolId, classId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['class-subjects', schoolId, classId] })
      toast.success('Subject assigned')
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message ?? 'Failed to assign subject'
      toast.error(msg === 'SUBJECT_ALREADY_ASSIGNED' ? 'Subject already assigned to this class.' : msg)
    },
  })
}

export function useClassSubjects(schoolId: string | null, classId: string | null) {
  return useQuery({
    queryKey: ['class-subjects', schoolId, classId],
    queryFn: async () => {
      const res = await classApi.listSubjects(schoolId!, classId!)
      return res.data.data
    },
    enabled: !!schoolId && !!classId,
    staleTime: 2 * 60 * 1000,
  })
}

export function useRemoveClassSubject(schoolId: string, classId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => classApi.removeSubject(schoolId, classId, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['class-subjects', schoolId, classId] })
      toast.success('Subject removed from class')
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? 'Remove failed'),
  })
}
