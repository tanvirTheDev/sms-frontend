import type {
  ManagementType, InstitutionType, InstitutionLevel,
  MediumOfInstruction, InstitutionGender, LocationType, BoardAffiliation,
} from '@/types/school'

export const MANAGEMENT_TYPES: { value: ManagementType; label: string }[] = [
  { value: 'GOVERNMENT', label: 'Government' },
  { value: 'SEMI_GOVERNMENT', label: 'Semi-Government' },
  { value: 'MPO', label: 'MPO' },
  { value: 'NON_MPO', label: 'Non-MPO' },
  { value: 'PRIVATE', label: 'Private' },
  { value: 'AUTONOMOUS', label: 'Autonomous' },
]

export const INSTITUTION_TYPES: { value: InstitutionType; label: string }[] = [
  { value: 'SCHOOL', label: 'School' },
  { value: 'MADRASA', label: 'Madrasa' },
  { value: 'COLLEGE', label: 'College' },
  { value: 'SCHOOL_AND_COLLEGE', label: 'School & College' },
  { value: 'TECHNICAL', label: 'Technical Institute' },
]

export const INSTITUTION_LEVELS: { value: InstitutionLevel; label: string }[] = [
  { value: 'PRE_PRIMARY', label: 'Pre-Primary (Nursery/KG)' },
  { value: 'PRIMARY', label: 'Primary (Class 1–5)' },
  { value: 'SECONDARY', label: 'Secondary (Class 6–10)' },
  { value: 'HIGHER_SECONDARY', label: 'Higher Secondary (Class 11–12)' },
  { value: 'COMBINED', label: 'Combined' },
]

export const MEDIUMS: { value: MediumOfInstruction; label: string }[] = [
  { value: 'BANGLA', label: 'Bangla' },
  { value: 'ENGLISH', label: 'English' },
  { value: 'BOTH', label: 'Both' },
]

export const GENDERS: { value: InstitutionGender; label: string }[] = [
  { value: 'CO_ED', label: 'Co-ed' },
  { value: 'BOYS', label: 'Boys' },
  { value: 'GIRLS', label: 'Girls' },
]

export const LOCATION_TYPES: { value: LocationType; label: string }[] = [
  { value: 'RURAL', label: 'Rural' },
  { value: 'UNION', label: 'Union' },
  { value: 'UPAZILA_SADAR', label: 'Upazila Sadar' },
  { value: 'PAURASHAVA', label: 'Paurashava' },
  { value: 'CITY_CORPORATION', label: 'City Corporation' },
]

export const BOARD_AFFILIATIONS: { value: BoardAffiliation; label: string }[] = [
  { value: 'DHAKA', label: 'Dhaka Board' },
  { value: 'CHITTAGONG', label: 'Chittagong Board' },
  { value: 'RAJSHAHI', label: 'Rajshahi Board' },
  { value: 'COMILLA', label: 'Comilla Board' },
  { value: 'JESSORE', label: 'Jessore Board' },
  { value: 'SYLHET', label: 'Sylhet Board' },
  { value: 'BARISAL', label: 'Barisal Board' },
  { value: 'DINAJPUR', label: 'Dinajpur Board' },
  { value: 'MADRASA', label: 'Madrasa Board' },
  { value: 'TECHNICAL', label: 'Technical Board' },
  { value: 'PRIMARY', label: 'DPE (Primary)' },
]

// Bangladesh divisions
export const BD_DIVISIONS = [
  'Dhaka', 'Chattogram', 'Rajshahi', 'Khulna',
  'Barishal', 'Sylhet', 'Rangpur', 'Mymensingh',
]
