export type GuardianRelation =
  | 'FATHER' | 'MOTHER' | 'GRANDFATHER' | 'GRANDMOTHER'
  | 'UNCLE' | 'AUNT' | 'ELDER_SIBLING' | 'LOCAL_GUARDIAN' | 'OTHER'

export interface Guardian {
  id: string
  studentId: string
  relation: GuardianRelation
  name: string
  nameBn: string | null
  nid: string | null
  phone: string
  occupation: string | null
  monthlyIncome: number | null
  education: string | null
  isEmergency: boolean
  parent: { id: string; userId: string } | null
}

export interface CreateGuardianPayload {
  relation: GuardianRelation
  name: string
  nameBn?: string
  nid?: string
  phone: string
  occupation?: string
  monthlyIncome?: number
  education?: string
  isEmergency?: boolean
}

export type UpdateGuardianPayload = Partial<CreateGuardianPayload>
