import { useState, type FormEvent } from 'react'
import { Database, Search, Filter, Share2, Eye, Pencil } from 'lucide-react'
import { useHMS } from '../store/HMSContext'
import { PageHeader } from '../components/ui/PageHeader'
import { SectionCard } from '../components/ui/SectionCard'
import { DataTable, type Column } from '../components/ui/DataTable'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { PatientBarcode } from '../components/ui/PatientBarcode'
import { buildCentralRecordFromPatient, canEditCentralRecord, getVisibleCentralRecords, getVisiblePatientIdsForUser } from '../utils/access'
import type { CentralRecord } from '../types'

const RECORD_TYPE_LABELS: Record<CentralRecord['recordType'], string> = {
  MedicalRecord: 'Medical Record',
  Appointment: 'Appointment',
  Invoice: 'Invoice',
  LabResult: 'Lab Result',
  Prescription: 'Prescription',
  Diagnosis: 'Diagnosis',
  VitalSign: 'Vital Signs',
  Admission: 'Admission',
  Document: 'Document',
}

export function CentralDatabase() {
  const { state, currentUser, addCentralRecord, updateCentralRecord, addAuditLog } = useHMS()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [viewRecord, setViewRecord] = useState<CentralRecord | null>(null)
  const [editRecord, setEditRecord] = useState<CentralRecord | null>(null)
  const [submitForm, setSubmitForm] = useState(false)
  const [submitPatientId, setSubmitPatientId] = useState('')
  const [submitType, setSubmitType] = useState<CentralRecord['recordType']>('MedicalRecord')
  const [submitSummary, setSubmitSummary] = useState('')
  const [editSummary, setEditSummary] = useState('')
  const [editType, setEditType] = useState<CentralRecord['recordType']>('MedicalRecord')
  const [editIsShared, setEditIsShared] = useState(false)

  const canSubmitRecords = currentUser?.role === 'Doctor' || currentUser?.role === 'Nurse'
  const visiblePatientIds = getVisiblePatientIdsForUser(currentUser, state)
  const visibleRecords = getVisibleCentralRecords(currentUser, state)

  const filteredRecords = visibleRecords
    .filter(r => visiblePatientIds.includes(r.patientId))
    .filter(r => filterType === 'all' || r.recordType === filterType)
    .filter(r => {
      if (!searchTerm) return true
      return r.patientName.toLowerCase().includes(searchTerm.toLowerCase())
        || r.summary.toLowerCase().includes(searchTerm.toLowerCase())
        || r.patientId.toLowerCase().includes(searchTerm.toLowerCase())
        || r.recordType.toLowerCase().includes(searchTerm.toLowerCase())
    })
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!canSubmitRecords || !submitPatientId || !submitSummary.trim()) return
    const patient = state.patients.find(p => p.id === submitPatientId)
    if (!patient || !visiblePatientIds.includes(patient.id)) return
    addCentralRecord({
      ...buildCentralRecordFromPatient(patient, currentUser, submitSummary.trim(), submitType),
      recordId: `REF-${Date.now()}`,
    })
    addAuditLog('SUBMIT_CENTRAL', 'CentralDatabase', patient.id)
    setSubmitForm(false)
    setSubmitPatientId('')
    setSubmitSummary('')
    setSubmitType('MedicalRecord')
  }

  const openEditModal = (record: CentralRecord) => {
    setEditRecord(record)
    setEditSummary(record.summary)
    setEditType(record.recordType)
    setEditIsShared(record.isShared)
  }

  const handleEdit = (e: FormEvent) => {
    e.preventDefault()
    if (!editRecord || !currentUser || !canEditCentralRecord(currentUser, editRecord, state)) return

    const updatedRecord: CentralRecord = {
      ...editRecord,
      summary: editSummary.trim() || editRecord.summary,
      recordType: editType,
      isShared: editIsShared,
    }

    updateCentralRecord(updatedRecord)
    addAuditLog('EDIT_CENTRAL', 'CentralDatabase', editRecord.patientId)
    setEditRecord(null)
    setEditSummary('')
    setEditType('MedicalRecord')
    setEditIsShared(false)
  }

  const columns: Column<CentralRecord>[] = [
    { key: 'id', label: 'ID', width: '100px' },
    { key: 'patientName', label: 'Patient', sortable: true },
    { key: 'patientId', label: 'Patient ID', width: '100px' },
    { key: 'recordType', label: 'Type', render: r => <Badge variant="blue">{RECORD_TYPE_LABELS[r.recordType]}</Badge> },
    { key: 'summary', label: 'Summary', render: r => r.summary.slice(0, 60) + (r.summary.length > 60 ? '...' : '') },
    { key: 'submittedByName', label: 'Submitted By', width: '120px' },
    { key: 'submittedAt', label: 'Submitted', render: r => new Date(r.submittedAt).toLocaleString(), width: '150px' },
    {
      key: 'actions', label: '', width: '90px',
      render: r => {
        const canEdit = currentUser ? canEditCentralRecord(currentUser, r, state) : false
        return (
          <div className="row-actions">
            <button type="button" className="icon-btn" title="View" onClick={() => setViewRecord(r)}>
              <Eye size={14} />
            </button>
            {canEdit && (
              <button type="button" className="icon-btn" title="Edit" onClick={() => openEditModal(r)}>
                <Pencil size={14} />
              </button>
            )}
          </div>
        )
      },
    },
  ]

  const recordTypes = Object.keys(RECORD_TYPE_LABELS) as CentralRecord['recordType'][]

  return (
    <div className="module-page">
      <PageHeader
        title="Central Database"
        subtitle="Only the patient and the assigned care team can view or edit these records"
        icon={<Database size={22} />}
        actions={
          canSubmitRecords ? (
            <button type="button" className="btn btn--primary" onClick={() => setSubmitForm(true)}>
              <Share2 size={16} /> Submit Record
            </button>
          ) : undefined
        }
      />

      {/* Stats */}
      <div className="mini-stats-row">
        <div className="mini-stat">
          <strong>{visibleRecords.length}</strong>
          <span>Total Records</span>
        </div>
        <div className="mini-stat">
          <strong>{filteredRecords.length}</strong>
          <span>Filtered</span>
        </div>
        <div className="mini-stat">
          <strong>{visibleRecords.filter(r => r.isShared).length}</strong>
          <span>Shared</span>
        </div>
      </div>

      {/* Filters */}
      <SectionCard title="Records" noPad>
        <div className="data-table-toolbar">
          <div className="data-table-search">
            <Search size={14} />
            <input
              type="text"
              placeholder="Search patient, record type or summary..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="data-table-search">
            <Filter size={14} />
            <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ background: 'none', border: 'none', outline: 'none', color: 'inherit', font: 'inherit' }}>
              <option value="all">All Types</option>
              {recordTypes.map(t => (
                <option key={t} value={t}>{RECORD_TYPE_LABELS[t]}</option>
              ))}
            </select>
          </div>
        </div>

        <DataTable columns={columns} data={filteredRecords} searchable={false} />
      </SectionCard>

      {/* Submit modal */}
      {submitForm && (
        <Modal title="Submit Record to Central Database" onClose={() => setSubmitForm(false)} size="lg">
          <form onSubmit={handleSubmit} className="form-grid-2">
            <div className="form-field form-field--full">
              <label className="form-label">Select Patient</label>
              <select className="form-control" value={submitPatientId} onChange={e => setSubmitPatientId(e.target.value)} required>
                <option value="">— choose patient —</option>
                {state.patients
                  .filter(p => visiblePatientIds.includes(p.id))
                  .map(p => (
                    <option key={p.id} value={p.id}>{p.id} – {p.name} ({p.barcode})</option>
                  ))}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Record Type</label>
              <select className="form-control" value={submitType} onChange={e => setSubmitType(e.target.value as CentralRecord['recordType'])}>
                {recordTypes.map(t => (
                  <option key={t} value={t}>{RECORD_TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>
            <div className="form-field form-field--full">
              <label className="form-label">Summary / Notes</label>
              <textarea
                className="form-control"
                value={submitSummary}
                onChange={e => setSubmitSummary(e.target.value)}
                rows={4}
                placeholder="Enter a summary of the patient record to share..."
                required
              />
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn--ghost" onClick={() => setSubmitForm(false)}>Cancel</button>
              <button type="submit" className="btn btn--primary"><Share2 size={14} /> Submit to Central DB</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit modal */}
      {editRecord && (
        <Modal title="Edit Central Record" onClose={() => setEditRecord(null)} size="lg">
          <form onSubmit={handleEdit} className="form-grid-2">
            <div className="form-field">
              <label className="form-label">Record Type</label>
              <select className="form-control" value={editType} onChange={e => setEditType(e.target.value as CentralRecord['recordType'])}>
                {recordTypes.map(t => (
                  <option key={t} value={t}>{RECORD_TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Visibility</label>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={editIsShared} onChange={() => setEditIsShared(v => !v)} />
                Share this record in the patient portal
              </label>
            </div>
            <div className="form-field form-field--full">
              <label className="form-label">Summary / Notes</label>
              <textarea
                className="form-control"
                value={editSummary}
                onChange={e => setEditSummary(e.target.value)}
                rows={4}
                placeholder="Update the shared summary for this record..."
                required
              />
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn--ghost" onClick={() => setEditRecord(null)}>Cancel</button>
              <button type="submit" className="btn btn--primary"><Pencil size={14} /> Save Changes</button>
            </div>
          </form>
        </Modal>
      )}

      {/* View modal */}
      {viewRecord && (
        <Modal title={`Record: ${RECORD_TYPE_LABELS[viewRecord.recordType]}`} onClose={() => setViewRecord(null)} size="lg">
          <div className="detail-grid">
            <div className="detail-section">
              <h4>Patient</h4>
              <dl>
                <dt>Name</dt><dd>{viewRecord.patientName}</dd>
                <dt>ID</dt><dd>{viewRecord.patientId}</dd>
                <dt>Barcode</dt><dd><code>{viewRecord.patientBarcode}</code></dd>
              </dl>
            </div>
            <div className="detail-section">
              <h4>Record Details</h4>
              <dl>
                <dt>Type</dt><dd><Badge variant="blue">{RECORD_TYPE_LABELS[viewRecord.recordType]}</Badge></dd>
                <dt>Record ID</dt><dd>{viewRecord.recordId}</dd>
                <dt>Submitted By</dt><dd>{viewRecord.submittedByName}</dd>
                <dt>Submitted At</dt><dd>{new Date(viewRecord.submittedAt).toLocaleString()}</dd>
                <dt>Branch</dt><dd>{viewRecord.branchId}</dd>
                <dt>Shared</dt><dd><Badge variant={viewRecord.isShared ? 'green' : 'yellow'}>{viewRecord.isShared ? 'Yes' : 'No'}</Badge></dd>
              </dl>
            </div>
            <div className="detail-section form-field--full">
              <h4>Summary</h4>
              <p>{viewRecord.summary}</p>
            </div>
            <div className="detail-section">
              <h4>Patient QR / Barcode</h4>
              <PatientBarcode patient={state.patients.find(p => p.id === viewRecord.patientId) ?? state.patients[0]} size={120} />
            </div>
          </div>
          <div className="form-actions" style={{ marginTop: 16 }}>
            <button type="button" className="btn btn--ghost" onClick={() => setViewRecord(null)}>Close</button>
          </div>
        </Modal>
      )}
    </div>
  )
}