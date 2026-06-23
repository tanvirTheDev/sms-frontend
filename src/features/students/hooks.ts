import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { studentsApi, type ListStudentsQuery } from '@/api/students'
import type { CreateStudentPayload, UpdateStudentPayload, DropStudentPayload } from '@/types/student'

const QK = 'students'

const errorMap: Record<string, string> = {
  STUDENT_ID_CONFLICT: 'Student ID already exists in this school.',
  SECTION_NOT_FOUND: 'Selected section not found.',
  STUDENT_NOT_FOUND: 'Student not found.',
  STUDENT_ALREADY_DROPPED: 'Student is already dropped.',
}

export function useStudents(schoolId: string | null, query: ListStudentsQuery = {}) {
  return useQuery({
    queryKey: [QK, schoolId, query],
    queryFn: async () => {
      const res = await studentsApi.list(schoolId!, query)
      return res.data
    },
    enabled: !!schoolId,
    staleTime: 30 * 1000,
  })
}

export function useStudent(schoolId: string | null, id: string | null) {
  return useQuery({
    queryKey: [QK, schoolId, id],
    queryFn: async () => {
      const res = await studentsApi.getById(schoolId!, id!)
      return res.data.data
    },
    enabled: !!schoolId && !!id,
    staleTime: 60 * 1000,
  })
}

export function useCreateStudent(schoolId: string) {
  const qc = useQueryClient()
  const navigate = useNavigate()
  return useMutation({
    mutationFn: ({ payload, photoFile }: { payload: CreateStudentPayload; photoFile?: File }) =>
      studentsApi.create(schoolId, payload, photoFile),
    onSuccess: ({ data }) => {
      qc.invalidateQueries({ queryKey: [QK, schoolId] })
      toast.success('Student enrolled successfully')
      navigate({ to: '/students/$studentId', params: { studentId: data.data!.id } })
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message ?? 'Enrollment failed'
      toast.error(errorMap[msg] ?? msg)
    },
  })
}

export function useUpdateStudent(schoolId: string, id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ payload, photoFile }: { payload: UpdateStudentPayload; photoFile?: File }) =>
      studentsApi.update(schoolId, id, payload, photoFile),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK, schoolId, id] })
      qc.invalidateQueries({ queryKey: [QK, schoolId] })
      toast.success('Student updated')
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message ?? 'Update failed'
      toast.error(errorMap[msg] ?? msg)
    },
  })
}

export function useDropStudent(schoolId: string) {
  const qc = useQueryClient()
  const navigate = useNavigate()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: DropStudentPayload }) =>
      studentsApi.drop(schoolId, id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK, schoolId] })
      toast.success('Student has been dropped')
      navigate({ to: '/students' })
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message ?? 'Drop failed'
      toast.error(errorMap[msg] ?? msg)
    },
  })
}
