import { useState, type FormEvent, type ChangeEvent } from 'react'
import { BedDouble, Plus, LogOut, ArrowRightLeft, FileDown } from 'lucide-react'
import { useHMS } from '../store/HMSContext'
import { DataTable, type Column } from '../components/ui/DataTable'
import { Modal } from '../components/ui/Modal'
import { FormField } from '../components/ui/FormField'
import { Badge } from '../components/ui/Badge'
import { PageHeader } from '../components/ui/PageHeader'
import { SectionCard } from '../components/ui/SectionCard'
import { exportDischargePDF } from '../utils/pdfExport'
import type { Admission, Bed } from '../types'

export function Inpatient() {
  const { state, dispatch, nextId } = useHMS()
  const [showAdmit, setShowAdmit] = useState(false)
  const [dischargeAdm, setDischargeAdm] = useState<Admission | null>(null)
  const [transferAdm, setTransferAdm] = useState<Admission | null>(null)
  const [transferForm, setTransferForm] = useState({ wardId: '', bedId: '' })
  const [admForm, setAdmForm] = useState({
    patientId: '', wardId: '', bedId: '', attendingDoctor: '', diagnosis: '',
    dischargePlanned: '', nursingNotes: '',
  })

  const set = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setAdmForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submitAdmit = (e: FormEvent) => {
    e.preventDefault()
    const patient = state.patients.find(p => p.id === admForm.patientId)
    const ward = state.wards.find(w => w.id === admForm.wardId)
    const bed = state.beds.find(b => b.id === admForm.bedId)
    const adm: Admission = {
      id: nextId('ADM', state.admissions),
      patientId: admForm.patientId,
      patientName: patient?.name ?? '',
      wardId: admForm.wardId,
      wardName: ward?.name ?? '',
      bedId: admForm.bedId,
      bedNumber: bed ? `${bed.room}-${bed.number}` : '',
      attendingDoctor: admForm.attendingDoctor,
      diagnosis: admForm.diagnosis,
      admittedAt: new Date().toISOString(),
      dischargePlanned: admForm.dischargePlanned,
      dischargedAt: '',
      nursingNotes: admForm.nursingNotes,
      status: 'Admitted',
    }
    dispatch({ type: 'ADD_ADMISSION', payload: adm })
    // Mark bed occupied
    if (bed) dispatch({ type: 'UPDATE_BED', payload: { ...bed, status: 'Occupied' } })
    // Update patient status
    if (patient) dispatch({ type: 'UPDATE_PATIENT', payload: { ...patient, status: 'Admitted' } })
    setShowAdmit(false)
  }

  const discharge = (adm: Admission) => {
    const discharged = { ...adm, status: 'Discharged' as const, dischargedAt: new Date().toISOString() }
    dispatch({ type: 'UPDATE_ADMISSION', payload: discharged })
    const bed = state.beds.find(b => b.id === adm.bedId)
    if (bed) dispatch({ type: 'UPDATE_BED', payload: { ...bed, status: 'Available' } })
    const patient = state.patients.find(p => p.id === adm.patientId)
    if (patient) dispatch({ type: 'UPDATE_PATIENT', payload: { ...patient, status: 'Discharged' } })
    // Auto-generate discharge invoice
    dispatch({
      type: 'ADD_INVOICE',
      payload: {
        id: nextId('INV', state.invoices),
        patientId: adm.patientId,
        patientName: adm.patientName,
        department: adm.wardName,
        items: [{ description: `Ward Stay: ${adm.wardName} (${adm.bedNumber})`, quantity: 1, unitPrice: 200, total: 200 }],
        subtotal: 200, discount: 0, tax: 0, total: 200,
        insuranceCoverage: 0, amountDue: 200, currency: 'GHS',
        status: 'Issued',
        issuedAt: new Date().toISOString(),
        dueAt: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      },
    })
    setDischargeAdm(discharged)
  }

  const transfer = (adm: Admission) => {
    setTransferAdm(adm)
    setTransferForm({ wardId: '', bedId: '' })
  }

  const submitTransfer = (e: React.FormEvent) => {
    e.preventDefault()
    if (!transferAdm) return
    const newWard = state.wards.find(w => w.id === transferForm.wardId)
    const newBed = state.beds.find(b => b.id === transferForm.bedId)
    const oldBed = state.beds.find(b => b.id === transferAdm.bedId)
    // Free old bed
    if (oldBed) dispatch({ type: 'UPDATE_BED', payload: { ...oldBed, status: 'Available' } })
    // Occupy new bed
    if (newBed) dispatch({ type: 'UPDATE_BED', payload: { ...newBed, status: 'Occupied' } })
    dispatch({
      type: 'UPDATE_ADMISSION',
      payload: {
        ...transferAdm,
        wardId: transferForm.wardId,
        wardName: newWard?.name ?? transferAdm.wardName,
        bedId: transferForm.bedId,
        bedNumber: newBed ? `${newBed.room}-${newBed.number}` : transferAdm.bedNumber,
        nursingNotes: transferAdm.nursingNotes + `\nTransferred to ${newWard?.name} on ${new Date().toLocaleDateString()}`,
      },
    })
    setTransferAdm(null)
  }

  const bedCols: Column<Bed>[] = [
    { key: 'id', label: 'ID', width: '100px' },
    { key: 'wardName', label: 'Ward', sortable: true },
    { key: 'room', label: 'Room' },
    { key: 'number', label: 'No.' },
    { key: 'type', label: 'Type', badge: true },
    { key: 'status', label: 'Status', badge: true, sortable: true },
  ]

  const admCols: Column<Admission>[] = [
    { key: 'id', label: 'ID', width: '100px' },
    { key: 'patientName', label: 'Patient', sortable: true },
    { key: 'wardName', label: 'Ward' },
    { key: 'bedNumber', label: 'Bed' },
    { key: 'attendingDoctor', label: 'Doctor' },
    { key: 'diagnosis', label: 'Diagnosis' },
    { key: 'admittedAt', label: 'Admitted', render: a => new Date(a.admittedAt).toLocaleDateString() },
    { key: 'dischargePlanned', label: 'Planned Discharge' },
    { key: 'status', label: 'Status', badge: true },
    {
      key: 'actions', label: '', width: '120px',
      render: row => row.status === 'Admitted' ? (
        <div className="row-actions">
          <button type="button" className="icon-btn icon-btn--green" title="Discharge" onClick={e => { e.stopPropagation(); discharge(row) }}><LogOut size={14} /></button>
          <button type="button" className="icon-btn icon-btn--blue" title="Transfer" onClick={e => { e.stopPropagation(); transfer(row) }}><ArrowRightLeft size={14} /></button>
        </div>
      ) : row.status === 'Discharged' ? (
        <button type="button" className="icon-btn" title="Discharge Summary PDF" onClick={e => { e.stopPropagation(); const p = state.patients.find(pt => pt.id === row.patientId); exportDischargePDF(row, p?.name ?? row.patientName, p?.dob ?? '', row.wardName) }}>
          <FileDown size={14} />
        </button>
      ) : null,
    },
  ]

  const occupiedBeds = state.beds.filter(b => b.status === 'Occupied').length
  const availableBeds = state.beds.filter(b => b.status === 'Available').length

  return (
    <div className="module-page">
      <PageHeader
        title="Inpatient & Ward Management"
        subtitle="Admissions, beds and nursing notes"
        icon={<BedDouble size={22} />}
        actions={
          <button type="button" className="btn btn--primary" onClick={() => setShowAdmit(true)}>
            <Plus size={16} /> Admit Patient
          </button>
        }
      />

      <div className="mini-stats-row">
        <div className="mini-stat"><span>Total Beds</span><strong>{state.beds.length}</strong></div>
        <div className="mini-stat"><Badge variant="blue">Occupied</Badge><strong>{occupiedBeds}</strong></div>
        <div className="mini-stat"><Badge variant="green">Available</Badge><strong>{availableBeds}</strong></div>
        <div className="mini-stat"><Badge variant="yellow">Reserved</Badge><strong>{state.beds.filter(b => b.status === 'Reserved').length}</strong></div>
        <div className="mini-stat"><span>Active Admissions</span><strong>{state.admissions.filter(a => a.status === 'Admitted').length}</strong></div>
        <div className="mini-stat"><span>Occupancy Rate</span><strong>{state.beds.length ? Math.round(occupiedBeds / state.beds.length * 100) : 0}%</strong></div>
      </div>

      {/* Bed Visual Map */}
      <SectionCard title="Bed Occupancy Map">
        {state.wards.map(ward => {
          const wardBeds = state.beds.filter(b => b.wardId === ward.id)
          return (
            <div key={ward.id} className="bed-map-ward">
              <div className="bed-map-ward__header">
                <strong>{ward.name}</strong>
                <span className="bed-map-ward__sub">{ward.department} · {ward.type}</span>
                <span className="bed-map-ward__count">{wardBeds.filter(b => b.status === 'Occupied').length}/{wardBeds.length} occupied</span>
              </div>
              <div className="bed-map-grid">
                {wardBeds.map(bed => {
                  const adm = state.admissions.find(a => a.bedId === bed.id && a.status === 'Admitted')
                  return (
                    <div key={bed.id} className={`bed-tile bed-tile--${bed.status.toLowerCase().replace(' ', '-')}`} title={adm ? `${adm.patientName} – ${adm.diagnosis}` : bed.status}>
                      <span className="bed-tile__num">{bed.room}{bed.number}</span>
                      {adm && <span className="bed-tile__patient">{adm.patientName.split(' ')[0]}</span>}
                      <span className="bed-tile__type">{bed.type}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
        <div className="bed-map-legend">
          {[['Available','green'],['Occupied','red'],['Reserved','yellow'],['Maintenance','gray']].map(([s, c]) => (
            <span key={s} className={`bed-legend-item bed-legend-item--${c}`}>{s}</span>
          ))}
        </div>
      </SectionCard>

      {/* Ward overview */}
      <SectionCard title="Ward Overview">
        <div className="ward-grid">
          {state.wards.map(ward => {
            const wardBeds = state.beds.filter(b => b.wardId === ward.id)
            const occ = wardBeds.filter(b => b.status === 'Occupied').length
            const pct = wardBeds.length ? Math.round(occ / wardBeds.length * 100) : 0
            return (
              <div key={ward.id} className="ward-card">
                <strong>{ward.name}</strong>
                <span>{ward.department}</span>
                <div className="ward-card__bar">
                  <div className="ward-card__fill" style={{ width: `${pct}%` }} />
                </div>
                <span>{occ}/{wardBeds.length} beds · {pct}% full</span>
                <Badge variant={ward.type === 'ICU' ? 'red' : 'blue'}>{ward.type}</Badge>
              </div>
            )
          })}
        </div>
      </SectionCard>

      <SectionCard title="Bed Status" noPad>
        <DataTable columns={bedCols} data={state.beds} searchable searchKeys={['wardName','room','number']} />
      </SectionCard>

      <SectionCard title="Admissions" noPad>
        <DataTable columns={admCols} data={state.admissions} searchable searchKeys={['patientName','wardName','attendingDoctor']} />
      </SectionCard>

      {/* Transfer Modal */}
      {transferAdm && (
        <Modal title={`Transfer: ${transferAdm.patientName}`} onClose={() => setTransferAdm(null)} size="sm">
          <form onSubmit={submitTransfer} className="form-grid-2">
            <FormField label="New Ward" name="wardId" type="select" value={transferForm.wardId}
              onChange={e => setTransferForm(f => ({ ...f, wardId: e.target.value, bedId: '' }))} required
              options={state.wards.map(w => ({ value: w.id, label: w.name }))} />
            <FormField label="New Bed" name="bedId" type="select" value={transferForm.bedId}
              onChange={e => setTransferForm(f => ({ ...f, bedId: e.target.value }))} required
              options={state.beds.filter(b => b.status === 'Available' && b.wardId === transferForm.wardId).map(b => ({ value: b.id, label: `${b.room}-${b.number}` }))} />
            <div className="form-actions">
              <button type="button" className="btn btn--ghost" onClick={() => setTransferAdm(null)}>Cancel</button>
              <button type="submit" className="btn btn--primary">Confirm Transfer</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Discharge summary modal */}
      {dischargeAdm && (
        <Modal title="Discharge Complete" onClose={() => setDischargeAdm(null)} size="sm">
          <p style={{ marginBottom: 16, color: 'var(--text-secondary)' }}>
            <strong>{dischargeAdm.patientName}</strong> has been discharged from {dischargeAdm.wardName}. An invoice has been auto-generated.
          </p>
          <div className="form-actions">
            <button type="button" className="btn btn--ghost" onClick={() => setDischargeAdm(null)}>Close</button>
            <button type="button" className="btn btn--primary" onClick={() => { const p = state.patients.find(pt => pt.id === dischargeAdm.patientId); exportDischargePDF(dischargeAdm, p?.name ?? '', p?.dob ?? '', dischargeAdm.wardName); setDischargeAdm(null) }}>
              <FileDown size={14} /> Download Summary PDF
            </button>
          </div>
        </Modal>
      )}

      {showAdmit && (
        <Modal title="Admit Patient" onClose={() => setShowAdmit(false)} size="md">
          <form onSubmit={submitAdmit} className="form-grid-2">
            <FormField label="Patient" name="patientId" type="select" value={admForm.patientId} onChange={set} required
              options={state.patients.filter(p => p.status !== 'Admitted').map(p => ({ value: p.id, label: `${p.id} – ${p.name}` }))} />
            <FormField label="Ward" name="wardId" type="select" value={admForm.wardId} onChange={set} required
              options={state.wards.map(w => ({ value: w.id, label: w.name }))} />
            <FormField label="Bed" name="bedId" type="select" value={admForm.bedId} onChange={set} required
              options={state.beds.filter(b => b.status === 'Available' && b.wardId === admForm.wardId).map(b => ({ value: b.id, label: `${b.room} – Bed ${b.number}` }))} />
            <FormField label="Attending Doctor" name="attendingDoctor" type="select" value={admForm.attendingDoctor} onChange={set} required
              options={state.doctors.map(d => ({ value: d.name, label: d.name }))} />
            <FormField label="Admission Diagnosis" name="diagnosis" value={admForm.diagnosis} onChange={set} required />
            <FormField label="Planned Discharge Date" name="dischargePlanned" type="date" value={admForm.dischargePlanned} onChange={set} />
            <FormField label="Initial Nursing Notes" name="nursingNotes" type="textarea" value={admForm.nursingNotes} onChange={set} />
            <div className="form-actions">
              <button type="button" className="btn btn--ghost" onClick={() => setShowAdmit(false)}>Cancel</button>
              <button type="submit" className="btn btn--primary">Admit Patient</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
