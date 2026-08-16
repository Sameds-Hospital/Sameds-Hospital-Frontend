import { useState, type FormEvent, type ChangeEvent } from 'react'
import { ShieldCheck, Plus } from 'lucide-react'
import { useHMS } from '../store/HMSContext'
import { DataTable, type Column } from '../components/ui/DataTable'
import { Modal } from '../components/ui/Modal'
import { FormField } from '../components/ui/FormField'
import { Badge } from '../components/ui/Badge'
import { PageHeader } from '../components/ui/PageHeader'
import { SectionCard } from '../components/ui/SectionCard'
import type { InsurancePolicy, InsuranceClaim } from '../types'

type Tab = 'policies' | 'claims'

export function Insurance() {
  const { state, dispatch, nextId } = useHMS()
  const [tab, setTab] = useState<Tab>('policies')
  const [showPolicy, setShowPolicy] = useState(false)
  const [showClaim, setShowClaim] = useState(false)

  const [polForm, setPolForm] = useState({ patientId: '', provider: '', policyNumber: '', groupNumber: '', coverageType: 'Comprehensive', coverageLimit: '5000', deductible: '50', copay: '10', validFrom: '', validTo: '' })
  const [clmForm, setClmForm] = useState({ policyId: '', patientId: '', invoiceId: '', provider: '', claimAmount: '', approvedAmount: '' })

  const setPol = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setPolForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const setClm = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setClmForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submitPolicy = (e: FormEvent) => {
    e.preventDefault()
    const patient = state.patients.find(p => p.id === polForm.patientId)
    const pol: InsurancePolicy = {
      id: nextId('INS', state.insurancePolicies),
      patientName: patient?.name ?? '',
      status: 'Active',
      ...polForm,
      coverageLimit: Number(polForm.coverageLimit),
      deductible: Number(polForm.deductible),
      copay: Number(polForm.copay),
    }
    dispatch({ type: 'ADD_INSURANCE_POLICY', payload: pol })
    setShowPolicy(false)
  }

  const submitClaim = (e: FormEvent) => {
    e.preventDefault()
    const patient = state.patients.find(p => p.id === clmForm.patientId)
    const pol = state.insurancePolicies.find(p => p.id === clmForm.policyId)
    const claim: InsuranceClaim = {
      id: nextId('CLM', state.insuranceClaims),
      patientName: patient?.name ?? '',
      submittedAt: new Date().toISOString(),
      status: 'Submitted',
      ...clmForm,
      provider: pol?.provider ?? clmForm.provider,
      claimAmount: Number(clmForm.claimAmount),
      approvedAmount: Number(clmForm.approvedAmount),
    }
    dispatch({ type: 'ADD_INSURANCE_CLAIM', payload: claim })
    setShowClaim(false)
  }

  const updateClaimStatus = (claim: InsuranceClaim, status: InsuranceClaim['status']) =>
    dispatch({ type: 'UPDATE_INSURANCE_CLAIM', payload: { ...claim, status } })

  const polCols: Column<InsurancePolicy>[] = [
    { key: 'id', label: 'ID', width: '100px' },
    { key: 'patientName', label: 'Patient', sortable: true },
    { key: 'provider', label: 'Provider', sortable: true },
    { key: 'policyNumber', label: 'Policy No.' },
    { key: 'coverageType', label: 'Coverage' },
    { key: 'coverageLimit', label: 'Limit (USD)', render: p => `$${Number(p.coverageLimit).toLocaleString()}` },
    { key: 'deductible', label: 'Deductible' },
    { key: 'copay', label: 'Copay (%)' },
    { key: 'validFrom', label: 'From', sortable: true },
    { key: 'validTo', label: 'To', sortable: true },
    { key: 'status', label: 'Status', badge: true },
  ]
  const clmCols: Column<InsuranceClaim>[] = [
    { key: 'id', label: 'ID', width: '100px' },
    { key: 'patientName', label: 'Patient', sortable: true },
    { key: 'provider', label: 'Provider' },
    { key: 'invoiceId', label: 'Invoice' },
    { key: 'claimAmount', label: 'Claimed (USD)', render: c => `$${Number(c.claimAmount).toFixed(2)}` },
    { key: 'approvedAmount', label: 'Approved (USD)', render: c => `$${Number(c.approvedAmount).toFixed(2)}` },
    { key: 'submittedAt', label: 'Submitted', render: c => new Date(c.submittedAt).toLocaleDateString() },
    { key: 'status', label: 'Status', badge: true },
    {
      key: 'actions', label: '', width: '120px',
      render: row => (
        <div className="row-actions">
          {row.status === 'Submitted' && <button type="button" className="icon-btn icon-btn--blue" onClick={e => { e.stopPropagation(); updateClaimStatus(row, 'Under Review') }}>Review</button>}
          {row.status === 'Under Review' && <button type="button" className="icon-btn icon-btn--green" onClick={e => { e.stopPropagation(); updateClaimStatus(row, 'Approved') }}>Approve</button>}
        </div>
      ),
    },
  ]

  return (
    <div className="module-page">
      <PageHeader
        title="Insurance Management"
        subtitle="Policies, claims processing and coverage tracking"
        icon={<ShieldCheck size={22} />}
        actions={
          <div className="btn-group">
            <button type="button" className="btn btn--primary" onClick={() => setShowPolicy(true)}><Plus size={14} /> Add Policy</button>
            <button type="button" className="btn btn--secondary" onClick={() => setShowClaim(true)}><Plus size={14} /> Submit Claim</button>
          </div>
        }
      />

      <div className="mini-stats-row">
        <div className="mini-stat"><Badge variant="green">Active</Badge><strong>{state.insurancePolicies.filter(p => p.status === 'Active').length}</strong></div>
        <div className="mini-stat"><Badge variant="red">Expired</Badge><strong>{state.insurancePolicies.filter(p => p.status === 'Expired').length}</strong></div>
        <div className="mini-stat"><Badge variant="yellow">Claims Pending</Badge><strong>{state.insuranceClaims.filter(c => c.status === 'Submitted' || c.status === 'Under Review').length}</strong></div>
        <div className="mini-stat"><Badge variant="green">Approved</Badge><strong>{state.insuranceClaims.filter(c => c.status === 'Approved' || c.status === 'Paid').length}</strong></div>
        <div className="mini-stat"><span>Total Claimed</span><strong>${state.insuranceClaims.reduce((s,c) => s + Number(c.claimAmount), 0).toLocaleString()}</strong></div>
      </div>

      <div className="tab-bar">
        <button type="button" className={`tab-btn${tab === 'policies' ? ' tab-btn--active' : ''}`} onClick={() => setTab('policies')}>Policies ({state.insurancePolicies.length})</button>
        <button type="button" className={`tab-btn${tab === 'claims' ? ' tab-btn--active' : ''}`} onClick={() => setTab('claims')}>Claims ({state.insuranceClaims.length})</button>
      </div>

      <SectionCard noPad>
        {tab === 'policies' && <DataTable columns={polCols} data={state.insurancePolicies} searchable searchKeys={['patientName','provider','policyNumber']} />}
        {tab === 'claims' && <DataTable columns={clmCols} data={state.insuranceClaims} searchable searchKeys={['patientName','provider','invoiceId']} />}
      </SectionCard>

      {showPolicy && (
        <Modal title="Add Insurance Policy" onClose={() => setShowPolicy(false)} size="lg">
          <form onSubmit={submitPolicy} className="form-grid-2">
            <FormField label="Patient" name="patientId" type="select" value={polForm.patientId} onChange={setPol} required
              options={state.patients.map(p => ({ value: p.id, label: `${p.id} – ${p.name}` }))} />
            <FormField label="Insurance Provider" name="provider" value={polForm.provider} onChange={setPol} required />
            <FormField label="Policy Number" name="policyNumber" value={polForm.policyNumber} onChange={setPol} required />
            <FormField label="Group Number" name="groupNumber" value={polForm.groupNumber} onChange={setPol} />
            <FormField label="Coverage Type" name="coverageType" type="select" value={polForm.coverageType} onChange={setPol}
              options={['Comprehensive','Basic','Major Medical','Dental','Vision'].map(v => ({ value: v, label: v }))} />
            <FormField label="Coverage Limit (USD)" name="coverageLimit" type="number" value={polForm.coverageLimit} onChange={setPol} min={0} />
            <FormField label="Deductible (USD)" name="deductible" type="number" value={polForm.deductible} onChange={setPol} min={0} />
            <FormField label="Copay (%)" name="copay" type="number" value={polForm.copay} onChange={setPol} min={0} />
            <FormField label="Valid From" name="validFrom" type="date" value={polForm.validFrom} onChange={setPol} required />
            <FormField label="Valid To" name="validTo" type="date" value={polForm.validTo} onChange={setPol} required />
            <div className="form-actions">
              <button type="button" className="btn btn--ghost" onClick={() => setShowPolicy(false)}>Cancel</button>
              <button type="submit" className="btn btn--primary">Add Policy</button>
            </div>
          </form>
        </Modal>
      )}

      {showClaim && (
        <Modal title="Submit Insurance Claim" onClose={() => setShowClaim(false)} size="md">
          <form onSubmit={submitClaim} className="form-grid-2">
            <FormField label="Policy" name="policyId" type="select" value={clmForm.policyId} onChange={setClm} required
              options={state.insurancePolicies.filter(p => p.status === 'Active').map(p => ({ value: p.id, label: `${p.policyNumber} – ${p.patientName}` }))} />
            <FormField label="Patient" name="patientId" type="select" value={clmForm.patientId} onChange={setClm} required
              options={state.patients.map(p => ({ value: p.id, label: `${p.id} – ${p.name}` }))} />
            <FormField label="Invoice" name="invoiceId" type="select" value={clmForm.invoiceId} onChange={setClm}
              options={state.invoices.map(i => ({ value: i.id, label: `${i.id} – $${i.total}` }))} />
            <FormField label="Claim Amount (USD)" name="claimAmount" type="number" value={clmForm.claimAmount} onChange={setClm} required min={0} step="0.01" />
            <FormField label="Approved Amount (USD)" name="approvedAmount" type="number" value={clmForm.approvedAmount} onChange={setClm} min={0} step="0.01" />
            <div className="form-actions">
              <button type="button" className="btn btn--ghost" onClick={() => setShowClaim(false)}>Cancel</button>
              <button type="submit" className="btn btn--primary">Submit Claim</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

