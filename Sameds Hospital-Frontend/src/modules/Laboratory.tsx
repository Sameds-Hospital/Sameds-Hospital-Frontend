import { useState, type FormEvent, type ChangeEvent } from 'react'
import { FlaskConical, Plus, CheckCircle } from 'lucide-react'
import { useHMS } from '../store/HMSContext'
import { DataTable, type Column } from '../components/ui/DataTable'
import { Modal } from '../components/ui/Modal'
import { FormField } from '../components/ui/FormField'
import { Badge, statusVariant } from '../components/ui/Badge'
import { PageHeader } from '../components/ui/PageHeader'
import { SectionCard } from '../components/ui/SectionCard'
import type { LabTest, LabResult } from '../types'

type Tab = 'tests' | 'results'

export function Laboratory() {
  const { state, dispatch, nextId, currentUser } = useHMS()
  const [tab, setTab] = useState<Tab>('tests')
  const [showTest, setShowTest] = useState(false)
  const [showResult, setShowResult] = useState(false)

  const [testForm, setTestForm] = useState({ patientId: '', requestedBy: currentUser?.name ?? '', testName: '', category: '', priority: 'Routine' as LabTest['priority'], sampleType: '' })
  const [resForm, setResForm] = useState({ testId: '', patientId: '', patientName: '', testName: '', result: '', unit: '', referenceRange: '', abnormal: false, remarks: '', reportedBy: currentUser?.name ?? '' })

  const setT = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setTestForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const setR = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setResForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submitTest = (e: FormEvent) => {
    e.preventDefault()
    const patient = state.patients.find(p => p.id === testForm.patientId)
    const test: LabTest = {
      id: nextId('LT', state.labTests),
      patientName: patient?.name ?? '',
      collectedAt: new Date().toISOString(),
      status: 'Requested',
      ...testForm,
    }
    dispatch({ type: 'ADD_LAB_TEST', payload: test })
    setShowTest(false)
  }

  const submitResult = (e: FormEvent) => {
    e.preventDefault()
    const test = state.labTests.find(t => t.id === resForm.testId)
    const res: LabResult = {
      id: nextId('LR', state.labResults),
      reportedAt: new Date().toISOString(),
      ...resForm,
      patientName: test?.patientName ?? '',
      abnormal: resForm.abnormal,
    }
    dispatch({ type: 'ADD_LAB_RESULT', payload: res })
    if (test) {
      dispatch({ type: 'UPDATE_LAB_TEST', payload: { ...test, status: 'Completed' } })
      // Auto-notify requesting doctor
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: `NOTIF-${Date.now()}`,
          recipientId: test.requestedBy,
          recipient: test.requestedBy,
          type: 'Lab Result',
          subject: `Lab Result Ready: ${test.testName}`,
          body: `Result for ${test.patientName} — ${test.testName}: ${resForm.result} ${resForm.unit}${resForm.abnormal ? ' ⚠ ABNORMAL' : ''}`,
          status: 'Sent',
          channel: 'In-app',
          sentAt: new Date().toISOString(),
        },
      })
        // Auto-invoice for lab test
      dispatch({
        type: 'ADD_INVOICE',
        payload: {
          id: nextId('INV', state.invoices),
          patientId: test.patientId,
          patientName: test.patientName,
          department: 'Laboratory',
          items: [{ description: `Lab Test: ${test.testName}`, quantity: 1, unitPrice: 50, total: 50 }],
          subtotal: 50, discount: 0, tax: 0, total: 50,
          insuranceCoverage: 0, amountDue: 50, currency: 'GHS',
          status: 'Issued',
          issuedAt: new Date().toISOString(),
          dueAt: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
        },
      })
    }
    setShowResult(false)
  }

  const updateStatus = (test: LabTest, status: LabTest['status']) => dispatch({ type: 'UPDATE_LAB_TEST', payload: { ...test, status } })

  const testCols: Column<LabTest>[] = [
    { key: 'id', label: 'ID', width: '100px' },
    { key: 'patientName', label: 'Patient', sortable: true },
    { key: 'requestedBy', label: 'Requested By' },
    { key: 'testName', label: 'Test', sortable: true },
    { key: 'category', label: 'Category' },
    { key: 'priority', label: 'Priority', badge: true },
    { key: 'sampleType', label: 'Sample' },
    { key: 'collectedAt', label: 'Collected', render: t => new Date(t.collectedAt).toLocaleDateString() },
    { key: 'status', label: 'Status', badge: true },
    {
      key: 'actions', label: '', width: '80px',
      render: row => (
        <div className="row-actions">
          {row.status === 'Requested' && <button type="button" className="icon-btn icon-btn--blue" onClick={e => { e.stopPropagation(); updateStatus(row, 'Sample Collected') }} title="Mark collected"><CheckCircle size={14} /></button>}
          {row.status === 'Sample Collected' && <button type="button" className="icon-btn icon-btn--blue" onClick={e => { e.stopPropagation(); updateStatus(row, 'In Progress') }} title="Mark in progress"><CheckCircle size={14} /></button>}
        </div>
      ),
    },
  ]

  const resCols: Column<LabResult>[] = [
    { key: 'id', label: 'ID', width: '100px' },
    { key: 'patientName', label: 'Patient', sortable: true },
    { key: 'testName', label: 'Test', sortable: true },
    { key: 'result', label: 'Result' },
    { key: 'unit', label: 'Unit' },
    { key: 'referenceRange', label: 'Reference' },
    { key: 'abnormal', label: 'Abnormal', render: r => r.abnormal ? <Badge variant="red">Yes</Badge> : <Badge variant="green">No</Badge> },
    { key: 'remarks', label: 'Remarks' },
    { key: 'reportedBy', label: 'Reported By' },
    { key: 'reportedAt', label: 'Date', render: r => new Date(r.reportedAt).toLocaleDateString() },
  ]

  const patientOptions = state.patients.map(p => ({ value: p.id, label: `${p.id} – ${p.name}` }))

  return (
    <div className="module-page">
      <PageHeader
        title="Laboratory Management"
        subtitle="Test requests, sample tracking and results"
        icon={<FlaskConical size={22} />}
        actions={
          <div className="btn-group">
            <button type="button" className="btn btn--primary" onClick={() => setShowTest(true)}><Plus size={14} /> Request Test</button>
            <button type="button" className="btn btn--secondary" onClick={() => setShowResult(true)}><CheckCircle size={14} /> Enter Result</button>
          </div>
        }
      />

      <div className="mini-stats-row">
        {(['Requested','Sample Collected','In Progress','Completed','Cancelled'] as LabTest['status'][]).map(s => (
          <div key={s} className="mini-stat"><Badge variant={statusVariant(s)}>{s}</Badge><strong>{state.labTests.filter(t => t.status === s).length}</strong></div>
        ))}
      </div>

      <div className="tab-bar">
        <button type="button" className={`tab-btn${tab === 'tests' ? ' tab-btn--active' : ''}`} onClick={() => setTab('tests')}>Test Requests ({state.labTests.length})</button>
        <button type="button" className={`tab-btn${tab === 'results' ? ' tab-btn--active' : ''}`} onClick={() => setTab('results')}>Results ({state.labResults.length})</button>
      </div>

      <SectionCard noPad>
        {tab === 'tests' && <DataTable columns={testCols} data={state.labTests} searchable searchKeys={['patientName','testName','requestedBy']} />}
        {tab === 'results' && <DataTable columns={resCols} data={state.labResults} searchable searchKeys={['patientName','testName']} />}
      </SectionCard>

      {showTest && (
        <Modal title="Request Lab Test" onClose={() => setShowTest(false)} size="md">
          <form onSubmit={submitTest} className="form-grid-2">
            <FormField label="Patient" name="patientId" type="select" value={testForm.patientId} onChange={setT} required options={patientOptions} />
            <FormField label="Requested By" name="requestedBy" value={testForm.requestedBy} onChange={setT} required />
            <FormField label="Test Name" name="testName" value={testForm.testName} onChange={setT} required placeholder="e.g. Complete Blood Count" />
            <FormField label="Category" name="category" value={testForm.category} onChange={setT} placeholder="e.g. Haematology" />
            <FormField label="Priority" name="priority" type="select" value={testForm.priority} onChange={setT}
              options={['Routine','Urgent','STAT'].map(v => ({ value: v, label: v }))} />
            <FormField label="Sample Type" name="sampleType" value={testForm.sampleType} onChange={setT} placeholder="e.g. Venous blood" />
            <div className="form-actions">
              <button type="button" className="btn btn--ghost" onClick={() => setShowTest(false)}>Cancel</button>
              <button type="submit" className="btn btn--primary">Request Test</button>
            </div>
          </form>
        </Modal>
      )}

      {showResult && (
        <Modal title="Enter Lab Result" onClose={() => setShowResult(false)} size="md">
          <form onSubmit={submitResult} className="form-grid-2">
            <FormField label="Test Request" name="testId" type="select" value={resForm.testId} onChange={setR} required
              options={state.labTests.filter(t => t.status !== 'Completed').map(t => ({ value: t.id, label: `${t.id} – ${t.testName} (${t.patientName})` }))} />
            <FormField label="Test Name" name="testName" value={resForm.testName} onChange={setR} required />
            <FormField label="Result" name="result" value={resForm.result} onChange={setR} required />
            <FormField label="Unit" name="unit" value={resForm.unit} onChange={setR} placeholder="e.g. mg/dL" />
            <FormField label="Reference Range" name="referenceRange" value={resForm.referenceRange} onChange={setR} placeholder="e.g. 4.0–11.0" />
            <FormField label="Remarks" name="remarks" type="textarea" value={resForm.remarks} onChange={setR} />
            <div className="form-actions">
              <button type="button" className="btn btn--ghost" onClick={() => setShowResult(false)}>Cancel</button>
              <button type="submit" className="btn btn--primary">Save Result</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
