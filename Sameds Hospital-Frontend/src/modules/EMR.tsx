import { useState, type FormEvent, type ChangeEvent } from 'react'
import { FileText, Plus, Activity, Syringe, Pill, FileDown } from 'lucide-react'
import { useHMS } from '../store/HMSContext'
import { DataTable, type Column } from '../components/ui/DataTable'
import { Modal } from '../components/ui/Modal'
import { FormField } from '../components/ui/FormField'
import { PageHeader } from '../components/ui/PageHeader'
import { SectionCard } from '../components/ui/SectionCard'
import { exportPrescriptionPDF } from '../utils/pdfExport'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { canViewPatientRecord, getVisiblePatientIdsForUser } from '../utils/access'
import type { MedicalRecord, VitalSign, Prescription, Immunization } from '../types'

type Tab = 'records' | 'vitals' | 'prescriptions' | 'immunizations' | 'diagnoses'

export function EMR() {
  const { state, dispatch, nextId, currentUser, addAuditLog } = useHMS()
  const [tab, setTab] = useState<Tab>('records')
  const [showRecord, setShowRecord] = useState(false)
  const [showVitals, setShowVitals] = useState(false)
  const [attachments, setAttachments] = useState<string>('')
  const [showRx, setShowRx] = useState(false)
  const [showImm, setShowImm] = useState(false)

  const [recForm, setRecForm] = useState({ patientId: '', doctorName: currentUser?.name ?? '', visitType: 'OPD' as MedicalRecord['visitType'], chiefComplaint: '', diagnosis: '', treatment: '', vitals: '', clinicalNotes: '', followUpDate: '' })
  const [vitForm, setVitForm] = useState({ patientId: '', temperature: '', bloodPressure: '', heartRate: '', respiratoryRate: '', oxygenSaturation: '', weight: '', height: '' })
  const [rxForm, setRxForm] = useState({ patientId: '', doctorName: currentUser?.name ?? '', medication: '', dosage: '', frequency: '', duration: '', instructions: '' })
  const [immForm, setImmForm] = useState({ patientId: '', patientName: '', vaccine: '', dose: '', administeredBy: currentUser?.name ?? '', site: '', lotNumber: '', nextDueDate: '' })

  const setRec = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setRecForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const setVit = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setVitForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const setRx = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setRxForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const setImm = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setImmForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submitRecord = (e: FormEvent) => {
    e.preventDefault()
    const patient = state.patients.find(p => p.id === recForm.patientId)
    const rec: MedicalRecord = { id: nextId('MR', state.medicalRecords), patientName: patient?.name ?? '', doctorId: '', createdAt: new Date().toISOString(), attachments: attachments.split('\n').map(i => i.trim()).filter(Boolean), ...recForm }
    dispatch({ type: 'ADD_MEDICAL_RECORD', payload: rec })
    addAuditLog('CREATE_EMR', 'EMR', rec.id)
    setAttachments('')
    setShowRecord(false)
  }

  const submitVitals = (e: FormEvent) => {
    e.preventDefault()
    const vs: VitalSign = { id: nextId('VS', state.vitalSigns), recordedBy: currentUser?.name ?? '', recordedAt: new Date().toISOString(), ...vitForm }
    dispatch({ type: 'ADD_VITAL_SIGN', payload: vs })
    setShowVitals(false)
  }

  const submitRx = (e: FormEvent) => {
    e.preventDefault()
    const patient = state.patients.find(p => p.id === rxForm.patientId)
    const rx: Prescription = { id: nextId('RX', state.prescriptions), patientName: patient?.name ?? '', prescribedAt: new Date().toISOString(), status: 'Active', ...rxForm }
    dispatch({ type: 'ADD_PRESCRIPTION', payload: rx })
    setShowRx(false)
  }

  const submitImm = (e: FormEvent) => {
    e.preventDefault()
    const imm: Immunization = { id: nextId('IMM', state.immunizations), administeredAt: new Date().toISOString(), status: 'Administered', ...immForm }
    dispatch({ type: 'ADD_IMMUNIZATION', payload: imm })
    setShowImm(false)
  }

  const visiblePatientIds = currentUser ? getVisiblePatientIdsForUser(currentUser, state) : []
  const patientOptions = state.patients
    .filter(p => visiblePatientIds.includes(p.id) || currentUser?.role === 'Admin' || currentUser?.role === 'Nurse' || currentUser?.role === 'Receptionist' || currentUser?.role === 'Pharmacist' || currentUser?.role === 'Cashier' || currentUser?.role === 'LabTechnician' || currentUser?.role === 'Radiologist')
    .map(p => ({ value: p.id, label: `${p.id} – ${p.name}` }))

  const [vitalPatientFilter, setVitalPatientFilter] = useState('')

  const visibleVitals = state.vitalSigns.filter(vital => currentUser ? canViewPatientRecord(currentUser, vital.patientId, state) : false)
  const visibleRecords = state.medicalRecords.filter(record => currentUser ? canViewPatientRecord(currentUser, record.patientId, state) : false)
  const visiblePrescriptions = state.prescriptions.filter(prescription => currentUser ? canViewPatientRecord(currentUser, prescription.patientId, state) : false)
  const visibleImmunizations = state.immunizations.filter(immunization => currentUser ? canViewPatientRecord(currentUser, immunization.patientId, state) : false)

  const vitalsChartData = visibleVitals
    .filter(v => !vitalPatientFilter || v.patientId === vitalPatientFilter)
    .slice(-20)
    .map(v => ({
      time: new Date(v.recordedAt).toLocaleDateString(),
      temp: parseFloat(v.temperature) || null,
      hr: parseFloat(v.heartRate) || null,
      spo2: parseFloat(v.oxygenSaturation) || null,
      systolic: v.bloodPressure ? parseInt(v.bloodPressure.split('/')[0]) || null : null,
    }))

  const recCols: Column<MedicalRecord>[] = [
    { key: 'id', label: 'ID', width: '100px' },
    { key: 'patientName', label: 'Patient', sortable: true },
    { key: 'doctorName', label: 'Doctor', sortable: true },
    { key: 'visitType', label: 'Type', badge: true },
    { key: 'chiefComplaint', label: 'Chief Complaint' },
    { key: 'diagnosis', label: 'Diagnosis' },
    { key: 'createdAt', label: 'Date', render: r => new Date(r.createdAt).toLocaleDateString() },
  ]

  const vitCols: Column<VitalSign>[] = [
    { key: 'id', label: 'ID', width: '100px' },
    { key: 'patientId', label: 'Patient ID' },
    { key: 'temperature', label: 'Temp (°C)' },
    { key: 'bloodPressure', label: 'BP' },
    { key: 'heartRate', label: 'HR' },
    { key: 'oxygenSaturation', label: 'SpO2 (%)' },
    { key: 'weight', label: 'Wt (kg)' },
    { key: 'recordedBy', label: 'By' },
    { key: 'recordedAt', label: 'Time', render: v => new Date(v.recordedAt).toLocaleString() },
  ]

  const rxCols: Column<Prescription>[] = [
    { key: 'id', label: 'ID', width: '100px' },
    { key: 'patientName', label: 'Patient', sortable: true },
    { key: 'doctorName', label: 'Doctor' },
    { key: 'medication', label: 'Medication', sortable: true },
    { key: 'dosage', label: 'Dosage' },
    { key: 'frequency', label: 'Frequency' },
    { key: 'duration', label: 'Duration' },
    { key: 'status', label: 'Status', badge: true },
    {
      key: 'actions', label: '', width: '60px',
      render: row => (
        <button type="button" className="icon-btn" title="Export PDF" onClick={e => { e.stopPropagation(); exportPrescriptionPDF(row) }}><FileDown size={14} /></button>
      ),
    },
  ]

  const immCols: Column<Immunization>[] = [
    { key: 'id', label: 'ID', width: '100px' },
    { key: 'patientName', label: 'Patient', sortable: true },
    { key: 'vaccine', label: 'Vaccine', sortable: true },
    { key: 'dose', label: 'Dose' },
    { key: 'administeredBy', label: 'By' },
    { key: 'administeredAt', label: 'Date', render: i => new Date(i.administeredAt).toLocaleDateString() },
    { key: 'nextDueDate', label: 'Next Due' },
    { key: 'status', label: 'Status', badge: true },
  ]

  const dxCols: Column<typeof state.diagnoses[0]>[] = [
    { key: 'id', label: 'ID', width: '100px' },
    { key: 'patientId', label: 'Patient ID' },
    { key: 'doctorName', label: 'Doctor' },
    { key: 'icdCode', label: 'ICD Code', width: '90px' },
    { key: 'description', label: 'Description' },
    { key: 'severity', label: 'Severity', badge: true },
    { key: 'status', label: 'Status', badge: true },
    { key: 'recordedAt', label: 'Date', render: d => new Date(d.recordedAt).toLocaleDateString() },
  ]

  return (
    <div className="module-page">
      <PageHeader
        title="Electronic Medical Records"
        subtitle="Clinical notes, vitals, prescriptions & immunizations"
        icon={<FileText size={22} />}
        actions={
          <div className="btn-group">
            <button type="button" className="btn btn--primary" onClick={() => setShowRecord(true)}><Plus size={14} /> Clinical Note</button>
            <button type="button" className="btn btn--secondary" onClick={() => setShowVitals(true)}><Activity size={14} /> Vitals</button>
            <button type="button" className="btn btn--secondary" onClick={() => setShowRx(true)}><Pill size={14} /> Prescription</button>
            <button type="button" className="btn btn--secondary" onClick={() => setShowImm(true)}><Syringe size={14} /> Immunization</button>
          </div>
        }
      />

      <div className="tab-bar">
        {(['records','vitals','prescriptions','immunizations','diagnoses'] as Tab[]).map(t => (
          <button key={t} type="button" className={`tab-btn${tab === t ? ' tab-btn--active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <SectionCard noPad>
        {tab === 'records' && <DataTable columns={recCols} data={visibleRecords} searchable searchKeys={['patientName','doctorName','diagnosis']} />}
        {tab === 'vitals' && (
          <>
            <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <label className="form-label" style={{ whiteSpace: 'nowrap' }}>Filter by patient:</label>
              <select className="form-control" style={{ maxWidth: 260 }} value={vitalPatientFilter} onChange={e => setVitalPatientFilter(e.target.value)}>
                <option value="">All patients</option>
                {state.patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            {vitalsChartData.length > 0 && (
              <div style={{ padding: '0 16px 16px' }}>
                <p className="form-label" style={{ marginBottom: 8 }}>Trend (last 20 readings)</p>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={vitalsChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: '#1e2d3d', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }} />
                    <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 11 }} />
                    <Line type="monotone" dataKey="temp" stroke="#f59e0b" name="Temp °C" dot={false} strokeWidth={2} connectNulls />
                    <Line type="monotone" dataKey="hr" stroke="#3b82f6" name="Heart Rate" dot={false} strokeWidth={2} connectNulls />
                    <Line type="monotone" dataKey="spo2" stroke="#22c55e" name="SpO2 %" dot={false} strokeWidth={2} connectNulls />
                    <Line type="monotone" dataKey="systolic" stroke="#ef4444" name="BP Systolic" dot={false} strokeWidth={2} connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
            <DataTable columns={vitCols} data={visibleVitals.filter(v => !vitalPatientFilter || v.patientId === vitalPatientFilter)} searchable searchKeys={['patientId','recordedBy']} />
          </>
        )}
        {tab === 'prescriptions' && <DataTable columns={rxCols} data={visiblePrescriptions} searchable searchKeys={['patientName','medication','doctorName']} />}
        {tab === 'immunizations' && <DataTable columns={immCols} data={visibleImmunizations} searchable searchKeys={['patientName','vaccine']} />}
        {tab === 'diagnoses' && <DataTable columns={dxCols} data={state.diagnoses} searchable searchKeys={['patientId','description','icdCode']} />}
      </SectionCard>

      {/* Clinical note modal */}
      {showRecord && (
        <Modal title="New Clinical Note" onClose={() => setShowRecord(false)} size="lg">
          <form onSubmit={submitRecord} className="form-grid-2">
            <FormField label="Patient" name="patientId" type="select" value={recForm.patientId} onChange={setRec} required options={patientOptions} />
            <FormField label="Doctor" name="doctorName" value={recForm.doctorName} onChange={setRec} required />
            <FormField label="Visit Type" name="visitType" type="select" value={recForm.visitType} onChange={setRec}
              options={['OPD','IPD','Emergency','Telemedicine'].map(v => ({ value: v, label: v }))} />
            <FormField label="Follow-up Date" name="followUpDate" type="date" value={recForm.followUpDate} onChange={setRec} />
            <FormField label="Chief Complaint" name="chiefComplaint" value={recForm.chiefComplaint} onChange={setRec} required />
            <FormField label="Diagnosis" name="diagnosis" value={recForm.diagnosis} onChange={setRec} required />
            <FormField label="Treatment Plan" name="treatment" value={recForm.treatment} onChange={setRec} required />
            <FormField label="Vitals Summary" name="vitals" value={recForm.vitals} onChange={setRec} placeholder="Temp, BP, HR, SpO2" />
            <FormField label="Clinical Notes" name="clinicalNotes" type="textarea" value={recForm.clinicalNotes} onChange={setRec} />
            <FormField label="Attachments" name="attachments" type="textarea" value={attachments} onChange={(e) => setAttachments(e.target.value)} placeholder="One attachment per line" />
            <div className="form-actions">
              <button type="button" className="btn btn--ghost" onClick={() => setShowRecord(false)}>Cancel</button>
              <button type="submit" className="btn btn--primary">Save Record</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Vitals modal */}
      {showVitals && (
        <Modal title="Record Vital Signs" onClose={() => setShowVitals(false)} size="md">
          <form onSubmit={submitVitals} className="form-grid-2">
            <FormField label="Patient" name="patientId" type="select" value={vitForm.patientId} onChange={setVit} required options={patientOptions} />
            <FormField label="Temperature (°C)" name="temperature" value={vitForm.temperature} onChange={setVit} placeholder="e.g. 37.2" />
            <FormField label="Blood Pressure" name="bloodPressure" value={vitForm.bloodPressure} onChange={setVit} placeholder="e.g. 120/80" />
            <FormField label="Heart Rate (bpm)" name="heartRate" value={vitForm.heartRate} onChange={setVit} />
            <FormField label="Respiratory Rate" name="respiratoryRate" value={vitForm.respiratoryRate} onChange={setVit} />
            <FormField label="SpO2 (%)" name="oxygenSaturation" value={vitForm.oxygenSaturation} onChange={setVit} />
            <FormField label="Weight (kg)" name="weight" value={vitForm.weight} onChange={setVit} />
            <FormField label="Height (cm)" name="height" value={vitForm.height} onChange={setVit} />
            <div className="form-actions">
              <button type="button" className="btn btn--ghost" onClick={() => setShowVitals(false)}>Cancel</button>
              <button type="submit" className="btn btn--primary">Save Vitals</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Prescription modal */}
      {showRx && (
        <Modal title="Write Prescription" onClose={() => setShowRx(false)} size="md">
          <form onSubmit={submitRx} className="form-grid-2">
            <FormField label="Patient" name="patientId" type="select" value={rxForm.patientId} onChange={setRx} required options={patientOptions} />
            <FormField label="Doctor" name="doctorName" value={rxForm.doctorName} onChange={setRx} required />
            <FormField label="Medication" name="medication" value={rxForm.medication} onChange={setRx} required placeholder="Drug name and strength" />
            <FormField label="Dosage" name="dosage" value={rxForm.dosage} onChange={setRx} required />
            <FormField label="Frequency" name="frequency" value={rxForm.frequency} onChange={setRx} placeholder="e.g. Once daily" />
            <FormField label="Duration" name="duration" value={rxForm.duration} onChange={setRx} placeholder="e.g. 7 days" />
            <FormField label="Instructions" name="instructions" type="textarea" value={rxForm.instructions} onChange={setRx} />
            <div className="form-actions">
              <button type="button" className="btn btn--ghost" onClick={() => setShowRx(false)}>Cancel</button>
              <button type="submit" className="btn btn--primary">Save Prescription</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Immunization modal */}
      {showImm && (
        <Modal title="Record Immunization" onClose={() => setShowImm(false)} size="md">
          <form onSubmit={submitImm} className="form-grid-2">
            <FormField label="Patient" name="patientId" type="select" value={immForm.patientId} onChange={setImm} required options={patientOptions} />
            <FormField label="Patient Name" name="patientName" value={immForm.patientName} onChange={setImm} />
            <FormField label="Vaccine" name="vaccine" value={immForm.vaccine} onChange={setImm} required />
            <FormField label="Dose" name="dose" value={immForm.dose} onChange={setImm} required placeholder="e.g. Dose 1" />
            <FormField label="Administered By" name="administeredBy" value={immForm.administeredBy} onChange={setImm} required />
            <FormField label="Site" name="site" value={immForm.site} onChange={setImm} placeholder="e.g. Left deltoid" />
            <FormField label="Lot Number" name="lotNumber" value={immForm.lotNumber} onChange={setImm} />
            <FormField label="Next Due Date" name="nextDueDate" type="date" value={immForm.nextDueDate} onChange={setImm} />
            <div className="form-actions">
              <button type="button" className="btn btn--ghost" onClick={() => setShowImm(false)}>Cancel</button>
              <button type="submit" className="btn btn--primary">Record Immunization</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
