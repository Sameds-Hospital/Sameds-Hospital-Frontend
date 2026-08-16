import { useState, type FormEvent, type ChangeEvent } from 'react'
import { Scan, Plus, FileText } from 'lucide-react'
import { useHMS } from '../store/HMSContext'
import { DataTable, type Column } from '../components/ui/DataTable'
import { Modal } from '../components/ui/Modal'
import { FormField } from '../components/ui/FormField'
import { Badge, statusVariant } from '../components/ui/Badge'
import { PageHeader } from '../components/ui/PageHeader'
import { SectionCard } from '../components/ui/SectionCard'
import type { RadiologyRequest, RadiologyReport } from '../types'

type Tab = 'requests' | 'reports'

export function Radiology() {
  const { state, dispatch, nextId, currentUser } = useHMS()
  const [tab, setTab] = useState<Tab>('requests')
  const [showRequest, setShowRequest] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [reqForm, setReqForm] = useState({ patientId: '', requestedBy: currentUser?.name ?? '', examType: 'X-ray' as RadiologyRequest['examType'], bodyPart: '', priority: 'Routine' as RadiologyRequest['priority'], clinicalInfo: '', scheduledAt: new Date().toISOString().slice(0,16) })
  const [repForm, setRepForm] = useState({ requestId: '', patientId: '', examType: '', findings: '', impression: '', recommendation: '', reportedBy: currentUser?.name ?? '' })

  const setReq = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setReqForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const setRep = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setRepForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submitRequest = (e: FormEvent) => {
    e.preventDefault()
    const patient = state.patients.find(p => p.id === reqForm.patientId)
    const req: RadiologyRequest = {
      id: nextId('RAD', state.radiologyRequests),
      patientName: patient?.name ?? '',
      status: 'Requested',
      ...reqForm,
    }
    dispatch({ type: 'ADD_RADIOLOGY_REQUEST', payload: req })
    setShowRequest(false)
  }

  const submitReport = (e: FormEvent) => {
    e.preventDefault()
    const radReq = state.radiologyRequests.find(r => r.id === repForm.requestId)
    const report: RadiologyReport = {
      id: nextId('RRP', state.radiologyReports),
      patientName: radReq?.patientName ?? '',
      reportedAt: new Date().toISOString(),
      ...repForm,
    }
    dispatch({ type: 'ADD_RADIOLOGY_REPORT', payload: report })
    if (radReq) dispatch({ type: 'UPDATE_RADIOLOGY_REQUEST', payload: { ...radReq, status: 'Completed' } })
    setShowReport(false)
  }

  const updateStatus = (req: RadiologyRequest, status: RadiologyRequest['status']) =>
    dispatch({ type: 'UPDATE_RADIOLOGY_REQUEST', payload: { ...req, status } })

  const reqCols: Column<RadiologyRequest>[] = [
    { key: 'id', label: 'ID', width: '100px' },
    { key: 'patientName', label: 'Patient', sortable: true },
    { key: 'requestedBy', label: 'Requested By' },
    { key: 'examType', label: 'Exam Type', badge: true, sortable: true },
    { key: 'bodyPart', label: 'Body Part' },
    { key: 'priority', label: 'Priority', badge: true },
    { key: 'scheduledAt', label: 'Scheduled', render: r => new Date(r.scheduledAt).toLocaleString() },
    { key: 'status', label: 'Status', badge: true, sortable: true },
    {
      key: 'actions', label: '', width: '80px',
      render: row => (
        <div className="row-actions">
          {row.status === 'Requested' && <button type="button" className="icon-btn icon-btn--blue" onClick={e => { e.stopPropagation(); updateStatus(row, 'Scheduled') }}>Sched</button>}
          {row.status === 'Scheduled' && <button type="button" className="icon-btn icon-btn--blue" onClick={e => { e.stopPropagation(); updateStatus(row, 'In Progress') }}>Start</button>}
        </div>
      ),
    },
  ]

  const repCols: Column<RadiologyReport>[] = [
    { key: 'id', label: 'ID', width: '100px' },
    { key: 'patientName', label: 'Patient', sortable: true },
    { key: 'examType', label: 'Exam', sortable: true },
    { key: 'findings', label: 'Findings' },
    { key: 'impression', label: 'Impression' },
    { key: 'recommendation', label: 'Recommendation' },
    { key: 'reportedBy', label: 'Reported By' },
    { key: 'reportedAt', label: 'Date', render: r => new Date(r.reportedAt).toLocaleDateString() },
  ]

  const patientOptions = state.patients.map(p => ({ value: p.id, label: `${p.id} – ${p.name}` }))

  return (
    <div className="module-page">
      <PageHeader
        title="Radiology Management"
        subtitle="X-ray, CT, MRI, Ultrasound and imaging reports"
        icon={<Scan size={22} />}
        actions={
          <div className="btn-group">
            <button type="button" className="btn btn--primary" onClick={() => setShowRequest(true)}><Plus size={14} /> Request Exam</button>
            <button type="button" className="btn btn--secondary" onClick={() => setShowReport(true)}><FileText size={14} /> Write Report</button>
          </div>
        }
      />

      <div className="mini-stats-row">
        {(['Requested','Scheduled','In Progress','Completed','Cancelled'] as RadiologyRequest['status'][]).map(s => (
          <div key={s} className="mini-stat"><Badge variant={statusVariant(s)}>{s}</Badge><strong>{state.radiologyRequests.filter(r => r.status === s).length}</strong></div>
        ))}
      </div>

      <div className="tab-bar">
        <button type="button" className={`tab-btn${tab === 'requests' ? ' tab-btn--active' : ''}`} onClick={() => setTab('requests')}>Exam Requests ({state.radiologyRequests.length})</button>
        <button type="button" className={`tab-btn${tab === 'reports' ? ' tab-btn--active' : ''}`} onClick={() => setTab('reports')}>Reports ({state.radiologyReports.length})</button>
      </div>

      <SectionCard noPad>
        {tab === 'requests' && <DataTable columns={reqCols} data={state.radiologyRequests} searchable searchKeys={['patientName','examType','requestedBy']} />}
        {tab === 'reports' && <DataTable columns={repCols} data={state.radiologyReports} searchable searchKeys={['patientName','examType','reportedBy']} />}
      </SectionCard>

      {showRequest && (
        <Modal title="Request Radiology Exam" onClose={() => setShowRequest(false)} size="md">
          <form onSubmit={submitRequest} className="form-grid-2">
            <FormField label="Patient" name="patientId" type="select" value={reqForm.patientId} onChange={setReq} required options={patientOptions} />
            <FormField label="Requested By" name="requestedBy" value={reqForm.requestedBy} onChange={setReq} required />
            <FormField label="Exam Type" name="examType" type="select" value={reqForm.examType} onChange={setReq}
              options={['X-ray','CT Scan','MRI','Ultrasound','PET Scan','Mammography'].map(v => ({ value: v, label: v }))} />
            <FormField label="Body Part / Region" name="bodyPart" value={reqForm.bodyPart} onChange={setReq} required />
            <FormField label="Priority" name="priority" type="select" value={reqForm.priority} onChange={setReq}
              options={['Routine','Urgent','STAT'].map(v => ({ value: v, label: v }))} />
            <FormField label="Scheduled At" name="scheduledAt" type="date" value={reqForm.scheduledAt.slice(0,10)} onChange={setReq} />
            <FormField label="Clinical Information" name="clinicalInfo" type="textarea" value={reqForm.clinicalInfo} onChange={setReq} />
            <div className="form-actions">
              <button type="button" className="btn btn--ghost" onClick={() => setShowRequest(false)}>Cancel</button>
              <button type="submit" className="btn btn--primary">Request Exam</button>
            </div>
          </form>
        </Modal>
      )}

      {showReport && (
        <Modal title="Write Radiology Report" onClose={() => setShowReport(false)} size="lg">
          <form onSubmit={submitReport} className="form-grid-2">
            <FormField label="Exam Request" name="requestId" type="select" value={repForm.requestId} onChange={setRep} required
              options={state.radiologyRequests.filter(r => r.status !== 'Completed').map(r => ({ value: r.id, label: `${r.id} – ${r.examType} – ${r.patientName}` }))} />
            <FormField label="Exam Type" name="examType" value={repForm.examType} onChange={setRep} required />
            <FormField label="Reported By" name="reportedBy" value={repForm.reportedBy} onChange={setRep} required />
            <div />
            <FormField label="Findings" name="findings" type="textarea" value={repForm.findings} onChange={setRep} required />
            <FormField label="Impression" name="impression" type="textarea" value={repForm.impression} onChange={setRep} required />
            <FormField label="Recommendation" name="recommendation" type="textarea" value={repForm.recommendation} onChange={setRep} />
            <div className="form-actions">
              <button type="button" className="btn btn--ghost" onClick={() => setShowReport(false)}>Cancel</button>
              <button type="submit" className="btn btn--primary">Save Report</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
