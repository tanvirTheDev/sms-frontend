import { apiClient } from './client'
import type {
  AcademicYear, SchoolWing, SchoolClass, ClassSection, Subject, ClassSubject,
  CreateAcademicYearPayload, UpdateAcademicYearPayload,
  CreateWingPayload, UpdateWingPayload,
  CreateClassPayload, UpdateClassPayload,
  CreateSectionPayload, UpdateSectionPayload,
  CreateSubjectPayload, UpdateSubjectPayload,
  AssignSubjectPayload,
  WingType, AcademicSubjectGroup,
} from '@/types/academic'

type SimpleResponse<T> = { success: boolean; data: T }

export const academicYearApi = {
  list: (schoolId: string) =>
    apiClient.get<SimpleResponse<AcademicYear[]>>(`/schools/${schoolId}/academic-years`),

  getById: (schoolId: string, id: string) =>
    apiClient.get<SimpleResponse<AcademicYear>>(`/schools/${schoolId}/academic-years/${id}`),

  getCurrent: (schoolId: string) =>
    apiClient.get<SimpleResponse<AcademicYear>>(`/schools/${schoolId}/academic-years/current`),

  create: (schoolId: string, payload: CreateAcademicYearPayload) =>
    apiClient.post<SimpleResponse<AcademicYear>>(`/schools/${schoolId}/academic-years`, payload),

  update: (schoolId: string, id: string, payload: UpdateAcademicYearPayload) =>
    apiClient.patch<SimpleResponse<AcademicYear>>(`/schools/${schoolId}/academic-years/${id}`, payload),

  setCurrent: (schoolId: string, id: string) =>
    apiClient.patch<SimpleResponse<{ message: string }>>(`/schools/${schoolId}/academic-years/${id}/set-current`),
}

export const wingApi = {
  list: (schoolId: string) =>
    apiClient.get<SimpleResponse<SchoolWing[]>>(`/schools/${schoolId}/wings`),

  create: (schoolId: string, payload: CreateWingPayload) =>
    apiClient.post<SimpleResponse<SchoolWing>>(`/schools/${schoolId}/wings`, payload),

  update: (schoolId: string, id: string, payload: UpdateWingPayload) =>
    apiClient.patch<SimpleResponse<SchoolWing>>(`/schools/${schoolId}/wings/${id}`, payload),
}

export const classApi = {
  list: (schoolId: string, params?: { academicYearId?: string; wingId?: string }) =>
    apiClient.get<SimpleResponse<SchoolClass[]>>(`/schools/${schoolId}/classes`, { params }),

  getById: (schoolId: string, id: string) =>
    apiClient.get<SimpleResponse<SchoolClass>>(`/schools/${schoolId}/classes/${id}`),

  create: (schoolId: string, payload: CreateClassPayload) =>
    apiClient.post<SimpleResponse<SchoolClass>>(`/schools/${schoolId}/classes`, payload),

  update: (schoolId: string, id: string, payload: UpdateClassPayload) =>
    apiClient.patch<SimpleResponse<SchoolClass>>(`/schools/${schoolId}/classes/${id}`, payload),

  delete: (schoolId: string, id: string) =>
    apiClient.delete<SimpleResponse<null>>(`/schools/${schoolId}/classes/${id}`),

  listSections: (schoolId: string, classId: string) =>
    apiClient.get<SimpleResponse<ClassSection[]>>(`/schools/${schoolId}/classes/${classId}/sections`),

  createSection: (schoolId: string, classId: string, payload: CreateSectionPayload) =>
    apiClient.post<SimpleResponse<ClassSection>>(`/schools/${schoolId}/classes/${classId}/sections`, payload),

  updateSection: (schoolId: string, classId: string, id: string, payload: UpdateSectionPayload) =>
    apiClient.patch<SimpleResponse<ClassSection>>(`/schools/${schoolId}/classes/${classId}/sections/${id}`, payload),

  deleteSection: (schoolId: string, classId: string, id: string) =>
    apiClient.delete<SimpleResponse<null>>(`/schools/${schoolId}/classes/${classId}/sections/${id}`),

  listSubjects: (schoolId: string, classId: string) =>
    apiClient.get<SimpleResponse<ClassSubject[]>>(`/schools/${schoolId}/classes/${classId}/subjects`),

  assignSubject: (schoolId: string, classId: string, payload: AssignSubjectPayload) =>
    apiClient.post<SimpleResponse<ClassSubject>>(`/schools/${schoolId}/classes/${classId}/subjects`, payload),

  removeSubject: (schoolId: string, classId: string, id: string) =>
    apiClient.delete<SimpleResponse<null>>(`/schools/${schoolId}/classes/${classId}/subjects/${id}`),
}

export const subjectApi = {
  list: (schoolId: string, params?: { wing?: WingType; subjectGroup?: AcademicSubjectGroup }) =>
    apiClient.get<SimpleResponse<Subject[]>>(`/schools/${schoolId}/subjects`, { params }),

  getById: (schoolId: string, id: string) =>
    apiClient.get<SimpleResponse<Subject>>(`/schools/${schoolId}/subjects/${id}`),

  create: (schoolId: string, payload: CreateSubjectPayload) =>
    apiClient.post<SimpleResponse<Subject>>(`/schools/${schoolId}/subjects`, payload),

  update: (schoolId: string, id: string, payload: UpdateSubjectPayload) =>
    apiClient.patch<SimpleResponse<Subject>>(`/schools/${schoolId}/subjects/${id}`, payload),

  delete: (schoolId: string, id: string) =>
    apiClient.delete<SimpleResponse<null>>(`/schools/${schoolId}/subjects/${id}`),
}
