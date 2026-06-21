import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { settingsApi } from '@/api/settings'
import type { UpdateSchoolSettingsPayload, UpdateSystemSettingsPayload, ResetCounterPayload, ToggleMaintenancePayload } from '@/api/settings'

// ─── School Settings ────────────────────────────────────────────

export function useSchoolSettings(schoolId: string | null) {
  return useQuery({
    queryKey: ['school-settings', schoolId],
    queryFn: () => settingsApi.getSchool(schoolId!).then((r) => r.data.data),
    enabled: !!schoolId,
  })
}

export function useUpdateSchoolSettings(schoolId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateSchoolSettingsPayload) =>
      settingsApi.updateSchool(schoolId, payload).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['school-settings', schoolId] })
      toast.success('Settings saved')
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? 'Failed to save settings'
      toast.error(msg)
    },
  })
}

export function useSchoolCounters(schoolId: string | null) {
  return useQuery({
    queryKey: ['school-counters', schoolId],
    queryFn: () => settingsApi.getCounters(schoolId!).then((r) => r.data.data),
    enabled: !!schoolId,
  })
}

export function useResetCounter(schoolId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: ResetCounterPayload) =>
      settingsApi.resetCounter(schoolId, payload).then((r) => r.data.data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['school-counters', schoolId] })
      toast.success(`${vars.counterType.replace(/_/g, ' ')} counter reset`)
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Failed to reset counter')
    },
  })
}

// ─── System Settings ────────────────────────────────────────────

export function useSystemSettings() {
  return useQuery({
    queryKey: ['system-settings'],
    queryFn: () => settingsApi.getSystem().then((r) => r.data.data),
  })
}

export function useUpdateSystemSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateSystemSettingsPayload) =>
      settingsApi.updateSystem(payload).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['system-settings'] })
      toast.success('System settings saved')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Failed to save system settings')
    },
  })
}

export function useToggleMaintenance() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: ToggleMaintenancePayload) =>
      settingsApi.toggleMaintenance(payload).then((r) => r.data.data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['system-settings'] })
      toast.success(data.maintenanceMode ? 'Maintenance mode enabled' : 'Maintenance mode disabled')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Failed to toggle maintenance')
    },
  })
}
