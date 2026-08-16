import { useState, type FormEvent, type ChangeEvent } from 'react'
import { ShieldCheck, UserPlus, Lock } from 'lucide-react'
import { useHMS } from '../store/HMSContext'
import { DataTable, type Column } from '../components/ui/DataTable'
import { Modal } from '../components/ui/Modal'
import { FormField } from '../components/ui/FormField'
import { Badge } from '../components/ui/Badge'
import { PageHeader } from '../components/ui/PageHeader'
import { SectionCard } from '../components/ui/SectionCard'
import type { UserAccount, Role } from '../types'

const ROLES: Role[] = ['Admin','Doctor','Nurse','Receptionist','Pharmacist','Cashier','LabTechnician','Radiologist','Patient']

const ROLE_ACCESS_MAP: Record<Role, string[]> = {
  Admin: ['All modules – full access'],
  Doctor: ['Dashboard','Patients','Appointments','EMR','Laboratory','Radiology','Telemedicine','Notifications'],
  Nurse: ['Dashboard','Patients','EMR','Inpatient','Notifications'],
  Receptionist: ['Dashboard','Patients','Appointments','Notifications'],
  Pharmacist: ['Dashboard','Pharmacy','Patients','Notifications'],
  Cashier: ['Dashboard','Billing','Patients','Notifications'],
  LabTechnician: ['Dashboard','Laboratory','Patients','Notifications'],
  Radiologist: ['Dashboard','Radiology','Patients','Notifications'],
  Patient: ['Patient Portal','Notifications'],
}

export function Security() {
  const { state, dispatch, nextId } = useHMS()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ username: '', password: '', name: '', email: '', role: 'Nurse' as Role, branchId: 'BR-001' })

  const set = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const acc: UserAccount = {
      id: nextId('USR', state.userAccounts),
      ...form,
      phone: '',
      department: '',
      lastLogin: 'Never',
      isActive: true,
      mfaEnabled: false,
      createdAt: new Date().toISOString(),
      staffProfile: { bio: '', specialization: '', officeLocation: '', workPhone: '', emergencyContact: '', notes: '', stellarAddress: '' },
    }
    dispatch({ type: 'ADD_USER_ACCOUNT', payload: acc })
    setShowForm(false)
  }

  const toggleActive = (u: UserAccount) =>
    dispatch({ type: 'UPDATE_USER_ACCOUNT', payload: { ...u, isActive: !u.isActive } })
  const toggleMfa = (u: UserAccount) =>
    dispatch({ type: 'UPDATE_USER_ACCOUNT', payload: { ...u, mfaEnabled: !u.mfaEnabled } })

  const columns: Column<UserAccount>[] = [
    { key: 'id', label: 'ID', width: '100px' },
    { key: 'username', label: 'Username', sortable: true },
    { key: 'name', label: 'Full Name', sortable: true },
    { key: 'role', label: 'Role', badge: true, sortable: true },
    { key: 'email', label: 'Email' },
    { key: 'lastLogin', label: 'Last Login', sortable: true },
    { key: 'mfaEnabled', label: 'MFA', render: u => u.mfaEnabled ? <Badge variant="green">Enabled</Badge> : <Badge variant="gray">Off</Badge> },
    { key: 'isActive', label: 'Status', render: u => u.isActive ? <Badge variant="green">Active</Badge> : <Badge variant="red">Inactive</Badge> },
    {
      key: 'actions', label: '', width: '120px',
      render: row => (
        <div className="row-actions">
          <button type="button" className="icon-btn" title="Toggle MFA" onClick={e => { e.stopPropagation(); toggleMfa(row) }}><Lock size={13} /></button>
          <button type="button" className={`icon-btn ${row.isActive ? 'icon-btn--red' : 'icon-btn--green'}`} onClick={e => { e.stopPropagation(); toggleActive(row) }}>{row.isActive ? 'Deactivate' : 'Activate'}</button>
        </div>
      ),
    },
  ]

  return (
    <div className="module-page">
      <PageHeader
        title="Security & User Management"
        subtitle="Accounts, roles, MFA and access control"
        icon={<ShieldCheck size={22} />}
        actions={
          <button type="button" className="btn btn--primary" onClick={() => setShowForm(true)}>
            <UserPlus size={16} /> Create Account
          </button>
        }
      />

      <div className="mini-stats-row">
        <div className="mini-stat"><span>Total Accounts</span><strong>{state.userAccounts.length}</strong></div>
        <div className="mini-stat"><Badge variant="green">Active</Badge><strong>{state.userAccounts.filter(u => u.isActive).length}</strong></div>
        <div className="mini-stat"><Badge variant="red">Inactive</Badge><strong>{state.userAccounts.filter(u => !u.isActive).length}</strong></div>
        <div className="mini-stat"><Badge variant="blue">MFA Enabled</Badge><strong>{state.userAccounts.filter(u => u.mfaEnabled).length}</strong></div>
      </div>

      <SectionCard title="Role-Based Access Control (RBAC)">
        <div className="rbac-grid">
          {ROLES.map(role => (
            <div key={role} className="rbac-card">
              <strong>{role}</strong>
              <ul>
                {ROLE_ACCESS_MAP[role].map(a => <li key={a}>{a}</li>)}
              </ul>
              <span className="rbac-count">{state.userAccounts.filter(u => u.role === role).length} user(s)</span>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="User Accounts" noPad>
        <DataTable columns={columns} data={state.userAccounts} searchable searchKeys={['username','name','role','email']} />
      </SectionCard>

      {showForm && (
        <Modal title="Create User Account" onClose={() => setShowForm(false)} size="md">
          <form onSubmit={handleSubmit} className="form-grid-2">
            <FormField label="Username" name="username" value={form.username} onChange={set} required placeholder="Unique login name" />
            <FormField label="Password" name="password" type="password" value={form.password} onChange={set} required />
            <FormField label="Full Name" name="name" value={form.name} onChange={set} required />
            <FormField label="Email" name="email" type="email" value={form.email} onChange={set} required />
            <FormField label="Role" name="role" type="select" value={form.role} onChange={set}
              options={ROLES.map(r => ({ value: r, label: r }))} />
            <FormField label="Branch" name="branchId" type="select" value={form.branchId} onChange={set}
              options={state.branches.map(b => ({ value: b.id, label: b.name }))} />
            <div className="form-actions">
              <button type="button" className="btn btn--ghost" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn--primary">Create Account</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
