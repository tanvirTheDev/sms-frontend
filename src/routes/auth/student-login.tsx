import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { Search, X, Loader2, GraduationCap, Building2, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useStudentLogin } from '@/features/auth/hooks'
import { schoolsApi } from '@/api/schools'
import type { SchoolSearchResult } from '@/api/schools'

export const Route = createFileRoute('/auth/student-login')({
  component: StudentLoginPage,
})

function SchoolPicker({
  selected,
  onSelect,
  onClear,
}: {
  selected: SchoolSearchResult | null
  onSelect: (s: SchoolSearchResult) => void
  onClear: () => void
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SchoolSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      setOpen(false)
      return
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await schoolsApi.search(query)
        setResults(res.data.data ?? [])
        setOpen(true)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 400)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  if (selected) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-md border bg-muted/40">
        <Building2 className="h-4 w-4 text-primary shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{selected.name}</p>
          {selected.district && (
            <p className="text-xs text-muted-foreground">{selected.district}</p>
          )}
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={onClear}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search your school name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          className="pl-9"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-50 top-full mt-1 w-full rounded-md border bg-popover shadow-md max-h-60 overflow-y-auto">
          {results.map((s) => (
            <button
              key={s.id}
              type="button"
              className="w-full flex items-start gap-3 px-3 py-2.5 text-left hover:bg-muted transition-colors"
              onClick={() => {
                onSelect(s)
                setQuery('')
                setOpen(false)
              }}
            >
              <Building2 className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{s.name}</p>
                {(s.district || s.upazila) && (
                  <p className="text-xs text-muted-foreground">
                    {[s.upazila, s.district].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {open && !loading && results.length === 0 && query.length >= 2 && (
        <div className="absolute z-50 top-full mt-1 w-full rounded-md border bg-popover shadow-md px-3 py-3 text-sm text-muted-foreground">
          No schools found for &quot;{query}&quot;
        </div>
      )}
    </div>
  )
}

function StudentLoginPage() {
  const login = useStudentLogin()
  const [selectedSchool, setSelectedSchool] = useState<SchoolSearchResult | null>(null)
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const canSubmit = !!selectedSchool && loginId.trim().length > 0 && password.length > 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSchool) return
    login.mutate({ loginId: loginId.trim(), schoolId: selectedSchool.id, password })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-primary" />
          <CardTitle>Student Login</CardTitle>
        </div>
        <CardDescription>Login with your school-issued student ID and password</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Your School *</label>
            <SchoolPicker
              selected={selectedSchool}
              onSelect={setSelectedSchool}
              onClear={() => setSelectedSchool(null)}
            />
          </div>

          {selectedSchool && (
            <>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Student ID *</label>
                <Input
                  placeholder="e.g. STU-MQJ1P8VU"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  Your student ID as shown on your ID card or admit card
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Password *</label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </>
          )}

          {!selectedSchool && (
            <div className="rounded-md bg-muted/40 border border-dashed p-4 text-center text-sm text-muted-foreground">
              Search and select your school first
            </div>
          )}
        </CardContent>

        <CardFooter className="flex-col gap-3 pt-2">
          <Button type="submit" className="w-full" disabled={!canSubmit || login.isPending}>
            {login.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign in as Student
          </Button>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="text-[10px]">Staff / Admin?</Badge>
            <Link to="/auth/login" className="text-primary hover:underline">
              Use staff login
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
