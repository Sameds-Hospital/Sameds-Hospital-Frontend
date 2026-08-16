import { useState, type FormEvent, type ChangeEvent } from 'react'
import { AlertTriangle, Plus } from 'lucide-react'
import { useHMS } from '../store/HMSContext'
import { DataTable, type Column } from '../components/ui/DataTable'
import { Modal } from '../components/ui/Modal'
import { FormField } from '../components/ui/FormField'
import { Badge } from '../components/ui/Badge'
import { PageHeader } from '../components/ui/PageHeader'
import { SectionCard } from '../components/ui/SectionCard'
import type { EmergencyCase, Ambulance } from '../types'

type Tab = 'cases' | 'ambulances'

export function Emergency() {
  const { state, dispatch, nextId } = useHMS()
  const [tab, setTab] = useState<Tab>('cases')
  const [showCase, setShowCase] = useState(false)
  const [showAmb, setShowAmb] = useState(false)
  const [caseForm, setCaseForm] = useState({ patientId: '', patientName: '', arrivalMode: 'Walk-in' as EmergencyCase['arrivalMode'], triageLevel: 'P3 - Less Urgent' as EmergencyCase['triageLevel'], chiefComplaint: '', attendingDoctor: '', notes: '' })
  const [ambForm, setAmbForm] = useState({ vehicleNumber: '', driver: '', paramedic: '', patientName: '', pickup: '', destination: '' })

  const setC = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setCaseForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const setA = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setAmbForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submitCase = (e: FormEvent) => {
    e.preventDefault()
    const patient = state.patients.find(p => p.id === caseForm.patientId)
    const ec: EmergencyCase = {
      id: nextId('EM', state.emergencyCases),
      patientId: caseForm.patientId,
      patientName: patient?.name ?? caseForm.patientName,
      arrivalMode: caseForm.arrivalMode,
      triageLevel: caseForm.triageLevel,
      chiefComplaint: caseForm.chiefComplaint,
      attendingDoctor: caseForm.attendingDoctor,
      treatmentStarted: '',
      disposition: 'Pending',
      notes: caseForm.notes,
      registeredAt: new Date().toISOString(),
    }
    dispatch({ type: 'ADD_EMERGENCY_CASE', payload: ec })
    setShowCase(false)
  }

  const submitAmb = (e: FormEvent) => {
    e.preventDefault()
    const amb: Ambulance = {
      id: nextId('AMB', state.ambulances),
      patientId: '', arrivedAt: '',
      dispatchedAt: new Date().toISOString(),
      status: 'Dispatched',
      ...ambForm,
    }
    dispatch({ type: 'ADD_AMBULANCE', payload: amb })
    setShowAmb(false)
  }

  const updateDisposition = (ec: EmergencyCase, disposition: EmergencyCase['disposition']) =>
    dispatch({ type: 'UPDATE_EMERGENCY_CASE', payload: { ...ec, disposition } })

  const triageBadge = (level: string) => {
    if (level.startsWith('P1')) return 'red'
    if (level.startsWith('P2')) return 'orange'
    if (level.startsWith('P3')) return 'yellow'
    return 'gray'
  }

  const caseCols: Column<EmergencyCase>[] = [
    { key: 'id', label: 'ID', width: '100px' },
    { key: 'patientName', label: 'Patient', sortable: true },
    { key: 'arrivalMode', label: 'Arrival', badge: true },
    { key: 'triageLevel', label: 'Triage', render: ec => <Badge variant={triageBadge(ec.triageLevel)}>{ec.triageLevel}</Badge> },
    { key: 'chiefComplaint', label: 'Chief Complaint' },
    { key: 'attendingDoctor', label: 'Doctor' },
    { key: 'registeredAt', label: 'Arrived', render: ec => new Date(ec.registeredAt).toLocaleTimeString() },
    { key: 'disposition', label: 'Disposition', badge: true },
    {
      key: 'actions', label: '', width: '130px',
      render: row => row.disposition === 'Pending' ? (
        <div className="row-actions">
          <button type="button" className="icon-btn icon-btn--blue" onClick={e => { e.stopPropagation(); updateDisposition(row, 'Admitted') }}>Admit</button>
          <button type="button" className="icon-btn icon-btn--green" onClick={e => { e.stopPropagation(); updateDisposition(row, 'Discharged') }}>DC</button>
        </div>
      ) : null,
    },
  ]

  const ambCols: Column<Ambulance>[] = [
    { key: 'id', label: 'ID', width: '100px' },
    { key: 'vehicleNumber', label: 'Vehicle No.' },
    { key: 'driver', label: 'Driver' },
    { key: 'paramedic', label: 'Paramedic' },
    { key: 'patientName', label: 'Patient' },
    { key: 'pickup', label: 'Pickup' },
    { key: 'destination', label: 'Destination' },
    { key: 'dispatchedAt', label: 'Dispatched', render: a => new Date(a.dispatchedAt).toLocaleTimeString() },
    { key: 'status', label: 'Status', badge: true },
  ]

  const p1Count = state.emergencyCases.filter(e => e.triageLevel.startsWith('P1')).length
  const p2Count = state.emergencyCases.filter(e => e.triageLevel.startsWith('P2')).length
  const openCases = state.emergencyCases.filter(e => e.disposition === 'Pending').length

  return (
    <div className="module-page">
      <PageHeader
        title="Emergency Department"
        subtitle="Triage, emergency cases and ambulance dispatch"
        icon={<AlertTriangle size={22} />}
        actions={
          <div className="btn-group">
            <button type="button" className="btn btn--danger" onClick={() => setShowCase(true)}><Plus size={14} /> Register Emergency</button>
            <button type="button" className="btn btn--secondary" onClick={() => setShowAmb(true)}><Plus size={14} /> Dispatch Ambulance</button>
          </div>
        }
      />

      <div className="mini-stats-row">
        <div className="mini-stat"><Badge variant="red">P1 Critical</Badge><strong>{p1Count}</strong></div>
        <div className="mini-stat"><Badge variant="orange">P2 Urgent</Badge><strong>{p2Count}</strong></div>
        <div className="mini-stat"><Badge variant="yellow">Open Cases</Badge><strong>{openCases}</strong></div>
        <div className="mini-stat"><Badge variant="green">Resolved</Badge><strong>{state.emergencyCases.filter(e => e.disposition !== 'Pending').length}</strong></div>
        <div className="mini-stat"><span>Ambulances</span><strong>{state.ambulances.length}</strong></div>
      </div>

      <div className="tab-bar">
        <button type="button" className={`tab-btn${tab === 'cases' ? ' tab-btn--active' : ''}`} onClick={() => setTab('cases')}>Cases ({state.emergencyCases.length})</button>
        <button type="button" className={`tab-btn${tab === 'ambulances' ? ' tab-btn--active' : ''}`} onClick={() => setTab('ambulances')}>Ambulances ({state.ambulances.length})</button>
      </div>

      <SectionCard noPad>
        {tab === 'cases' && <DataTable columns={caseCols} data={state.emergencyCases} searchable searchKeys={['patientName','chiefComplaint','attendingDoctor']} />}
        {tab === 'ambulances' && <DataTable columns={ambCols} data={state.ambulances} searchable searchKeys={['vehicleNumber','driver','patientName']} />}
      </SectionCard>

      {showCase && (
        <Modal title="Register Emergency Case" onClose={() => setShowCase(false)} size="md">
          <form onSubmit={submitCase} className="form-grid-2">
            <FormField label="Patient (if registered)" name="patientId" type="select" value={caseForm.patientId} onChange={setC}
              options={[{ value: '', label: 'Walk-in / Unregistered' }, ...state.patients.map(p => ({ value: p.id, label: `${p.id} – ${p.name}` }))]} />
            <FormField label="Patient Name (if unregistered)" name="patientName" value={caseForm.patientName} onChange={setC} placeholder="Name of unregistered patient" />
            <FormField label="Arrival Mode" name="arrivalMode" type="select" value={caseForm.arrivalMode} onChange={setC}
              options={['Walk-in','Ambulance','Referred','Police'].map(v => ({ value: v, label: v }))} />
            <FormField label="Triage Level" name="triageLevel" type="select" value={caseForm.triageLevel} onChange={setC}
              options={['P1 - Critical','P2 - Urgent','P3 - Less Urgent','P4 - Non-urgent'].map(v => ({ value: v, label: v }))} />
            <FormField label="Chief Complaint" name="chiefComplaint" value={caseForm.chiefComplaint} onChange={setC} required />
            <FormField label="Attending Doctor" name="attendingDoctor" type="select" value={caseForm.attendingDoctor} onChange={setC}
              options={state.doctors.map(d => ({ value: d.name, label: d.name }))} />
            <FormField label="Clinical Notes" name="notes" type="textarea" value={caseForm.notes} onChange={setC} />
            <div className="form-actions">
              <button type="button" className="btn btn--ghost" onClick={() => setShowCase(false)}>Cancel</button>
              <button type="submit" className="btn btn--danger">Register Emergency</button>
            </div>
          </form>
        </Modal>
      )}

      {showAmb && (
        <Modal title="Dispatch Ambulance" onClose={() => setShowAmb(false)} size="md">
          <form onSubmit={submitAmb} className="form-grid-2">
            <FormField label="Vehicle Number" name="vehicleNumber" value={ambForm.vehicleNumber} onChange={setA} required />
            <FormField label="Driver" name="driver" value={ambForm.driver} onChange={setA} required />
            <FormField label="Paramedic" name="paramedic" value={ambForm.paramedic} onChange={setA} required />
            <FormField label="Patient Name" name="patientName" value={ambForm.patientName} onChange={setA} />
            <FormField label="Pickup Location" name="pickup" value={ambForm.pickup} onChange={setA} required />
            <FormField label="Destination" name="destination" value={ambForm.destination} onChange={setA} required />
            <div className="form-actions">
              <button type="button" className="btn btn--ghost" onClick={() => setShowAmb(false)}>Cancel</button>
              <button type="submit" className="btn btn--primary">Dispatch</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
