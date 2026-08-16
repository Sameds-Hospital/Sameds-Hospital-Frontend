import { useState, useRef, type FormEvent, type ChangeEvent } from 'react'
import { UserPlus, Download, Eye, X, Upload } from 'lucide-react'
import { useHMS } from '../store/HMSContext'
import { DataTable, type Column } from '../components/ui/DataTable'
import { Modal } from '../components/ui/Modal'
import { FormField } from '../components/ui/FormField'
import { Badge, statusVariant } from '../components/ui/Badge'
import { PageHeader } from '../components/ui/PageHeader'
import { SectionCard } from '../components/ui/SectionCard'
import { PatientBarcode } from '../components/ui/PatientBarcode'
import { getVisiblePatientsForUser } from '../utils/access'
import type { Patient } from '../types'

const EMPTY: Omit<Patient, 'id' | 'barcode' | 'registeredAt'> = {
  name: '', age: 0, dob: '', gender: 'Male', bloodGroup: 'O+',
  phone: '', email: '', address: '', emergencyContact: '', emergencyPhone: '',
  allergies: 'None', insuranceId: '', branchId: 'BR-001', status: 'Active',
}

type Tab = 'list' | 'register'

export function Patients() {
  const { state, dispatch, nextId, addAuditLog, currentUser } = useHMS()
  const [tab, setTab] = useState<Tab>('list')
  const [showForm, setShowForm] = useState(false)
  const [viewPatient, setViewPatient] = useState<Patient | null>(null)
  const [form, setForm] = useState({ ...EMPTY })
  const visiblePatients = getVisiblePatientsForUser(currentUser, state)
  const canRegisterPatient = currentUser?.role !== 'Patient'
  const [assignDoctorId, setAssignDoctorId] = useState('')
  const csvRef = useRef<HTMLInputElement>(null)

  const handleCSVImport = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const lines = (ev.target?.result as string).split('\n').filter(Boolean)
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
      lines.slice(1).forEach(line => {
        const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
        const row: Record<string, string> = {}
        headers.forEach((h, i) => { row[h] = vals[i] ?? '' })
        if (!row.name) return
        const barcode = `HP-${Math.random().toString(36).slice(2, 10).toUpperCase()}`
        dispatch({
          type: 'ADD_PATIENT',
          payload: {
            id: nextId('PT', state.patients),
            name: row.name, age: Number(row.age) || 0,
            dob: row.dob || '', gender: (row.gender as Patient['gender']) || 'Male',
            bloodGroup: (row['blood group'] || row.bloodgroup || 'O+') as Patient['bloodGroup'],
            phone: row.phone || '', email: row.email || '',
            address: row.address || '', emergencyContact: row['emergency contact'] || row.emergencycontact || '',
            emergencyPhone: row['emergency phone'] || row.emergencyphone || '',
            allergies: row.allergies || 'None', insuranceId: row['insurance id'] || row.insuranceid || '',
            branchId: 'BR-001', status: 'Active', barcode,
            registeredAt: new Date().toISOString(),
          },
        })
      })
    }
    reader.readAsText(file)
    if (csvRef.current) csvRef.current.value = ''
  }

  const set = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const barcode = `HP-${Math.random().toString(36).slice(2, 10).toUpperCase()}`
    const newPatient: Patient = {
      ...form,
      age: Number(form.age),
      id: nextId('PT', state.patients),
      barcode,
      registeredAt: new Date().toISOString(),
    }
    dispatch({ type: 'ADD_PATIENT', payload: newPatient })
    if (assignDoctorId) {
      const doctor = state.doctors.find(d => d.id === assignDoctorId)
      dispatch({ type: 'UPDATE_PATIENT', payload: { ...newPatient, assignedDoctorId: doctor?.id, assignedDoctorName: doctor?.name } })
    }
    addAuditLog('CREATE_PATIENT', 'Patients', newPatient.id)
    setForm({ ...EMPTY })
    setAssignDoctorId('')
    setShowForm(false)
  }

  const downloadRecord = (p: Patient) => {
    const records = state.medicalRecords.filter(r => r.patientId === p.id)
    const appts = state.appointments.filter(a => a.patientId === p.id)
    const invoices = state.invoices.filter(i => i.patientId === p.id)
    const blob = new Blob([JSON.stringify({ patient: p, records, appointments: appts, invoices }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `${p.id}-record.json`; a.click()
    URL.revokeObjectURL(url)
  }

  const columns: Column<Patient>[] = [
    { key: 'id', label: 'ID', sortable: true, width: '100px' },
    { key: 'barcode', label: 'Barcode', width: '130px' },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'age', label: 'Age', width: '60px' },
    { key: 'gender', label: 'Gender', width: '80px' },
    { key: 'bloodGroup', label: 'Blood', width: '70px' },
    { key: 'phone', label: 'Phone' },
    { key: 'allergies', label: 'Allergies' },
    { key: 'status', label: 'Status', badge: true, sortable: true, width: '110px' },
    {
      key: 'actions', label: '', width: '90px',
      render: (row) => (
        <div className="row-actions">
          <button type="button" className="icon-btn" title="View" onClick={e => { e.stopPropagation(); setViewPatient(row) }}><Eye size={14} /></button>
          <button type="button" className="icon-btn" title="Download" onClick={e => { e.stopPropagation(); downloadRecord(row) }}><Download size={14} /></button>
        </div>
      ),
    },
  ]

  return (
    <div className="module-page">
      <PageHeader
        title="Patient Management"
        subtitle={`${visiblePatients.length} ${currentUser?.role === 'Doctor' ? 'assigned patients' : 'registered patients'}`}
        icon={<UserPlus size={22} />}
      />

      {/* Tabs */}
      <div className="tabs">
        <button
          type="button"
          className={`tab-btn${tab === 'list' ? ' tab-btn--active' : ''}`}
          onClick={() => setTab('list')}
        >
          Patient List
        </button>
        {canRegisterPatient && (
          <button
            type="button"
            className={`tab-btn${tab === 'register' ? ' tab-btn--active' : ''}`}
            onClick={() => setTab('register')}
          >
            <UserPlus size={14} style={{ verticalAlign: 'middle', marginRight: 5 }} />
            Register Patient
          </button>
        )}
      </div>

      {/* ── Tab: Patient List ── */}
      {tab === 'list' && (
        <>
          <div className="mini-stats-row">
            {(['Active', 'In review', 'Admitted', 'Discharged', 'Emergency'] as Patient['status'][]).map(s => (
              <div key={s} className="mini-stat">
                <Badge variant={statusVariant(s)}>{s}</Badge>
                <strong>{visiblePatients.filter(p => p.status === s).length}</strong>
              </div>
            ))}
            {canRegisterPatient && (
              <button
                type="button"
                className="btn btn--primary btn--sm"
                style={{ marginLeft: 'auto' }}
                onClick={() => setTab('register')}
              >
                <UserPlus size={14} /> Register New Patient
              </button>
            )}
            {canRegisterPatient && (
              <>
                <input ref={csvRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleCSVImport} id="csv-import" />
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => csvRef.current?.click()}>
                  <Upload size={13} /> Import CSV
                </button>
              </>
            )}
          </div>

          <SectionCard noPad>
            <DataTable
              columns={columns}
              data={visiblePatients}
              searchable
              searchKeys={['name', 'id', 'barcode', 'phone', 'email']}
              onRowClick={p => setViewPatient(p)}
            />
          </SectionCard>
        </>
      )}

      {/* ── Tab: Register Patient ── */}
      {tab === 'register' && canRegisterPatient && (
        <SectionCard title="Register New Patient">
          <form onSubmit={(e) => { handleSubmit(e); setTab('list') }} className="form-grid-2">
            <FormField label="Full Name" name="name" value={form.name} onChange={set} required placeholder="Patient full name" />
            <FormField label="Date of Birth" name="dob" type="date" value={form.dob} onChange={set} required />
            <FormField label="Age" name="age" type="number" value={form.age} onChange={set} required min={0} />
            <FormField label="Gender" name="gender" type="select" value={form.gender} onChange={set} required
              options={[{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }, { value: 'Other', label: 'Other' }]} />
            <FormField label="Blood Group" name="bloodGroup" type="select" value={form.bloodGroup} onChange={set}
              options={['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(v => ({ value: v, label: v }))} />
            <FormField label="Phone" name="phone" type="tel" value={form.phone} onChange={set} required placeholder="+233 XX XXX XXXX" />
            <FormField label="Email" name="email" type="email" value={form.email} onChange={set} placeholder="optional" />
            <FormField label="Address" name="address" value={form.address} onChange={set} placeholder="Home address" />
            <FormField label="Emergency Contact" name="emergencyContact" value={form.emergencyContact} onChange={set} required />
            <FormField label="Emergency Phone" name="emergencyPhone" type="tel" value={form.emergencyPhone} onChange={set} required />
            <FormField label="Known Allergies" name="allergies" value={form.allergies} onChange={set} placeholder="None / list drugs" />
            <FormField label="Insurance ID" name="insuranceId" value={form.insuranceId} onChange={set} placeholder="NHIS or policy number" />
            <FormField label="Status" name="status" type="select" value={form.status} onChange={set}
              options={[
                { value: 'Active', label: 'Active' },
                { value: 'In review', label: 'In review' },
                { value: 'Emergency', label: 'Emergency' },
              ]} />
            <FormField label="Assign Doctor" name="assignedDoctor" type="select" value={assignDoctorId}
              onChange={(e) => setAssignDoctorId(e.target.value)}
              options={[{ value: '', label: '— Assign later —' }, ...state.doctors.map(d => ({ value: d.id, label: d.name }))]} />
            <div className="form-actions">
              <button type="button" className="btn btn--ghost" onClick={() => { setForm({ ...EMPTY }); setTab('list') }}>
                Cancel
              </button>
              <button type="submit" className="btn btn--primary">
                <UserPlus size={14} /> Register Patient
              </button>
            </div>
          </form>
        </SectionCard>
      )}

      {/* View patient modal */}
      {viewPatient && (
        <Modal title={`Patient Record — ${viewPatient.name}`} onClose={() => setViewPatient(null)} size="lg">
          <div className="detail-grid">
            <div className="detail-section">
              <h4>Demographics</h4>
              <dl>
                <dt>ID</dt><dd>{viewPatient.id}</dd>
                <dt>Barcode</dt><dd><code>{viewPatient.barcode}</code></dd>
                <dt>Name</dt><dd>{viewPatient.name}</dd>
                <dt>DOB</dt><dd>{viewPatient.dob} (age {viewPatient.age})</dd>
                <dt>Gender</dt><dd>{viewPatient.gender}</dd>
                <dt>Blood Group</dt><dd><Badge variant="red">{viewPatient.bloodGroup}</Badge></dd>
                <dt>Status</dt><dd><Badge variant={statusVariant(viewPatient.status)}>{viewPatient.status}</Badge></dd>
              </dl>
            </div>
            <div className="detail-section">
              <h4>Contact</h4>
              <dl>
                <dt>Phone</dt><dd>{viewPatient.phone}</dd>
                <dt>Email</dt><dd>{viewPatient.email || '—'}</dd>
                <dt>Address</dt><dd>{viewPatient.address}</dd>
                <dt>Emergency Contact</dt><dd>{viewPatient.emergencyContact}</dd>
                <dt>Emergency Phone</dt><dd>{viewPatient.emergencyPhone}</dd>
              </dl>
            </div>
            <div className="detail-section">
              <h4>Medical</h4>
              <dl>
                <dt>Allergies</dt><dd>{viewPatient.allergies}</dd>
                <dt>Insurance ID</dt><dd>{viewPatient.insuranceId || '—'}</dd>
                <dt>Registered</dt><dd>{new Date(viewPatient.registeredAt).toLocaleString()}</dd>
              </dl>
            </div>
            <div className="detail-section">
              <h4>Visit History</h4>
              <p className="empty-hint">
                {state.medicalRecords.filter(r => r.patientId === viewPatient.id).length} medical records ·{' '}
                {state.appointments.filter(a => a.patientId === viewPatient.id).length} appointments
              </p>
            </div>
            <div className="detail-section">
              <h4>Patient QR / Barcode</h4>
              <PatientBarcode patient={viewPatient} size={140} />
            </div>
          </div>
          <div className="form-actions" style={{ marginTop: 16 }}>
            <button type="button" className="btn btn--ghost" onClick={() => downloadRecord(viewPatient)}>
              <Download size={14} /> Download Record
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => setViewPatient(null)}>
              <X size={14} /> Close
            </button>
          </div>
        </Modal>
      )}

      {/* Legacy quick-add modal (kept for programmatic use) */}
      {showForm && (
        <Modal title="Register New Patient" onClose={() => setShowForm(false)} size="lg">
          <form onSubmit={handleSubmit} className="form-grid-2">
            <FormField label="Full Name" name="name" value={form.name} onChange={set} required placeholder="Patient full name" />
            <FormField label="Date of Birth" name="dob" type="date" value={form.dob} onChange={set} required />
            <FormField label="Age" name="age" type="number" value={form.age} onChange={set} required min={0} />
            <FormField label="Gender" name="gender" type="select" value={form.gender} onChange={set} required
              options={[{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }, { value: 'Other', label: 'Other' }]} />
            <FormField label="Blood Group" name="bloodGroup" type="select" value={form.bloodGroup} onChange={set}
              options={['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(v => ({ value: v, label: v }))} />
            <FormField label="Phone" name="phone" type="tel" value={form.phone} onChange={set} required placeholder="+233 XX XXX XXXX" />
            <FormField label="Email" name="email" type="email" value={form.email} onChange={set} placeholder="optional" />
            <FormField label="Address" name="address" value={form.address} onChange={set} placeholder="Home address" />
            <FormField label="Emergency Contact" name="emergencyContact" value={form.emergencyContact} onChange={set} required />
            <FormField label="Emergency Phone" name="emergencyPhone" type="tel" value={form.emergencyPhone} onChange={set} required />
            <FormField label="Known Allergies" name="allergies" value={form.allergies} onChange={set} placeholder="None / list drugs" />
            <FormField label="Insurance ID" name="insuranceId" value={form.insuranceId} onChange={set} placeholder="NHIS or policy number" />
            <FormField label="Status" name="status" type="select" value={form.status} onChange={set}
              options={[{ value: 'Active', label: 'Active' }, { value: 'In review', label: 'In review' }, { value: 'Emergency', label: 'Emergency' }]} />
            <FormField label="Assign Doctor" name="assignedDoctor" type="select" value={assignDoctorId}
              onChange={(e) => setAssignDoctorId(e.target.value)}
              options={[{ value: '', label: '— Assign later —' }, ...state.doctors.map(d => ({ value: d.id, label: d.name }))]} />
            <div className="form-actions">
              <button type="button" className="btn btn--ghost" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn--primary">Register Patient</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
