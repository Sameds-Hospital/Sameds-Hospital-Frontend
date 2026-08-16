import { useState, type FormEvent, type ChangeEvent } from 'react'
import { Bell, Plus, CheckCircle } from 'lucide-react'
import { useHMS } from '../store/HMSContext'
import { DataTable, type Column } from '../components/ui/DataTable'
import { Modal } from '../components/ui/Modal'
import { FormField } from '../components/ui/FormField'
import { Badge, statusVariant } from '../components/ui/Badge'
import { PageHeader } from '../components/ui/PageHeader'
import { SectionCard } from '../components/ui/SectionCard'
import type { Notification } from '../types'

export function Notifications() {
  const { state, dispatch, nextId } = useHMS()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ recipient: '', recipientId: '', channel: 'In-app' as Notification['channel'], type: 'General' as Notification['type'], subject: '', body: '' })

  const set = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const notif: Notification = { id: nextId('NOT', state.notifications), ...form, sentAt: new Date().toISOString(), status: 'Sent' }
    dispatch({ type: 'ADD_NOTIFICATION', payload: notif })
    setShowForm(false)
  }

  const markRead = (id: string) => dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id })

  const unread = state.notifications.filter(n => n.status !== 'Read')
  const read = state.notifications.filter(n => n.status === 'Read')

  const columns: Column<Notification>[] = [
    { key: 'id', label: 'ID', width: '100px' },
    { key: 'recipient', label: 'Recipient', sortable: true },
    { key: 'channel', label: 'Channel', badge: true },
    { key: 'type', label: 'Type', badge: true },
    { key: 'subject', label: 'Subject', sortable: true },
    { key: 'body', label: 'Message' },
    { key: 'sentAt', label: 'Sent', render: n => new Date(n.sentAt).toLocaleString() },
    { key: 'status', label: 'Status', badge: true },
    {
      key: 'actions', label: '', width: '80px',
      render: row => row.status !== 'Read' ? (
        <button type="button" className="icon-btn icon-btn--green" title="Mark read" onClick={e => { e.stopPropagation(); markRead(row.id) }}><CheckCircle size={14} /></button>
      ) : null,
    },
  ]

  return (
    <div className="module-page">
      <PageHeader
        title="Notifications"
        subtitle={`${unread.length} unread · ${state.notifications.length} total`}
        icon={<Bell size={22} />}
        actions={
          <button type="button" className="btn btn--primary" onClick={() => setShowForm(true)}>
            <Plus size={16} /> Send Notification
          </button>
        }
      />

      <div className="mini-stats-row">
        <div className="mini-stat"><Badge variant="yellow">Unread</Badge><strong>{unread.length}</strong></div>
        <div className="mini-stat"><Badge variant="green">Read</Badge><strong>{read.length}</strong></div>
        {(['SMS','Email','In-app'] as Notification['channel'][]).map(ch => (
          <div key={ch} className="mini-stat"><Badge variant="blue">{ch}</Badge><strong>{state.notifications.filter(n => n.channel === ch).length}</strong></div>
        ))}
      </div>

      {unread.length > 0 && (
        <SectionCard title="Unread Notifications">
          <div className="notif-list">
            {unread.map(n => (
              <div key={n.id} className="notif-item notif-item--unread">
                <div className="notif-item__header">
                  <Badge variant={statusVariant(n.type)}>{n.type}</Badge>
                  <Badge variant="blue">{n.channel}</Badge>
                  <span className="notif-item__time">{new Date(n.sentAt).toLocaleString()}</span>
                  <button type="button" className="icon-btn icon-btn--green" onClick={() => markRead(n.id)}><CheckCircle size={14} /></button>
                </div>
                <strong>{n.subject}</strong>
                <p>{n.body}</p>
                <span className="notif-item__recipient">To: {n.recipient}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      <SectionCard title="All Notifications" noPad>
        <DataTable columns={columns} data={state.notifications} searchable searchKeys={['recipient','subject','type']} />
      </SectionCard>

      {showForm && (
        <Modal title="Send Notification" onClose={() => setShowForm(false)} size="md">
          <form onSubmit={handleSubmit} className="form-grid-2">
            <FormField label="Recipient Name" name="recipient" value={form.recipient} onChange={set} required placeholder="Staff or patient name" />
            <FormField label="Channel" name="channel" type="select" value={form.channel} onChange={set}
              options={['SMS','Email','In-app'].map(v => ({ value: v, label: v }))} />
            <FormField label="Type" name="type" type="select" value={form.type} onChange={set}
              options={['Appointment','Lab Result','Prescription','Billing','Emergency','General'].map(v => ({ value: v, label: v }))} />
            <FormField label="Subject" name="subject" value={form.subject} onChange={set} required />
            <FormField label="Message Body" name="body" type="textarea" value={form.body} onChange={set} required />
            <div className="form-actions">
              <button type="button" className="btn btn--ghost" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn--primary">Send</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
