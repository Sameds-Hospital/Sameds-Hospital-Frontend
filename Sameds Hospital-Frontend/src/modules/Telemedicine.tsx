import { useState, type FormEvent, type ChangeEvent } from 'react'
import { Video, Plus } from 'lucide-react'
import { useHMS } from '../store/HMSContext'
import { DataTable, type Column } from '../components/ui/DataTable'
import { Modal } from '../components/ui/Modal'
import { FormField } from '../components/ui/FormField'
import { Badge, statusVariant } from '../components/ui/Badge'
import { PageHeader } from '../components/ui/PageHeader'
import { SectionCard } from '../components/ui/SectionCard'
import type { TelemedicineSession } from '../types'

export function Telemedicine() {
  const { state, dispatch, nextId } = useHMS()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ patientId: '', doctorId: '', scheduledAt: new Date().toISOString().slice(0,16), platform: 'Video Call' as TelemedicineSession['platform'], chiefComplaint: '', notes: '', prescriptionIssued: false })

  const set = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const patient = state.patients.find(p => p.id === form.patientId)
    const doctor = state.doctors.find(d => d.id === form.doctorId)
    const session: TelemedicineSession = {
      id: nextId('TEL', state.telemedicineSessions),
      patientName: patient?.name ?? '',
      doctorName: doctor?.name ?? '',
      duration: '',
      status: 'Scheduled',
      ...form,
    }
    dispatch({ type: 'ADD_TELEMEDICINE_SESSION', payload: session })
    setShowForm(false)
  }

  const columns: Column<TelemedicineSession>[] = [
    { key: 'id', label: 'ID', width: '110px' },
    { key: 'patientName', label: 'Patient', sortable: true },
    { key: 'doctorName', label: 'Doctor', sortable: true },
    { key: 'platform', label: 'Platform', badge: true },
    { key: 'chiefComplaint', label: 'Complaint' },
    { key: 'scheduledAt', label: 'Scheduled', render: s => new Date(s.scheduledAt).toLocaleString() },
    { key: 'prescriptionIssued', label: 'Rx', render: s => s.prescriptionIssued ? <Badge variant="green">Yes</Badge> : <Badge variant="gray">No</Badge> },
    { key: 'status', label: 'Status', badge: true },
  ]

  return (
    <div className="module-page">
      <PageHeader
        title="Telemedicine"
        subtitle="Virtual consultations and remote healthcare"
        icon={<Video size={22} />}
        actions={
          <button type="button" className="btn btn--primary" onClick={() => setShowForm(true)}>
            <Plus size={16} /> Schedule Session
          </button>
        }
      />

      <div className="mini-stats-row">
        {(['Scheduled','In Progress','Completed','Cancelled','Missed'] as TelemedicineSession['status'][]).map(s => (
          <div key={s} className="mini-stat"><Badge variant={statusVariant(s)}>{s}</Badge><strong>{state.telemedicineSessions.filter(t => t.status === s).length}</strong></div>
        ))}
      </div>

      <SectionCard title="Sessions" noPad>
        <DataTable columns={columns} data={state.telemedicineSessions} searchable searchKeys={['patientName','doctorName','platform']} />
      </SectionCard>

      {showForm && (
        <Modal title="Schedule Telemedicine Session" onClose={() => setShowForm(false)} size="md">
          <form onSubmit={handleSubmit} className="form-grid-2">
            <FormField label="Patient" name="patientId" type="select" value={form.patientId} onChange={set} required options={state.patients.map(p => ({ value: p.id, label: `${p.id} – ${p.name}` }))} />
            <FormField label="Doctor" name="doctorId" type="select" value={form.doctorId} onChange={set} required options={state.doctors.map(d => ({ value: d.id, label: d.name }))} />
            <FormField label="Platform" name="platform" type="select" value={form.platform} onChange={set} options={['Video Call','Phone Call','Chat'].map(v => ({ value: v, label: v }))} />
            <FormField label="Scheduled At" name="scheduledAt" type="date" value={form.scheduledAt.slice(0,10)} onChange={set} required />
            <FormField label="Chief Complaint" name="chiefComplaint" value={form.chiefComplaint} onChange={set} required />
            <FormField label="Notes" name="notes" type="textarea" value={form.notes} onChange={set} />
            <div className="form-actions">
              <button type="button" className="btn btn--ghost" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn--primary">Schedule</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
