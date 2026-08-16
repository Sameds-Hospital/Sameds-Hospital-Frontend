import { FolderOpen, Upload } from 'lucide-react'
import { useHMS } from '../store/HMSContext'
import { DataTable, type Column } from '../components/ui/DataTable'
import { Badge } from '../components/ui/Badge'
import { PageHeader } from '../components/ui/PageHeader'
import { SectionCard } from '../components/ui/SectionCard'
import type { Document } from '../types'

export function Documents() {
  const { state } = useHMS()

  const columns: Column<Document>[] = [
    { key: 'id', label: 'ID', width: '100px' },
    { key: 'patientName', label: 'Patient', sortable: true },
    { key: 'title', label: 'Document', sortable: true },
    { key: 'type', label: 'Type', badge: true },
    { key: 'fileName', label: 'File' },
    { key: 'uploadedBy', label: 'Uploaded By' },
    { key: 'uploadedAt', label: 'Date', render: d => new Date(d.uploadedAt).toLocaleString() },
    { key: 'size', label: 'Size' },
    { key: 'status', label: 'Status', badge: true },
  ]

  const byType: Record<string, number> = {}
  state.documents.forEach(d => { byType[d.type] = (byType[d.type] ?? 0) + 1 })

  return (
    <div className="module-page">
      <PageHeader
        title="Document Management"
        subtitle="Medical reports, scans, consents and files"
        icon={<FolderOpen size={22} />}
        actions={
          <button type="button" className="btn btn--primary" onClick={() => alert('File upload would open a file picker')}>
            <Upload size={16} /> Upload Document
          </button>
        }
      />

      <div className="mini-stats-row">
        <div className="mini-stat"><span>Total Documents</span><strong>{state.documents.length}</strong></div>
        {Object.entries(byType).map(([type, count]) => (
          <div key={type} className="mini-stat">
            <Badge variant="blue">{type}</Badge>
            <strong>{count}</strong>
          </div>
        ))}
      </div>

      <SectionCard title="Document Library" noPad>
        <DataTable columns={columns} data={state.documents} searchable searchKeys={['patientName','title','fileName']} />
      </SectionCard>
    </div>
  )
}
