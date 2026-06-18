export type NoticeTarget = 'ALL' | 'WING' | 'CLASS' | 'SECTION' | 'STAFF' | 'PARENTS'
export type WingType = 'PRE_PRIMARY' | 'PRIMARY' | 'SECONDARY' | 'HIGHER_SECONDARY' | 'MADRASA' | 'VOCATIONAL'

export interface Notice {
  id: string
  schoolId: string
  title: string
  body: string
  target: NoticeTarget
  wingTarget: WingType | null
  classId: string | null
  sectionId: string | null
  isPublished: boolean
  publishedAt: string | null
  createdBy: string
  createdAt: string
}

export interface CreateNoticePayload {
  title: string
  body: string
  target?: NoticeTarget
  wingTarget?: WingType
  classId?: string
  sectionId?: string
  isPublished?: boolean
}

export type UpdateNoticePayload = Partial<CreateNoticePayload>

export interface Circular {
  id: string
  schoolId: string
  circularNo: string | null
  title: string
  body: string
  fileUrl: string | null
  isPublished: boolean
  publishedAt: string | null
  createdBy: string
  createdAt: string
}

export interface CreateCircularPayload {
  circularNo?: string
  title: string
  body: string
  fileUrl?: string
  isPublished?: boolean
}

export type UpdateCircularPayload = Partial<CreateCircularPayload>
