import { useState, type FormEvent, type ChangeEvent } from 'react'
import { Stethoscope, UserPlus, CalendarDays } from 'lucide-react'
import { useHMS } from '../store/HMSContext'
import { DataTable, type Column } from '../components/ui/DataTable'
import { Modal } from '../components/ui/Modal'
import { FormField } from '../components/ui/FormField'
import { Badge, statusVariant } from '../components/ui/Badge'
import { PageHeader } from '../components/ui/PageHeader'
import { SectionCard } from '../components/ui/SectionCard'
import type { Doctor } from '../types'

type DoctorTab = 'directory' | 'roster'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const SHIFTS = ['Morning (6am–2pm)', 'Afternoon (2pm–10pm)', 'Night (10pm–6am)', 'Off']

const EMPTY: Omit<Doctor, 'id' | 'staffId'> = {
  name: '', specialty: '', department: '', license: '',
  phone: '', email: '', qualification: '', experience: 0,
  status: 'Active', consultationFee: 80,
}

export function Doctors() {
  const { state, dispatch, nextId } = useHMS()
  const [docTab, setDocTab] = useState<DoctorTab>('directory')
  const [roster, setRoster] = useState<Record<string, Record<string, string>>>({})

  const getRosterShift = (docId: string, day: string) => roster[docId]?.[day] ?? 'Off'
  const setRosterShift = (docId: string, day: string, shift: string) =>
    setRoster(r => ({ ...r, [docId]: { ...(r[docId] ?? {}), [day]: shift } }))
  const [showForm, setShowForm] = useState(false)
  const [viewDoctor, setViewDoctor] = useState<Doctor | null>(null)

  const [form, setForm] = useState({ ...EMPTY })
  const set = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const doc: Doctor = {
      ...form,
      experience: Number(form.experience),
      consultationFee: Number(form.consultationFee),
      id: nextId('DOC', state.doctors),
      staffId: nextId('STF', state.staff),
    }
    dispatch({ type: 'ADD_DOCTOR', payload: doc })
    setForm({ ...EMPTY })
    setShowForm(false)
  }

  const columns: Column<Doctor>[] = [
    { key: 'id', label: 'ID', width: '100px' },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'specialty', label: 'Specialty', sortable: true },
    { key: 'department', label: 'Department' },
    { key: 'qualification', label: 'Qualification' },
    { key: 'experience', label: 'Exp (yrs)', width: '80px' },
    { key: 'consultationFee', label: 'Fee (USD)', width: '90px', render: d => `$${d.consultationFee}` },
    { key: 'phone', label: 'Phone' },
    { key: 'status', label: 'Status', badge: true, width: '100px' },
  ]

  const specialties = [...new Set(state.doctors.map(d => d.specialty))]

  return (
    <div className="module-page">
      <PageHeader
        title="Doctor Management"
        subtitle={`${state.doctors.length} doctors registered`}
        icon={<Stethoscope size={22} />}
        actions={
          <button type="button" className="btn btn--primary" onClick={() => setShowForm(true)}>
            <UserPlus size={16} /> Add Doctor
          </button>
        }
      />

      <div className="mini-stats-row">
        <div className="mini-stat"><span>Active</span><strong>{state.doctors.filter(d => d.status === 'Active').length}</strong></div>
        <div className="mini-stat"><span>On Call</span><strong>{state.doctors.filter(d => d.status === 'On call').length}</strong></div>
        <div className="mini-stat"><span>Away</span><strong>{state.doctors.filter(d => d.status === 'Away').length}</strong></div>
        <div className="mini-stat"><span>Specialties</span><strong>{specialties.length}</strong></div>
      </div>

      <div className="tab-bar">
        <button type="button" className={`tab-btn${docTab === 'directory' ? ' tab-btn--active' : ''}`} onClick={() => setDocTab('directory')}>Directory</button>
        <button type="button" className={`tab-btn${docTab === 'roster' ? ' tab-btn--active' : ''}`} onClick={() => setDocTab('roster')}><CalendarDays size={13} style={{ marginRight: 5 }} />Duty Roster</button>
      </div>

      {docTab === 'directory' && (<>
      {/* Specialty cards */}
      <div className="card-grid">
        {state.doctors.map(doc => (
          <div key={doc.id} className="doctor-card" onClick={() => setViewDoctor(doc)} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && setViewDoctor(doc)}>
            <div className="doctor-card__avatar">{doc.name.split(' ').map(w => w[0]).join('').slice(0, 2)}</div>
            <div className="doctor-card__body">
              <strong>{doc.name}</strong>
              <span>{doc.specialty}</span>
              <span className="doctor-card__dept">{doc.department}</span>
            </div>
            <div className="doctor-card__foot">
              <Badge variant={statusVariant(doc.status)}>{doc.status}</Badge>
              <span>${doc.consultationFee}</span>
            </div>
          </div>
        ))}
      </div>
      <SectionCard title="Doctor Directory" noPad>
        <DataTable columns={columns} data={state.doctors} searchable searchKeys={['name', 'specialty', 'department', 'id']} onRowClick={d => setViewDoctor(d)} />
      </SectionCard>
      </>)}

      {docTab === 'roster' && (
        <SectionCard title="Weekly Duty Roster">
          <div className="roster-table-wrap">
            <table className="roster-table">
              <thead>
                <tr>
                  <th>Doctor</th>
                  {DAYS.map(d => <th key={d}>{d}</th>)}
                </tr>
              </thead>
              <tbody>
                {state.doctors.filter(d => d.status !== 'Away').map(doc => (
                  <tr key={doc.id}>
                    <td className="roster-doc-cell">
                      <strong>{doc.name}</strong>
                      <span>{doc.specialty}</span>
                    </td>
                    {DAYS.map(day => {
                      const shift = getRosterShift(doc.id, day)
                      return (
                        <td key={day} className={`roster-shift-cell roster-shift--${shift === 'Off' ? 'off' : shift.startsWith('Morning') ? 'morning' : shift.startsWith('Afternoon') ? 'afternoon' : 'night'}`}>
                          <select
                            className="roster-select"
                            value={shift}
                            onChange={e => setRosterShift(doc.id, day, e.target.value)}
                          >
                            {SHIFTS.map(s => <option key={s} value={s}>{s.split(' ')[0]}</option>)}
                          </select>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="roster-legend">
            {[['Morning','blue'],['Afternoon','yellow'],['Night','purple'],['Off','gray']].map(([s, c]) => (
              <span key={s} className={`badge badge--${c}`}>{s}</span>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Doctor detail modal */}
      {viewDoctor && (
        <Modal title={viewDoctor.name} onClose={() => setViewDoctor(null)} size="md">
          <div className="detail-grid">
            <div className="detail-section">
              <h4>Profile</h4>
              <dl>
                <dt>ID</dt><dd>{viewDoctor.id}</dd>
                <dt>Specialty</dt><dd>{viewDoctor.specialty}</dd>
                <dt>Department</dt><dd>{viewDoctor.department}</dd>
                <dt>Qualification</dt><dd>{viewDoctor.qualification}</dd>
                <dt>Experience</dt><dd>{viewDoctor.experience} years</dd>
                <dt>License</dt><dd>{viewDoctor.license}</dd>
                <dt>Consultation Fee</dt><dd>${viewDoctor.consultationFee}</dd>
                <dt>Status</dt><dd><Badge variant={statusVariant(viewDoctor.status)}>{viewDoctor.status}</Badge></dd>
              </dl>
            </div>
            <div className="detail-section">
              <h4>Contact</h4>
              <dl>
                <dt>Phone</dt><dd>{viewDoctor.phone}</dd>
                <dt>Email</dt><dd>{viewDoctor.email}</dd>
              </dl>
              <h4 style={{ marginTop: 16 }}>Schedule Summary</h4>
              <dl>
                <dt>Today's appointments</dt>
                <dd>{state.appointments.filter(a => a.doctorId === viewDoctor.id && a.date === new Date().toISOString().slice(0,10)).length}</dd>
                <dt>Total appointments</dt>
                <dd>{state.appointments.filter(a => a.doctorId === viewDoctor.id).length}</dd>
              </dl>
            </div>
          </div>
        </Modal>
      )}

      {/* Add doctor modal */}
      {showForm && (
        <Modal title="Add Doctor" onClose={() => setShowForm(false)} size="lg">
          <form onSubmit={handleSubmit} className="form-grid-2">
            <FormField label="Full Name" name="name" value={form.name} onChange={set} required />
            <FormField label="Specialty" name="specialty" value={form.specialty} onChange={set} required />
            <FormField label="Department" name="department" type="select" value={form.department} onChange={set}
              options={state.departments.map(d => ({ value: d.name, label: d.name }))} />
            <FormField label="License Number" name="license" value={form.license} onChange={set} required />
            <FormField label="Qualification" name="qualification" value={form.qualification} onChange={set} placeholder="e.g. MBChB, FGCP" />
            <FormField label="Experience (years)" name="experience" type="number" value={form.experience} onChange={set} min={0} />
            <FormField label="Phone" name="phone" type="tel" value={form.phone} onChange={set} required />
            <FormField label="Email" name="email" type="email" value={form.email} onChange={set} required />
            <FormField label="Consultation Fee (USD)" name="consultationFee" type="number" value={form.consultationFee} onChange={set} min={0} />
            <FormField label="Status" name="status" type="select" value={form.status} onChange={set}
              options={[{ value: 'Active', label: 'Active' }, { value: 'On call', label: 'On Call' }, { value: 'Away', label: 'Away' }]} />
            <div className="form-actions">
              <button type="button" className="btn btn--ghost" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn--primary">Add Doctor</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

