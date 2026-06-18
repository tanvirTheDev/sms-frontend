import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import {
  Plus, Loader2, Pencil, Trash2, X, Save,
  Bus, MapPin, Users, ToggleLeft, ToggleRight, Search,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { studentsApi } from '@/api/students'
import { useAcademicYears } from '@/features/academic-setup/hooks'
import {
  useVehicles, useCreateVehicle, useUpdateVehicle, useDeactivateVehicle,
  useTransportRoutes, useCreateTransportRoute, useUpdateTransportRoute, useDeleteTransportRoute,
  useTransportAssignments, useCreateTransportAssignment, useDeleteTransportAssignment,
} from '@/features/transport/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { Vehicle, TransportRoute, CreateVehiclePayload, CreateTransportRoutePayload } from '@/types/transport'

export const Route = createFileRoute('/_authenticated/transport/')({
  component: TransportPage,
})

type Tab = 'vehicles' | 'routes' | 'assignments'

// ── Vehicle Form ───────────────────────────────────────────────

interface VehicleFormProps {
  schoolId: string
  editing: Vehicle | null
  onClose: () => void
}

const emptyVehicle = (): CreateVehiclePayload => ({
  registrationNo: '', type: '', capacity: 0, driverName: '', driverPhone: '', helperName: '', helperPhone: '',
})

function VehicleForm({ schoolId, editing, onClose }: VehicleFormProps) {
  const [form, setForm] = useState<CreateVehiclePayload>(emptyVehicle())
  const { mutate: create, isPending: creating } = useCreateVehicle(schoolId)
  const { mutate: update, isPending: updating } = useUpdateVehicle(schoolId, editing?.id ?? '')

  useEffect(() => {
    if (editing) setForm({
      registrationNo: editing.registrationNo,
      type: editing.type,
      capacity: editing.capacity,
      driverName: editing.driverName,
      driverPhone: editing.driverPhone,
      helperName: editing.helperName ?? '',
      helperPhone: editing.helperPhone ?? '',
    })
  }, [editing])

  const set = (k: keyof CreateVehiclePayload) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: k === 'capacity' ? Number(e.target.value) : e.target.value }))

  const handleSubmit = () => {
    const payload = {
      ...form,
      helperName: form.helperName?.trim() || undefined,
      helperPhone: form.helperPhone?.trim() || undefined,
    }
    if (editing) update(payload, { onSuccess: onClose })
    else create(payload, { onSuccess: onClose })
  }

  const valid = form.registrationNo && form.type && form.capacity > 0 && form.driverName && form.driverPhone

  return (
    <Card className="border-primary/30">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">{editing ? 'Edit' : 'Add'} Vehicle</h3>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}><X className="h-3.5 w-3.5" /></Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-medium">Registration No *</label>
            <Input className="mt-1 h-9" placeholder="e.g. Dhaka-Metro-Ka-11-1234" value={form.registrationNo} onChange={set('registrationNo')} />
          </div>
          <div>
            <label className="text-xs font-medium">Type *</label>
            <Input className="mt-1 h-9" placeholder="Bus / Microbus / Van" value={form.type} onChange={set('type')} />
          </div>
          <div>
            <label className="text-xs font-medium">Capacity *</label>
            <Input className="mt-1 h-9" type="number" min={1} value={form.capacity || ''} onChange={set('capacity')} />
          </div>
          <div>
            <label className="text-xs font-medium">Driver Name *</label>
            <Input className="mt-1 h-9" value={form.driverName} onChange={set('driverName')} />
          </div>
          <div>
            <label className="text-xs font-medium">Driver Phone *</label>
            <Input className="mt-1 h-9" type="tel" value={form.driverPhone} onChange={set('driverPhone')} />
          </div>
          <div>
            <label className="text-xs font-medium">Helper Name</label>
            <Input className="mt-1 h-9" value={form.helperName ?? ''} onChange={set('helperName')} />
          </div>
          <div>
            <label className="text-xs font-medium">Helper Phone</label>
            <Input className="mt-1 h-9" type="tel" value={form.helperPhone ?? ''} onChange={set('helperPhone')} />
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <Button size="sm" disabled={!valid || creating || updating} onClick={handleSubmit}>
            {(creating || updating) ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Save className="h-3.5 w-3.5 mr-1" />}
            {editing ? 'Save' : 'Add'}
          </Button>
          <Button size="sm" variant="outline" onClick={onClose}>Cancel</Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ── Route Form ─────────────────────────────────────────────────

interface RouteFormProps {
  schoolId: string
  editing: TransportRoute | null
  vehicles: Vehicle[]
  onClose: () => void
}

const emptyRoute = (): CreateTransportRoutePayload => ({
  vehicleId: '', name: '', stops: [], fare: 0,
})

function RouteForm({ schoolId, editing, vehicles, onClose }: RouteFormProps) {
  const [form, setForm] = useState<CreateTransportRoutePayload>(emptyRoute())
  const [stopInput, setStopInput] = useState('')
  const { mutate: create, isPending: creating } = useCreateTransportRoute(schoolId)
  const { mutate: update, isPending: updating } = useUpdateTransportRoute(schoolId, editing?.id ?? '')

  useEffect(() => {
    if (editing) setForm({ vehicleId: editing.vehicleId, name: editing.name, stops: [...editing.stops], fare: editing.fare })
  }, [editing])

  const addStop = () => {
    const s = stopInput.trim()
    if (!s || form.stops.includes(s)) return
    setForm((f) => ({ ...f, stops: [...f.stops, s] }))
    setStopInput('')
  }

  const removeStop = (i: number) =>
    setForm((f) => ({ ...f, stops: f.stops.filter((_, idx) => idx !== i) }))

  const handleSubmit = () => {
    if (editing) update(form, { onSuccess: onClose })
    else create(form, { onSuccess: onClose })
  }

  const valid = form.vehicleId && form.name && form.stops.length > 0 && form.fare > 0

  return (
    <Card className="border-primary/30">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">{editing ? 'Edit' : 'New'} Route</h3>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}><X className="h-3.5 w-3.5" /></Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-medium">Vehicle *</label>
            <select className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={form.vehicleId} onChange={(e) => setForm((f) => ({ ...f, vehicleId: e.target.value }))}>
              <option value="">Select vehicle</option>
              {vehicles.filter((v) => v.isActive).map((v) => (
                <option key={v.id} value={v.id}>{v.registrationNo} ({v.type}, {v.capacity} seats)</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium">Route Name *</label>
            <Input className="mt-1 h-9" placeholder="e.g. Mirpur Route" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs font-medium">Fare (৳) *</label>
            <Input className="mt-1 h-9" type="number" min={0} value={form.fare || ''} onChange={(e) => setForm((f) => ({ ...f, fare: parseFloat(e.target.value) || 0 }))} />
          </div>
          <div className="sm:col-span-2 md:col-span-3">
            <label className="text-xs font-medium">Stops *</label>
            <div className="flex gap-2 mt-1">
              <Input className="h-9" placeholder="Add stop name…" value={stopInput}
                onChange={(e) => setStopInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addStop())} />
              <Button type="button" size="sm" variant="outline" onClick={addStop}>Add</Button>
            </div>
            {form.stops.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.stops.map((stop, i) => (
                  <span key={i} className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-full">
                    <MapPin className="h-3 w-3 text-muted-foreground" /> {stop}
                    <button onClick={() => removeStop(i)} className="ml-1 text-muted-foreground hover:text-foreground">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <Button size="sm" disabled={!valid || creating || updating} onClick={handleSubmit}>
            {(creating || updating) ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Save className="h-3.5 w-3.5 mr-1" />}
            {editing ? 'Save' : 'Create'}
          </Button>
          <Button size="sm" variant="outline" onClick={onClose}>Cancel</Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ── Vehicles Tab ───────────────────────────────────────────────

function VehiclesTab({ schoolId, canWrite }: { schoolId: string; canWrite: boolean }) {
  const [search, setSearch] = useState('')
  const [filterActive, setFilterActive] = useState<'' | 'true' | 'false'>('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Vehicle | null>(null)

  const [debouncedSearch, setDebouncedSearch] = useState('')
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350)
    return () => clearTimeout(t)
  }, [search])

  const { data, isLoading } = useVehicles(schoolId || null, {
    search: debouncedSearch || undefined,
    isActive: filterActive === '' ? undefined : filterActive === 'true',
    limit: 50,
  })
  const vehicles = data?.data ?? []

  const { mutate: deactivate } = useDeactivateVehicle(schoolId)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2 items-center">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9 h-9 w-44" placeholder="Search vehicles…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            value={filterActive} onChange={(e) => setFilterActive(e.target.value as any)}>
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
        {canWrite && !showForm && (
          <Button size="sm" onClick={() => { setEditing(null); setShowForm(true) }}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Vehicle
          </Button>
        )}
      </div>

      {showForm && (
        <VehicleForm schoolId={schoolId} editing={editing} onClose={() => { setShowForm(false); setEditing(null) }} />
      )}

      {isLoading && <div className="flex items-center gap-2 text-sm text-muted-foreground py-8"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>}
      {!isLoading && vehicles.length === 0 && <div className="text-center py-16 text-muted-foreground text-sm">No vehicles found.</div>}

      {vehicles.length > 0 && (
        <div className="rounded-md border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {['Registration', 'Type', 'Capacity', 'Driver', 'Phone', 'Helper', 'Status', ''].map((h) => (
                  <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v.id} className={cn('border-t hover:bg-muted/30', !v.isActive && 'opacity-60')}>
                  <td className="px-3 py-2 font-medium">{v.registrationNo}</td>
                  <td className="px-3 py-2">
                    <span className="flex items-center gap-1"><Bus className="h-3.5 w-3.5 text-muted-foreground" /> {v.type}</span>
                  </td>
                  <td className="px-3 py-2">{v.capacity}</td>
                  <td className="px-3 py-2">{v.driverName}</td>
                  <td className="px-3 py-2 text-muted-foreground">{v.driverPhone}</td>
                  <td className="px-3 py-2 text-muted-foreground text-xs">{v.helperName ?? '—'}</td>
                  <td className="px-3 py-2">
                    {v.isActive
                      ? <Badge variant="outline" className="text-green-600 border-green-300 text-[10px]">Active</Badge>
                      : <Badge variant="outline" className="text-muted-foreground text-[10px]">Inactive</Badge>
                    }
                  </td>
                  <td className="px-3 py-2">
                    {canWrite && (
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7"
                          onClick={() => { setEditing(v); setShowForm(true) }}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        {v.isActive && (
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-amber-600"
                            title="Deactivate"
                            onClick={() => { if (confirm('Deactivate this vehicle?')) deactivate(v.id) }}>
                            <ToggleLeft className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── Routes Tab ─────────────────────────────────────────────────

function RoutesTab({ schoolId, canWrite }: { schoolId: string; canWrite: boolean }) {
  const [search, setSearch] = useState('')
  const [filterActive, setFilterActive] = useState<'' | 'true' | 'false'>('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<TransportRoute | null>(null)

  const [debouncedSearch, setDebouncedSearch] = useState('')
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350)
    return () => clearTimeout(t)
  }, [search])

  const { data: routeData, isLoading } = useTransportRoutes(schoolId || null, {
    search: debouncedSearch || undefined,
    isActive: filterActive === '' ? undefined : filterActive === 'true',
    limit: 50,
  })
  const routes = routeData?.data ?? []

  const { data: vehicleData } = useVehicles(schoolId || null, { limit: 100 })
  const vehicles = vehicleData?.data ?? []

  const { mutate: deleteRoute } = useDeleteTransportRoute(schoolId)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9 h-9 w-44" placeholder="Search routes…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            value={filterActive} onChange={(e) => setFilterActive(e.target.value as any)}>
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
        {canWrite && !showForm && (
          <Button size="sm" onClick={() => { setEditing(null); setShowForm(true) }}>
            <Plus className="h-3.5 w-3.5 mr-1" /> New Route
          </Button>
        )}
      </div>

      {showForm && (
        <RouteForm schoolId={schoolId} editing={editing} vehicles={vehicles} onClose={() => { setShowForm(false); setEditing(null) }} />
      )}

      {isLoading && <div className="flex items-center gap-2 text-sm text-muted-foreground py-8"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>}
      {!isLoading && routes.length === 0 && <div className="text-center py-16 text-muted-foreground text-sm">No routes found.</div>}

      {routes.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {routes.map((r) => (
            <Card key={r.id} className={cn('hover:shadow-sm transition-shadow', !r.isActive && 'opacity-60')}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm">{r.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {r.vehicle?.registrationNo} · {r.vehicle?.type}
                    </p>
                  </div>
                  <div className="shrink-0">
                    {r.isActive
                      ? <Badge variant="outline" className="text-green-600 border-green-300 text-[10px]">Active</Badge>
                      : <Badge variant="outline" className="text-[10px] text-muted-foreground">Inactive</Badge>
                    }
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 font-medium text-foreground">৳{r.fare.toLocaleString()}/mo</span>
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {r._count?.assignments ?? 0} students</span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {r.stops.map((stop, i) => (
                    <span key={i} className="text-[10px] bg-muted px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      <MapPin className="h-2.5 w-2.5 text-muted-foreground" /> {stop}
                    </span>
                  ))}
                </div>

                {canWrite && (
                  <div className="flex gap-1 pt-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing(r); setShowForm(true) }}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => { if (confirm('Delete this route? Cannot delete if students are assigned.')) deleteRoute(r.id) }}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Assignments Tab ────────────────────────────────────────────

function AssignmentsTab({ schoolId, canWrite }: { schoolId: string; canWrite: boolean }) {
  const [filterRouteId, setFilterRouteId] = useState('')
  const [filterYearId, setFilterYearId] = useState('')
  const [showForm, setShowForm] = useState(false)

  // Assignment form state
  const [studentSearch, setStudentSearch] = useState('')
  const [studentSuggestions, setStudentSuggestions] = useState<{ id: string; name: string; studentId: string }[]>([])
  const [showStudentDrop, setShowStudentDrop] = useState(false)
  const [studentSearching, setStudentSearching] = useState(false)
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [selectedRouteId, setSelectedRouteId] = useState('')
  const [selectedYearId, setSelectedYearId] = useState('')
  const [selectedStop, setSelectedStop] = useState('')

  const { data: routeData } = useTransportRoutes(schoolId || null, { limit: 100, isActive: true })
  const routes = routeData?.data ?? []

  const { data: years = [] } = useAcademicYears(schoolId)

  const { data: assignmentData, isLoading } = useTransportAssignments(schoolId || null, {
    routeId: filterRouteId || undefined,
    academicYearId: filterYearId || undefined,
    limit: 100,
  })
  const assignments = assignmentData?.data ?? []

  const { mutate: createAssignment, isPending: assigning } = useCreateTransportAssignment(schoolId)
  const { mutate: deleteAssignment } = useDeleteTransportAssignment(schoolId)

  const selectedRoute = routes.find((r) => r.id === selectedRouteId)

  useEffect(() => {
    if (!studentSearch.trim() || studentSearch.length < 2) { setStudentSuggestions([]); setShowStudentDrop(false); return }
    const t = setTimeout(async () => {
      setStudentSearching(true)
      try {
        const r = await studentsApi.list(schoolId, { search: studentSearch.trim(), limit: 8, isActive: true })
        setStudentSuggestions(r.data.data ?? [])
        setShowStudentDrop(true)
      } catch { } finally { setStudentSearching(false) }
    }, 350)
    return () => clearTimeout(t)
  }, [studentSearch, schoolId])

  const handleAssign = () => {
    if (!selectedStudentId || !selectedRouteId || !selectedYearId || !selectedStop) return
    createAssignment(
      { studentId: selectedStudentId, routeId: selectedRouteId, academicYearId: selectedYearId, stopName: selectedStop },
      {
        onSuccess: () => {
          setShowForm(false)
          setStudentSearch(''); setSelectedStudentId(''); setSelectedRouteId(''); setSelectedYearId(''); setSelectedStop('')
        },
      }
    )
  }

  const canAssign = selectedStudentId && selectedRouteId && selectedYearId && selectedStop

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2">
          <select className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            value={filterRouteId} onChange={(e) => setFilterRouteId(e.target.value)}>
            <option value="">All Routes</option>
            {routes.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          <select className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            value={filterYearId} onChange={(e) => setFilterYearId(e.target.value)}>
            <option value="">All Years</option>
            {(years as any[]).map((y) => <option key={y.id} value={y.id}>{y.name}</option>)}
          </select>
        </div>
        {canWrite && !showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Assign Student
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="border-primary/30">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Assign Student to Route</h3>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowForm(false)}><X className="h-3.5 w-3.5" /></Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Student search */}
              <div className="relative">
                <label className="text-xs font-medium">Student *</label>
                <div className="relative mt-1">
                  <Input className="h-9 pr-8" placeholder="Search student…" value={studentSearch}
                    onChange={(e) => { setStudentSearch(e.target.value); setSelectedStudentId('') }} />
                  {studentSearching && <Loader2 className="absolute right-2 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />}
                </div>
                {showStudentDrop && studentSuggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-0.5 bg-popover border rounded-md shadow-md max-h-40 overflow-y-auto">
                    {studentSuggestions.map((s) => (
                      <button key={s.id} className="w-full text-left px-3 py-2 hover:bg-muted text-sm border-b last:border-0"
                        onClick={() => { setSelectedStudentId(s.id); setStudentSearch(s.name); setShowStudentDrop(false) }}>
                        <p className="font-medium">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.studentId}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-medium">Route *</label>
                <select className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  value={selectedRouteId} onChange={(e) => { setSelectedRouteId(e.target.value); setSelectedStop('') }}>
                  <option value="">Select route</option>
                  {routes.map((r) => <option key={r.id} value={r.id}>{r.name} (৳{r.fare})</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium">Academic Year *</label>
                <select className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  value={selectedYearId} onChange={(e) => setSelectedYearId(e.target.value)}>
                  <option value="">Select year</option>
                  {(years as any[]).map((y) => <option key={y.id} value={y.id}>{y.name}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium">Boarding Stop *</label>
                <select className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  value={selectedStop} onChange={(e) => setSelectedStop(e.target.value)} disabled={!selectedRoute}>
                  <option value="">Select stop</option>
                  {selectedRoute?.stops.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button size="sm" disabled={!canAssign || assigning} onClick={handleAssign}>
                {assigning ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Save className="h-3.5 w-3.5 mr-1" />}
                Assign
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading && <div className="flex items-center gap-2 text-sm text-muted-foreground py-8"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>}
      {!isLoading && assignments.length === 0 && <div className="text-center py-16 text-muted-foreground text-sm">No assignments found.</div>}

      {assignments.length > 0 && (
        <div className="rounded-md border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {['Student', 'Student ID', 'Route', 'Stop', 'Fare', 'Assigned', ''].map((h) => (
                  <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {assignments.map((a) => (
                <tr key={a.id} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2 font-medium">{a.student?.name}</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{a.student?.studentId}</td>
                  <td className="px-3 py-2">{a.route?.name}</td>
                  <td className="px-3 py-2">
                    <span className="flex items-center gap-1 text-xs"><MapPin className="h-3 w-3 text-muted-foreground" /> {a.stopName}</span>
                  </td>
                  <td className="px-3 py-2 font-medium">৳{(a.route?.fare ?? 0).toLocaleString()}</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{format(new Date(a.createdAt), 'dd/MM/yyyy')}</td>
                  <td className="px-3 py-2">
                    {canWrite && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => { if (confirm('Remove this transport assignment?')) deleteAssignment(a.id) }}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────

function TransportPage() {
  const { user } = useAuthStore()
  const schoolId = user?.schoolId ?? ''
  const role = user?.role ?? ''
  const canWrite = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'OFFICE_STAFF'].includes(role)

  const [tab, setTab] = useState<Tab>('vehicles')

  if (!schoolId) return <div className="text-center py-16 text-muted-foreground text-sm">No school assigned.</div>

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'vehicles', label: 'Vehicles', icon: Bus },
    { key: 'routes', label: 'Routes', icon: MapPin },
    { key: 'assignments', label: 'Assignments', icon: Users },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Transport</h1>
        <p className="text-sm text-muted-foreground">Manage vehicles, routes, and student transport assignments.</p>
      </div>

      <div className="flex gap-1 border-b">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
              tab === key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            )}>
            <Icon className="h-3.5 w-3.5" /> {label}
          </button>
        ))}
      </div>

      {tab === 'vehicles' && <VehiclesTab schoolId={schoolId} canWrite={canWrite} />}
      {tab === 'routes' && <RoutesTab schoolId={schoolId} canWrite={canWrite} />}
      {tab === 'assignments' && <AssignmentsTab schoolId={schoolId} canWrite={canWrite} />}
    </div>
  )
}
