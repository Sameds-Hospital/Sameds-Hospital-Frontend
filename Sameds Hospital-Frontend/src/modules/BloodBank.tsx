import { useState, type FormEvent, type ChangeEvent } from 'react'
import { Droplets, Plus } from 'lucide-react'
import { useHMS } from '../store/HMSContext'
import { DataTable, type Column } from '../components/ui/DataTable'
import { Modal } from '../components/ui/Modal'
import { FormField } from '../components/ui/FormField'
import { Badge } from '../components/ui/Badge'
import { PageHeader } from '../components/ui/PageHeader'
import { SectionCard } from '../components/ui/SectionCard'
import type { BloodDonor, BloodUnit, BloodRequest } from '../types'

type Tab = 'inventory' | 'donors' | 'requests'

const BLOOD_TYPES = ['A+','A-','B+','B-','AB+','AB-','O+','O-'] as const
const COMPONENTS = ['Whole Blood','RBC','Plasma','Platelets','Cryoprecipitate'] as const

export function BloodBank() {
  const { state, dispatch, nextId } = useHMS()
  const [tab, setTab] = useState<Tab>('inventory')
  const [showDonor, setShowDonor] = useState(false)
  const [showUnit, setShowUnit] = useState(false)
  const [showRequest, setShowRequest] = useState(false)

  const [donorForm, setDonorForm] = useState({ name: '', bloodType: 'O+' as BloodDonor['bloodType'], phone: '', email: '', lastDonated: '' })
  const [unitForm, setUnitForm] = useState({ bloodType: 'O+' as BloodUnit['bloodType'], component: 'Whole Blood' as BloodUnit['component'], donorId: '', donorName: '', expiryDate: '', bagNumber: '' })
  const [reqForm, setReqForm] = useState({ patientId: '', bloodType: 'O+', component: 'Whole Blood', unitsRequired: '1', requestedBy: '', urgency: 'Routine' as BloodRequest['urgency'] })

  const setDon = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setDonorForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const setUni = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setUnitForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const setReq = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setReqForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submitDonor = (e: FormEvent) => {
    e.preventDefault()
    const d: BloodDonor = { id: nextId('BDR', state.bloodDonors), ...donorForm, totalDonations: 1, status: 'Eligible' }
    dispatch({ type: 'ADD_BLOOD_DONOR', payload: d })
    setShowDonor(false)
  }

  const submitUnit = (e: FormEvent) => {
    e.preventDefault()
    const donor = state.bloodDonors.find(d => d.id === unitForm.donorId)
    const u: BloodUnit = { id: nextId('BU', state.bloodUnits), ...unitForm, donorName: donor?.name ?? unitForm.donorName, collectedAt: new Date().toISOString(), status: 'Available' }
    dispatch({ type: 'ADD_BLOOD_UNIT', payload: u })
    setShowUnit(false)
  }

  const submitRequest = (e: FormEvent) => {
    e.preventDefault()
    const patient = state.patients.find(p => p.id === reqForm.patientId)
    const r: BloodRequest = { id: nextId('BRQ', state.bloodRequests), patientName: patient?.name ?? '', requestedAt: new Date().toISOString(), status: 'Pending', ...reqForm, unitsRequired: Number(reqForm.unitsRequired) }
    dispatch({ type: 'ADD_BLOOD_REQUEST', payload: r })
    setShowRequest(false)
  }

  const issueUnit = (unit: BloodUnit) => dispatch({ type: 'UPDATE_BLOOD_UNIT', payload: { ...unit, status: 'Issued' } })
  const approveRequest = (req: BloodRequest) => dispatch({ type: 'UPDATE_BLOOD_REQUEST', payload: { ...req, status: 'Approved' } })

  // Blood type availability grid
  const bloodInventory = BLOOD_TYPES.map(bt => ({
    type: bt,
    available: state.bloodUnits.filter(u => u.bloodType === bt && u.status === 'Available').length,
    reserved: state.bloodUnits.filter(u => u.bloodType === bt && u.status === 'Reserved').length,
  }))

  const unitCols: Column<BloodUnit>[] = [
    { key: 'id', label: 'Bag No.', width: '110px' },
    { key: 'bloodType', label: 'Blood Type', render: u => <Badge variant="red">{u.bloodType}</Badge> },
    { key: 'component', label: 'Component', badge: true },
    { key: 'donorName', label: 'Donor' },
    { key: 'collectedAt', label: 'Collected', render: u => new Date(u.collectedAt).toLocaleDateString() },
    { key: 'expiryDate', label: 'Expiry', sortable: true },
    { key: 'status', label: 'Status', badge: true },
    { key: 'actions', label: '', width: '70px', render: row => row.status === 'Available' ? <button type="button" className="icon-btn icon-btn--blue" onClick={e => { e.stopPropagation(); issueUnit(row) }}>Issue</button> : null },
  ]

  const donorCols: Column<BloodDonor>[] = [
    { key: 'id', label: 'ID', width: '100px' },
    { key: 'name', label: 'Donor', sortable: true },
    { key: 'bloodType', label: 'Blood Type', render: d => <Badge variant="red">{d.bloodType}</Badge> },
    { key: 'phone', label: 'Phone' },
    { key: 'lastDonated', label: 'Last Donated', sortable: true },
    { key: 'totalDonations', label: 'Donations', sortable: true },
    { key: 'status', label: 'Status', badge: true },
  ]

  const reqCols: Column<BloodRequest>[] = [
    { key: 'id', label: 'ID', width: '100px' },
    { key: 'patientName', label: 'Patient', sortable: true },
    { key: 'bloodType', label: 'Blood Type', render: r => <Badge variant="red">{r.bloodType}</Badge> },
    { key: 'component', label: 'Component' },
    { key: 'unitsRequired', label: 'Units' },
    { key: 'requestedBy', label: 'Requested By' },
    { key: 'urgency', label: 'Urgency', badge: true },
    { key: 'requestedAt', label: 'Date', render: r => new Date(r.requestedAt).toLocaleDateString() },
    { key: 'status', label: 'Status', badge: true },
    { key: 'actions', label: '', width: '80px', render: row => row.status === 'Pending' ? <button type="button" className="icon-btn icon-btn--green" onClick={e => { e.stopPropagation(); approveRequest(row) }}>Approve</button> : null },
  ]

  return (
    <div className="module-page">
      <PageHeader title="Blood Bank Management" subtitle="Donors, inventory, requests and issue tracking" icon={<Droplets size={22} />}
        actions={
          <div className="btn-group">
            <button type="button" className="btn btn--primary" onClick={() => setShowUnit(true)}><Plus size={14} /> Add Unit</button>
            <button type="button" className="btn btn--secondary" onClick={() => setShowDonor(true)}><Plus size={14} /> Register Donor</button>
            <button type="button" className="btn btn--secondary" onClick={() => setShowRequest(true)}><Plus size={14} /> Blood Request</button>
          </div>
        }
      />

      <SectionCard title="Blood Type Availability">
        <div className="blood-grid">
          {bloodInventory.map(b => (
            <div key={b.type} className={`blood-card${b.available === 0 ? ' blood-card--empty' : b.available <= 2 ? ' blood-card--low' : ''}`}>
              <strong>{b.type}</strong>
              <span className="blood-card__count">{b.available}</span>
              <span>available</span>
              {b.reserved > 0 && <span className="blood-card__reserved">{b.reserved} reserved</span>}
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="mini-stats-row">
        <div className="mini-stat"><span>Total Units</span><strong>{state.bloodUnits.length}</strong></div>
        <div className="mini-stat"><Badge variant="green">Available</Badge><strong>{state.bloodUnits.filter(u => u.status === 'Available').length}</strong></div>
        <div className="mini-stat"><Badge variant="yellow">Reserved</Badge><strong>{state.bloodUnits.filter(u => u.status === 'Reserved').length}</strong></div>
        <div className="mini-stat"><Badge variant="red">Expired</Badge><strong>{state.bloodUnits.filter(u => u.status === 'Expired').length}</strong></div>
        <div className="mini-stat"><span>Registered Donors</span><strong>{state.bloodDonors.length}</strong></div>
        <div className="mini-stat"><Badge variant="yellow">Pending Requests</Badge><strong>{state.bloodRequests.filter(r => r.status === 'Pending').length}</strong></div>
      </div>

      <div className="tab-bar">
        <button type="button" className={`tab-btn${tab === 'inventory' ? ' tab-btn--active' : ''}`} onClick={() => setTab('inventory')}>Inventory ({state.bloodUnits.length})</button>
        <button type="button" className={`tab-btn${tab === 'donors' ? ' tab-btn--active' : ''}`} onClick={() => setTab('donors')}>Donors ({state.bloodDonors.length})</button>
        <button type="button" className={`tab-btn${tab === 'requests' ? ' tab-btn--active' : ''}`} onClick={() => setTab('requests')}>Requests ({state.bloodRequests.length})</button>
      </div>

      <SectionCard noPad>
        {tab === 'inventory' && <DataTable columns={unitCols} data={state.bloodUnits} searchable searchKeys={['bloodType','component','donorName']} />}
        {tab === 'donors' && <DataTable columns={donorCols} data={state.bloodDonors} searchable searchKeys={['name','bloodType']} />}
        {tab === 'requests' && <DataTable columns={reqCols} data={state.bloodRequests} searchable searchKeys={['patientName','bloodType']} />}
      </SectionCard>

      {showDonor && (
        <Modal title="Register Blood Donor" onClose={() => setShowDonor(false)} size="md">
          <form onSubmit={submitDonor} className="form-grid-2">
            <FormField label="Full Name" name="name" value={donorForm.name} onChange={setDon} required />
            <FormField label="Blood Type" name="bloodType" type="select" value={donorForm.bloodType} onChange={setDon} options={BLOOD_TYPES.map(v => ({ value: v, label: v }))} />
            <FormField label="Phone" name="phone" type="tel" value={donorForm.phone} onChange={setDon} required />
            <FormField label="Email" name="email" type="email" value={donorForm.email} onChange={setDon} />
            <FormField label="Last Donated" name="lastDonated" type="date" value={donorForm.lastDonated} onChange={setDon} />
            <div className="form-actions">
              <button type="button" className="btn btn--ghost" onClick={() => setShowDonor(false)}>Cancel</button>
              <button type="submit" className="btn btn--primary">Register Donor</button>
            </div>
          </form>
        </Modal>
      )}

      {showUnit && (
        <Modal title="Add Blood Unit" onClose={() => setShowUnit(false)} size="md">
          <form onSubmit={submitUnit} className="form-grid-2">
            <FormField label="Blood Type" name="bloodType" type="select" value={unitForm.bloodType} onChange={setUni} options={BLOOD_TYPES.map(v => ({ value: v, label: v }))} />
            <FormField label="Component" name="component" type="select" value={unitForm.component} onChange={setUni} options={COMPONENTS.map(v => ({ value: v, label: v }))} />
            <FormField label="Donor" name="donorId" type="select" value={unitForm.donorId} onChange={setUni} options={[{ value: '', label: 'External / anonymous' }, ...state.bloodDonors.map(d => ({ value: d.id, label: `${d.name} (${d.bloodType})` }))]} />
            <FormField label="Bag Number" name="bagNumber" value={unitForm.bagNumber} onChange={setUni} required />
            <FormField label="Expiry Date" name="expiryDate" type="date" value={unitForm.expiryDate} onChange={setUni} required />
            <div className="form-actions">
              <button type="button" className="btn btn--ghost" onClick={() => setShowUnit(false)}>Cancel</button>
              <button type="submit" className="btn btn--primary">Add Unit</button>
            </div>
          </form>
        </Modal>
      )}

      {showRequest && (
        <Modal title="Blood Request" onClose={() => setShowRequest(false)} size="md">
          <form onSubmit={submitRequest} className="form-grid-2">
            <FormField label="Patient" name="patientId" type="select" value={reqForm.patientId} onChange={setReq} options={state.patients.map(p => ({ value: p.id, label: `${p.id} – ${p.name}` }))} />
            <FormField label="Blood Type" name="bloodType" type="select" value={reqForm.bloodType} onChange={setReq} options={BLOOD_TYPES.map(v => ({ value: v, label: v }))} />
            <FormField label="Component" name="component" type="select" value={reqForm.component} onChange={setReq} options={COMPONENTS.map(v => ({ value: v, label: v }))} />
            <FormField label="Units Required" name="unitsRequired" type="number" value={reqForm.unitsRequired} onChange={setReq} required min={1} />
            <FormField label="Requested By" name="requestedBy" value={reqForm.requestedBy} onChange={setReq} required />
            <FormField label="Urgency" name="urgency" type="select" value={reqForm.urgency} onChange={setReq} options={['Routine','Urgent','Emergency'].map(v => ({ value: v, label: v }))} />
            <div className="form-actions">
              <button type="button" className="btn btn--ghost" onClick={() => setShowRequest(false)}>Cancel</button>
              <button type="submit" className="btn btn--primary">Submit Request</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
