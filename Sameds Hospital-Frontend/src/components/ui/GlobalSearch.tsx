import { useState, useEffect, useRef, type KeyboardEvent } from 'react'
import { Search, Users, CalendarDays, FileText, CreditCard, FlaskConical, User2, X } from 'lucide-react'
import { useHMS } from '../../store/HMSContext'
import type { ModuleKey } from '../../types'

interface SearchResult {
  id: string
  label: string
  sub: string
  module: ModuleKey
  icon: React.ReactNode
}

export function GlobalSearch() {
  const { state, setActiveModule } = useHMS()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Ctrl+K / Cmd+K to open
  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(o => !o)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  const q = query.toLowerCase()

  const results: SearchResult[] = q.length < 2 ? [] : [
    ...state.patients
      .filter(p => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.barcode?.toLowerCase().includes(q) || p.phone?.includes(q))
      .slice(0, 5)
      .map(p => ({ id: p.id, label: p.name, sub: `Patient · ${p.id} · ${p.phone}`, module: 'patients' as ModuleKey, icon: <Users size={14} /> })),

    ...state.appointments
      .filter(a => a.patientName.toLowerCase().includes(q) || a.id.toLowerCase().includes(q) || a.doctorName.toLowerCase().includes(q))
      .slice(0, 4)
      .map(a => ({ id: a.id, label: `${a.patientName} → Dr. ${a.doctorName}`, sub: `Appointment · ${a.date} ${a.time} · ${a.status}`, module: 'appointments' as ModuleKey, icon: <CalendarDays size={14} /> })),

    ...state.invoices
      .filter(i => i.id.toLowerCase().includes(q) || i.patientName.toLowerCase().includes(q))
      .slice(0, 4)
      .map(i => ({ id: i.id, label: `Invoice ${i.id} – ${i.patientName}`, sub: `Billing · ₵${i.total} · ${i.status}`, module: 'billing' as ModuleKey, icon: <CreditCard size={14} /> })),

    ...state.medicalRecords
      .filter(r => r.patientName.toLowerCase().includes(q) || r.diagnosis.toLowerCase().includes(q))
      .slice(0, 3)
      .map(r => ({ id: r.id, label: r.patientName, sub: `EMR · ${r.diagnosis} · ${new Date(r.createdAt).toLocaleDateString()}`, module: 'emr' as ModuleKey, icon: <FileText size={14} /> })),

    ...state.labTests
      .filter(t => t.patientName.toLowerCase().includes(q) || t.testName.toLowerCase().includes(q))
      .slice(0, 3)
      .map(t => ({ id: t.id, label: `${t.testName} – ${t.patientName}`, sub: `Lab · ${t.status} · ${t.priority}`, module: 'laboratory' as ModuleKey, icon: <FlaskConical size={14} /> })),

    ...state.staff
      .filter(s => s.name.toLowerCase().includes(q) || s.department.toLowerCase().includes(q))
      .slice(0, 3)
      .map(s => ({ id: s.id, label: s.name, sub: `Staff · ${s.role} · ${s.department}`, module: 'staff' as ModuleKey, icon: <User2 size={14} /> })),
  ]

  const pick = (r: SearchResult) => {
    setActiveModule(r.module)
    setOpen(false)
    setQuery('')
  }

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, results.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)) }
    if (e.key === 'Enter' && results[selected]) pick(results[selected])
  }

  return (
    <>
      {/* Trigger button in Topbar */}
      <button type="button" className="global-search-trigger" onClick={() => setOpen(true)} aria-label="Global search (Ctrl+K)">
        <Search size={15} />
        <span>Search…</span>
        <kbd>Ctrl K</kbd>
      </button>

      {/* Overlay */}
      {open && (
        <div className="gs-overlay" onClick={() => setOpen(false)}>
          <div className="gs-panel" onClick={e => e.stopPropagation()}>
            <div className="gs-input-row">
              <Search size={16} className="gs-icon" />
              <input
                ref={inputRef}
                className="gs-input"
                placeholder="Search patients, appointments, invoices, labs, staff…"
                value={query}
                onChange={e => { setQuery(e.target.value); setSelected(0) }}
                onKeyDown={onKey}
                aria-label="Global search"
              />
              <button type="button" className="gs-close" onClick={() => setOpen(false)}><X size={15} /></button>
            </div>

            {query.length > 0 && query.length < 2 && (
              <p className="gs-hint">Type at least 2 characters…</p>
            )}

            {results.length > 0 && (
              <ul className="gs-results" role="listbox">
                {results.map((r, i) => (
                  <li
                    key={r.id + i}
                    role="option"
                    aria-selected={i === selected}
                    className={`gs-result${i === selected ? ' gs-result--active' : ''}`}
                    onMouseEnter={() => setSelected(i)}
                    onClick={() => pick(r)}
                  >
                    <span className="gs-result__icon">{r.icon}</span>
                    <div className="gs-result__body">
                      <span className="gs-result__label">{r.label}</span>
                      <span className="gs-result__sub">{r.sub}</span>
                    </div>
                    <span className="gs-result__go">↵</span>
                  </li>
                ))}
              </ul>
            )}

            {query.length >= 2 && results.length === 0 && (
              <p className="gs-hint">No results for "<strong>{query}</strong>"</p>
            )}

            <div className="gs-footer">
              <span><kbd>↑↓</kbd> navigate</span>
              <span><kbd>↵</kbd> open</span>
              <span><kbd>Esc</kbd> close</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
