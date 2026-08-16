import { ClipboardList } from 'lucide-react'
import { useHMS } from '../store/HMSContext'
import { DataTable, type Column } from '../components/ui/DataTable'
import { Badge } from '../components/ui/Badge'
import { PageHeader } from '../components/ui/PageHeader'
import { SectionCard } from '../components/ui/SectionCard'
import type { AuditLog } from '../types'

export function Audit() {
  const { state } = useHMS()

  const columns: Column<AuditLog>[] = [
    { key: 'id', label: 'ID', width: '100px' },
    { key: 'userName', label: 'User', sortable: true },
    { key: 'role', label: 'Role', badge: true },
    { key: 'action', label: 'Action', sortable: true },
    { key: 'module', label: 'Module', sortable: true },
    { key: 'target', label: 'Target' },
    { key: 'ipAddress', label: 'IP Address' },
    { key: 'timestamp', label: 'Time', render: a => new Date(a.timestamp).toLocaleString() },
    { key: 'result', label: 'Result', badge: true },
  ]

  const byUser: Record<string, number> = {}
  state.auditLogs.forEach(a => { byUser[a.userName] = (byUser[a.userName] ?? 0) + 1 })

  const byModule: Record<string, number> = {}
  state.auditLogs.forEach(a => { byModule[a.module] = (byModule[a.module] ?? 0) + 1 })

  return (
    <div className="module-page">
      <PageHeader
        title="Audit & Compliance"
        subtitle={`${state.auditLogs.length} total audit logs`}
        icon={<ClipboardList size={22} />}
      />

      <div className="mini-stats-row">
        <div className="mini-stat"><span>Total Logs</span><strong>{state.auditLogs.length}</strong></div>
        <div className="mini-stat"><Badge variant="green">Success</Badge><strong>{state.auditLogs.filter(a => a.result === 'Success').length}</strong></div>
        <div className="mini-stat"><Badge variant="red">Failed</Badge><strong>{state.auditLogs.filter(a => a.result === 'Failed').length}</strong></div>
        <div className="mini-stat"><Badge variant="yellow">Warning</Badge><strong>{state.auditLogs.filter(a => a.result === 'Warning').length}</strong></div>
        <div className="mini-stat"><span>Active Users</span><strong>{Object.keys(byUser).length}</strong></div>
      </div>

      <div className="dashboard-charts-row">
        <SectionCard title="Activity by User">
          <div className="category-list">
            {Object.entries(byUser).map(([user, count]) => (
              <div key={user} className="category-row">
                <span>{user}</span>
                <div className="category-bar">
                  <div className="category-fill" style={{ width: `${Math.min(100, (count / state.auditLogs.length) * 100 || 20)}%` }} />
                </div>
                <strong>{count}</strong>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Activity by Module">
          <div className="category-list">
            {Object.entries(byModule).map(([mod, count]) => (
              <div key={mod} className="category-row">
                <span>{mod}</span>
                <div className="category-bar">
                  <div className="category-fill" style={{ width: `${Math.min(100, (count / state.auditLogs.length) * 100 || 20)}%` }} />
                </div>
                <strong>{count}</strong>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Audit Log" noPad>
        <DataTable columns={columns} data={state.auditLogs} searchable searchKeys={['userName','action','module','target']} />
      </SectionCard>
    </div>
  )
}
