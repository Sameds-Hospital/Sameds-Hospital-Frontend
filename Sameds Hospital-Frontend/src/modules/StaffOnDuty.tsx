import { useState, type ChangeEvent } from 'react'
import {
  ShieldCheck, Edit3, Save, X, Plus, Trash2,
  Phone, Clock, Building2, User2, AlertCircle, CheckCircle2,
} from 'lucide-react'
import { useHMS } from '../store/HMSContext'
import { PageHeader } from '../components/ui/PageHeader'
import { SectionCard } from '../components/ui/SectionCard'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { FormField } from '../components/ui/FormField'

// ── Types ────────────────────────────────────────────────────────────────────
export interface DutyEntry {
  id: string
  staffId: string
  staffName: string
  role: string
  department: string
  phone: string
  shift: 'Morning' | 'Afternoon' | 'Night' | 'On-Call'
  shiftStart: string   // HH:mm
  shiftEnd: string     // HH:mm
  location: string     // e.g. "Ward A", "OPD Block", "Emergency Bay"
  status: 'On Duty' | 'On Break' | 'Off Duty' | 'On-Call'
  date: string         // YYYY-MM-DD
  notes: string
}

const SHIFT_COLORS: Record<DutyEntry['shift'], string> = {
  Morning: 'blue',
  Afternoon: 'yellow',
  Night: 'purple',
  'On-Call': 'orange',
}

const STATUS_COLORS: Record<DutyEntry['status'], string> = {
  'On Duty': 'green',
  'On Break': 'yellow',
  'Off Duty': 'gray',
  'On-Call': 'orange',
}

const STORAGE_KEY = 'hms-duty-roster-v1'
const today = () => new Date().toISOString().slice(0, 10)

function loadDuty(): DutyEntry[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as DutyEntry[] }
  catch { return [] }
}

function saveDuty(entries: DutyEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

const EMPTY_ENTRY: Omit<DutyEntry, 'id'> = {
  staffId: '', staffName: '', role: '', department: '',
  phone: '', shift: 'Morning', shiftStart: '07:00', shiftEnd: '15:00',
  location: '', status: 'On Duty', date: today(), notes: '',
}

const SHIFT_PRESETS: Record<DutyEntry['shift'], { start: string; end: string }> = {
  Morning:   { start: '07:00', end: '15:00' },
  Afternoon: { start: '15:00', end: '23:00' },
  Night:     { start: '23:00', end: '07:00' },
  'On-Call': { start: '00:00', end: '23:59' },
}

// ── Component ─────────────────────────────────────────────────────────────────
export function StaffOnDuty() {
  const { currentUser, state } = useHMS()
  const isAdmin = currentUser?.role === 'Admin'

  const [entries, setEntries] = useState<DutyEntry[]>(loadDuty)
  const [viewDate, setViewDate] = useState(today())
  const [filterDept, setFilterDept] = useState('All')
  const [filterShift, setFilterShift] = useState<'All' | DutyEntry['shift']>('All')
  const [showForm, setShowForm] = useState(false)
  const [editEntry, setEditEntry] = useState<DutyEntry | null>(null)
  const [form, setForm] = useState<Omit<DutyEntry, 'id'>>({ ...EMPTY_ENTRY })
  const [saveMsg, setSaveMsg] = useState('')

  const persist = (updated: DutyEntry[]) => {
    setEntries(updated)
    saveDuty(updated)
  }

  const set = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(f => {
      const updated = { ...f, [name]: value }
      // Auto-fill shift times when shift changes
      if (name === 'shift') {
        const preset = SHIFT_PRESETS[value as DutyEntry['shift']]
        updated.shiftStart = preset.start
        updated.shiftEnd = preset.end
      }
      return updated
    })
  }

  // Auto-fill staff details when staff is selected
  const handleStaffSelect = (e: ChangeEvent<HTMLSelectElement>) => {
    const staffId = e.target.value
    const staff = state.staff.find(s => s.id === staffId)
    const doctor = state.doctors.find(d => d.staffId === staffId || d.name === staff?.name)
    setForm(f => ({
      ...f,
      staffId,
      staffName: staff?.name ?? '',
      role: staff?.role ?? '',
      department: staff?.department ?? '',
      phone: doctor?.phone ?? staff?.phone ?? '',
    }))
  }

  const openAdd = () => {
    setEditEntry(null)
    setForm({ ...EMPTY_ENTRY, date: viewDate })
    setShowForm(true)
  }

  const openEdit = (entry: DutyEntry) => {
    setEditEntry(entry)
    setForm({ ...entry })
    setShowForm(true)
  }

  const handleSave = () => {
    if (!form.staffName.trim()) return
    if (editEntry) {
      persist(entries.map(e => e.id === editEntry.id ? { ...form, id: editEntry.id } : e))
    } else {
      persist([...entries, { ...form, id: `DT-${Date.now()}` }])
    }
    setShowForm(false)
    setSaveMsg('Duty roster updated.')
    setTimeout(() => setSaveMsg(''), 3000)
  }

  const handleDelete = (id: string) => {
    if (!confirm('Remove this duty entry?')) return
    persist(entries.filter(e => e.id !== id))
  }

  const updateStatus = (id: string, status: DutyEntry['status']) => {
    persist(entries.map(e => e.id === id ? { ...e, status } : e))
  }

  // Filtered view
  const departments = ['All', ...Array.from(new Set(entries.map(e => e.department))).sort()]
  const todayEntries = entries.filter(e => e.date === viewDate)
  const filtered = todayEntries
    .filter(e => filterDept === 'All' || e.department === filterDept)
    .filter(e => filterShift === 'All' || e.shift === filterShift)

  // Group by department
  const grouped = filtered.reduce<Record<string, DutyEntry[]>>((acc, e) => {
    const dept = e.department || 'Unassigned'
    acc[dept] = [...(acc[dept] ?? []), e]
    return acc
  }, {})

  const onDutyCount  = filtered.filter(e => e.status === 'On Duty').length
  const onCallCount  = filtered.filter(e => e.status === 'On-Call').length
  const onBreakCount = filtered.filter(e => e.status === 'On Break').length
  const offCount     = filtered.filter(e => e.status === 'Off Duty').length

  return (
    <div className="module-page">
      <PageHeader
        title="Staff on Duty"
        subtitle={`Live duty roster · ${viewDate} · ${filtered.length} staff scheduled`}
        icon={<ShieldCheck size={22} />}
        actions={
          isAdmin ? (
            <button type="button" className="btn btn--primary" onClick={openAdd}>
              <Plus size={15} /> Add to Roster
            </button>
          ) : (
            <span className="duty-readonly-badge">
              <AlertCircle size={13} /> View Only
            </span>
          )
        }
      />

      {/* Admin notice vs view-only notice */}
      {!isAdmin && (
        <div className="duty-info-bar">
          <AlertCircle size={14} />
          <span>You are viewing the current duty roster. Only Admin can make changes.</span>
        </div>
      )}

      {saveMsg && (
        <div className="duty-save-msg"><CheckCircle2 size={14} /> {saveMsg}</div>
      )}

      {/* Controls */}
      <div className="duty-controls">
        <div className="duty-date-picker">
          <Clock size={14} />
          <label htmlFor="duty-date" className="form-label" style={{ margin: 0 }}>Date:</label>
          <input
            id="duty-date"
            type="date"
            className="form-control"
            style={{ width: 160 }}
            value={viewDate}
            onChange={e => setViewDate(e.target.value)}
          />
        </div>
        <div className="duty-filters">
          <select className="form-control" style={{ width: 180 }} value={filterDept} onChange={e => setFilterDept(e.target.value)}>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select className="form-control" style={{ width: 140 }} value={filterShift} onChange={e => setFilterShift(e.target.value as typeof filterShift)}>
            <option value="All">All Shifts</option>
            {(['Morning', 'Afternoon', 'Night', 'On-Call'] as DutyEntry['shift'][]).map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary strip */}
      <div className="duty-summary-strip">
        <div className="duty-summary-item duty-summary-item--green">
          <strong>{onDutyCount}</strong><span>On Duty</span>
        </div>
        <div className="duty-summary-item duty-summary-item--orange">
          <strong>{onCallCount}</strong><span>On-Call</span>
        </div>
        <div className="duty-summary-item duty-summary-item--yellow">
          <strong>{onBreakCount}</strong><span>On Break</span>
        </div>
        <div className="duty-summary-item duty-summary-item--gray">
          <strong>{offCount}</strong><span>Off Duty</span>
        </div>
        <div className="duty-summary-item">
          <strong>{filtered.length}</strong><span>Total</span>
        </div>
      </div>

      {/* No entries state */}
      {filtered.length === 0 && (
        <SectionCard>
          <div className="empty-hint" style={{ padding: '32px 0' }}>
            {isAdmin
              ? <>No staff scheduled for {viewDate}. Click <strong>Add to Roster</strong> to begin.</>
              : <>No staff scheduled for {viewDate}.</>}
          </div>
        </SectionCard>
      )}

      {/* Grouped duty cards */}
      {Object.entries(grouped).map(([dept, deptEntries]) => (
        <SectionCard
          key={dept}
          title={`${dept}  ·  ${deptEntries.length} staff`}
        >
          <div className="duty-card-grid">
            {deptEntries.map(entry => (
              <div key={entry.id} className={`duty-card duty-card--${STATUS_COLORS[entry.status]}`}>
                {/* Header */}
                <div className="duty-card__header">
                  <div className="duty-card__avatar">
                    {entry.staffName.split(' ').map(w => w[0]).slice(0, 2).join('')}
                  </div>
                  <div className="duty-card__identity">
                    <strong>{entry.staffName}</strong>
                    <span>{entry.role}</span>
                  </div>
                  <Badge variant={STATUS_COLORS[entry.status] as Parameters<typeof Badge>[0]['variant']}>
                    {entry.status}
                  </Badge>
                </div>

                {/* Details */}
                <div className="duty-card__body">
                  <div className="duty-card__row">
                    <Clock size={12} />
                    <Badge variant={SHIFT_COLORS[entry.shift] as Parameters<typeof Badge>[0]['variant']}>
                      {entry.shift}
                    </Badge>
                    <span>{entry.shiftStart} – {entry.shiftEnd}</span>
                  </div>
                  <div className="duty-card__row">
                    <Building2 size={12} />
                    <span>{entry.location || entry.department}</span>
                  </div>
                  {entry.phone && (
                    <div className="duty-card__row">
                      <Phone size={12} />
                      <a href={`tel:${entry.phone}`} className="duty-phone">{entry.phone}</a>
                    </div>
                  )}
                  {entry.notes && (
                    <p className="duty-card__notes">{entry.notes}</p>
                  )}
                </div>

                {/* Actions — Admin only for edit/delete, all staff can see status */}
                {isAdmin && (
                  <div className="duty-card__actions">
                    <select
                      className="duty-status-select"
                      value={entry.status}
                      onChange={e => updateStatus(entry.id, e.target.value as DutyEntry['status'])}
                      title="Update status"
                    >
                      <option>On Duty</option>
                      <option>On Break</option>
                      <option>Off Duty</option>
                      <option>On-Call</option>
                    </select>
                    <button type="button" className="icon-btn" title="Edit" onClick={() => openEdit(entry)}>
                      <Edit3 size={13} />
                    </button>
                    <button type="button" className="icon-btn icon-btn--red" title="Remove" onClick={() => handleDelete(entry.id)}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </SectionCard>
      ))}

      {/* Quick reference table */}
      {filtered.length > 0 && (
        <SectionCard title="Quick Reference Table">
          <div className="duty-table-wrap">
            <table className="duty-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Shift</th>
                  <th>Hours</th>
                  <th>Location</th>
                  <th>Contact</th>
                  <th>Status</th>
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map(e => (
                  <tr key={e.id}>
                    <td><strong>{e.staffName}</strong></td>
                    <td>{e.role}</td>
                    <td>{e.department}</td>
                    <td><Badge variant={SHIFT_COLORS[e.shift] as Parameters<typeof Badge>[0]['variant']}>{e.shift}</Badge></td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{e.shiftStart}–{e.shiftEnd}</td>
                    <td>{e.location || '—'}</td>
                    <td>
                      {e.phone
                        ? <a href={`tel:${e.phone}`} className="duty-phone">{e.phone}</a>
                        : '—'}
                    </td>
                    <td><Badge variant={STATUS_COLORS[e.status] as Parameters<typeof Badge>[0]['variant']}>{e.status}</Badge></td>
                    {isAdmin && (
                      <td>
                        <div className="row-actions">
                          <button type="button" className="icon-btn" onClick={() => openEdit(e)} title="Edit"><Edit3 size={13} /></button>
                          <button type="button" className="icon-btn icon-btn--red" onClick={() => handleDelete(e.id)} title="Remove"><Trash2 size={13} /></button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}

      {/* Add / Edit Modal — Admin only */}
      {showForm && isAdmin && (
        <Modal
          title={editEntry ? `Edit: ${editEntry.staffName}` : 'Add Staff to Duty Roster'}
          onClose={() => setShowForm(false)}
          size="md"
        >
          <div className="form-grid-2">
            {/* Staff picker */}
            <div className="form-field form-field--full">
              <label className="form-label"><User2 size={12} /> Select Staff</label>
              <select
                className="form-control"
                value={form.staffId}
                onChange={handleStaffSelect}
              >
                <option value="">— pick from staff list —</option>
                {state.staff
                  .filter(s => s.status === 'Active')
                  .map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} · {s.role} · {s.department}
                    </option>
                  ))}
              </select>
            </div>

            <FormField label="Staff Name" name="staffName" value={form.staffName} onChange={set} required placeholder="or type manually" />
            <FormField label="Role" name="role" value={form.role} onChange={set} placeholder="Doctor / Nurse / etc." />
            <FormField label="Department" name="department" value={form.department} onChange={set} required />
            <FormField label="Phone" name="phone" type="tel" value={form.phone} onChange={set} placeholder="+233 XX XXX XXXX" />

            <div className="form-field">
              <label className="form-label">Shift</label>
              <select className="form-control" name="shift" value={form.shift} onChange={set}>
                <option>Morning</option>
                <option>Afternoon</option>
                <option>Night</option>
                <option>On-Call</option>
              </select>
            </div>

            <div className="form-field">
              <label className="form-label">Status</label>
              <select className="form-control" name="status" value={form.status} onChange={set}>
                <option>On Duty</option>
                <option>On Break</option>
                <option>Off Duty</option>
                <option>On-Call</option>
              </select>
            </div>

            <FormField label="Shift Start" name="shiftStart" type="time" value={form.shiftStart} onChange={set} />
            <FormField label="Shift End" name="shiftEnd" type="time" value={form.shiftEnd} onChange={set} />

            <FormField label="Location / Station" name="location" value={form.location} onChange={set} placeholder="e.g. Ward A, OPD, Emergency Bay" />
            <FormField label="Date" name="date" type="date" value={form.date} onChange={set} required />

            <div className="form-field form-field--full">
              <label className="form-label">Notes (optional)</label>
              <textarea className="form-control" name="notes" value={form.notes} onChange={set} rows={2} placeholder="Any special duties, cover responsibilities…" />
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn--ghost" onClick={() => setShowForm(false)}>
                <X size={14} /> Cancel
              </button>
              <button type="button" className="btn btn--primary" onClick={handleSave} disabled={!form.staffName.trim()}>
                <Save size={14} /> {editEntry ? 'Save Changes' : 'Add to Roster'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
