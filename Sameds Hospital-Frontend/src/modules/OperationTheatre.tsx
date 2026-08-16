import { useState, type FormEvent, type ChangeEvent } from 'react'
import { Scissors, Plus } from 'lucide-react'
import { useHMS } from '../store/HMSContext'
import { DataTable, type Column } from '../components/ui/DataTable'
import { Modal } from '../components/ui/Modal'
import { FormField } from '../components/ui/FormField'
import { Badge, statusVariant } from '../components/ui/Badge'
import { PageHeader } from '../components/ui/PageHeader'
import { SectionCard } from '../components/ui/SectionCard'
import type { Surgery } from '../types'

export function OperationTheatre() {
  const { state, dispatch, nextId } = useHMS()
  const [showForm, setShowForm] = useState(false)
  const [viewSurgery, setViewSurgery] = useState<Surgery | null>(null)
  const [form, setForm] = useState({ patientId: '', procedure: '', surgeonId: '', anesthetist: '', otRoom: 'OT-1', scheduledAt: '', duration: '', preOpNotes: '' })

  const set = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const patient = state.patients.find(p => p.id === form.patientId)
    const surgeon = state.doctors.find(d => d.id === form.surgeonId)
    const surgery: Surgery = {
      id: nextId('SRG', state.surgeries),
      patientName: patient?.name ?? '',
      surgeonName: surgeon?.name ?? '',
      postOpNotes: '',
      status: 'Scheduled',
      ...form,
    }
    dispatch({ type: 'ADD_SURGERY', payload: surgery })
    setShowForm(false)
  }

  const updateStatus = (s: Surgery, status: Surgery['status']) =>
    dispatch({ type: 'UPDATE_SURGERY', payload: { ...s, status } })

  const columns: Column<Surgery>[] = [
    { key: 'id', label: 'ID', width: '100px' },
    { key: 'patientName', label: 'Patient', sortable: true },
    { key: 'procedure', label: 'Procedure', sortable: true },
    { key: 'surgeonName', label: 'Surgeon' },
    { key: 'anesthetist', label: 'Anesthetist' },
    { key: 'otRoom', label: 'OT Room' },
    { key: 'scheduledAt', label: 'Scheduled', render: s => new Date(s.scheduledAt).toLocaleString() },
    { key: 'duration', label: 'Duration' },
    { key: 'status', label: 'Status', badge: true, sortable: true },
    {
      key: 'actions', label: '', width: '130px',
      render: row => (
        <div className="row-actions">
          {row.status === 'Scheduled' && <button type="button" className="icon-btn icon-btn--blue" onClick={e => { e.stopPropagation(); updateStatus(row, 'In Progress') }}>Start</button>}
          {row.status === 'In Progress' && <button type="button" className="icon-btn icon-btn--green" onClick={e => { e.stopPropagation(); updateStatus(row, 'Completed') }}>Complete</button>}
          <button type="button" className="icon-btn" onClick={e => { e.stopPropagation(); setViewSurgery(row) }}>View</button>
        </div>
      ),
    },
  ]

  const otRooms = ['OT-1','OT-2','OT-3','OT-4']

  return (
    <div className="module-page">
      <PageHeader title="Operation Theatre" subtitle="Surgery scheduling, surgeon assignments and OT management" icon={<Scissors size={22} />}
        actions={<button type="button" className="btn btn--primary" onClick={() => setShowForm(true)}><Plus size={16} /> Schedule Surgery</button>}
      />

      <div className="mini-stats-row">
        {(['Scheduled','In Progress','Completed','Cancelled','Postponed'] as Surgery['status'][]).map(s => (
          <div key={s} className="mini-stat"><Badge variant={statusVariant(s)}>{s}</Badge><strong>{state.surgeries.filter(sg => sg.status === s).length}</strong></div>
        ))}
      </div>

      {/* OT room status */}
      <SectionCard title="OT Room Status">
        <div className="ot-grid">
          {otRooms.map(room => {
            const active = state.surgeries.find(s => s.otRoom === room && s.status === 'In Progress')
            const next = state.surgeries.find(s => s.otRoom === room && s.status === 'Scheduled')
            return (
              <div key={room} className={`ot-card${active ? ' ot-card--active' : ''}`}>
                <strong>{room}</strong>
                {active ? (
                  <>
                    <Badge variant="blue">In Progress</Badge>
                    <span>{active.procedure}</span>
                    <span>{active.surgeonName}</span>
                  </>
                ) : next ? (
                  <>
                    <Badge variant="yellow">Scheduled</Badge>
                    <span>{next.procedure}</span>
                    <span>{new Date(next.scheduledAt).toLocaleTimeString()}</span>
                  </>
                ) : (
                  <Badge variant="green">Available</Badge>
                )}
              </div>
            )
          })}
        </div>
      </SectionCard>

      <SectionCard title="Surgery Schedule" noPad>
        <DataTable columns={columns} data={state.surgeries} searchable searchKeys={['patientName','procedure','surgeonName']} onRowClick={s => setViewSurgery(s)} />
      </SectionCard>

      {viewSurgery && (
        <Modal title={`Surgery – ${viewSurgery.id}`} onClose={() => setViewSurgery(null)} size="md">
          <div className="detail-grid">
            <div className="detail-section">
              <h4>Surgery Details</h4>
              <dl>
                <dt>Procedure</dt><dd>{viewSurgery.procedure}</dd>
                <dt>Patient</dt><dd>{viewSurgery.patientName}</dd>
                <dt>Surgeon</dt><dd>{viewSurgery.surgeonName}</dd>
                <dt>Anesthetist</dt><dd>{viewSurgery.anesthetist}</dd>
                <dt>OT Room</dt><dd>{viewSurgery.otRoom}</dd>
                <dt>Scheduled</dt><dd>{new Date(viewSurgery.scheduledAt).toLocaleString()}</dd>
                <dt>Duration</dt><dd>{viewSurgery.duration}</dd>
                <dt>Status</dt><dd><Badge variant={statusVariant(viewSurgery.status)}>{viewSurgery.status}</Badge></dd>
              </dl>
            </div>
            <div className="detail-section">
              <h4>Pre-Op Notes</h4>
              <p>{viewSurgery.preOpNotes || 'None'}</p>
              <h4 style={{ marginTop: 12 }}>Post-Op Notes</h4>
              <p>{viewSurgery.postOpNotes || 'Not yet recorded'}</p>
            </div>
          </div>
        </Modal>
      )}

      {showForm && (
        <Modal title="Schedule Surgery" onClose={() => setShowForm(false)} size="lg">
          <form onSubmit={handleSubmit} className="form-grid-2">
            <FormField label="Patient" name="patientId" type="select" value={form.patientId} onChange={set} required options={state.patients.map(p => ({ value: p.id, label: `${p.id} – ${p.name}` }))} />
            <FormField label="Procedure" name="procedure" value={form.procedure} onChange={set} required />
            <FormField label="Surgeon" name="surgeonId" type="select" value={form.surgeonId} onChange={set} required options={state.doctors.filter(d => d.department === 'Surgery' || d.specialty.includes('Surgery')).map(d => ({ value: d.id, label: d.name }))} />
            <FormField label="Anesthetist" name="anesthetist" value={form.anesthetist} onChange={set} required />
            <FormField label="OT Room" name="otRoom" type="select" value={form.otRoom} onChange={set} options={otRooms.map(v => ({ value: v, label: v }))} />
            <FormField label="Scheduled Date & Time" name="scheduledAt" type="date" value={form.scheduledAt} onChange={set} required />
            <FormField label="Estimated Duration" name="duration" value={form.duration} onChange={set} placeholder="e.g. 90 min" />
            <FormField label="Pre-Op Notes" name="preOpNotes" type="textarea" value={form.preOpNotes} onChange={set} />
            <div className="form-actions">
              <button type="button" className="btn btn--ghost" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn--primary">Schedule Surgery</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
