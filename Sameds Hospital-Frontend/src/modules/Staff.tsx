import { useState, type FormEvent, type ChangeEvent } from 'react'
import { UserCog, UserPlus } from 'lucide-react'
import { useHMS } from '../store/HMSContext'
import { DataTable, type Column } from '../components/ui/DataTable'
import { Modal } from '../components/ui/Modal'
import { FormField } from '../components/ui/FormField'
import { Badge } from '../components/ui/Badge'
import { PageHeader } from '../components/ui/PageHeader'
import { SectionCard } from '../components/ui/SectionCard'
import type { Staff, Role } from '../types'

const ROLES: Role[] = ['Admin','Doctor','Nurse','Receptionist','Pharmacist','Cashier','LabTechnician','Radiologist']

const EMPTY: Omit<Staff,'id'> = {
  employeeId: '', name: '', role: 'Nurse', department: '',
  email: '', phone: '', hireDate: '', salary: 0,
  attendance: 'Present', status: 'Active', branchId: 'BR-001',
}

export function Staff() {
  const { state, dispatch, nextId } = useHMS()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ ...EMPTY })

  const set = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const staff: Staff = {
      ...form, salary: Number(form.salary),
      id: nextId('STF', state.staff),
      employeeId: `EMP-${String(state.staff.length + 10001).padStart(5,'0')}`,
    }
    dispatch({ type: 'ADD_STAFF', payload: staff })
    setForm({ ...EMPTY })
    setShowForm(false)
  }

  const toggleAttendance = (s: Staff) =>
    dispatch({ type: 'UPDATE_STAFF', payload: { ...s, attendance: s.attendance === 'Present' ? 'Absent' : 'Present' } })

  const columns: Column<Staff>[] = [
    { key: 'employeeId', label: 'Emp. ID', width: '110px' },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'role', label: 'Role', badge: true, sortable: true },
    { key: 'department', label: 'Department', sortable: true },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
    { key: 'hireDate', label: 'Hire Date', sortable: true },
    { key: 'salary', label: 'Salary (NGN)', render: s => `₦${Number(s.salary).toLocaleString()}` },
    { key: 'attendance', label: 'Attendance', badge: true },
    { key: 'status', label: 'Status', badge: true },
    {
      key: 'actions', label: '', width: '90px',
      render: row => (
        <button type="button" className="icon-btn" onClick={e => { e.stopPropagation(); toggleAttendance(row) }}>
          {row.attendance === 'Present' ? '✓' : '✗'}
        </button>
      ),
    },
  ]

  const byDept: Record<string, number> = {}
  state.staff.forEach(s => { byDept[s.department] = (byDept[s.department] ?? 0) + 1 })

  return (
    <div className="module-page">
      <PageHeader
        title="Staff Management"
        subtitle={`${state.staff.length} employees · ${state.staff.filter(s => s.attendance === 'Present').length} present today`}
        icon={<UserCog size={22} />}
        actions={
          <button type="button" className="btn btn--primary" onClick={() => setShowForm(true)}>
            <UserPlus size={16} /> Add Staff
          </button>
        }
      />

      <div className="mini-stats-row">
        {ROLES.map(r => (
          <div key={r} className="mini-stat">
            <Badge variant="blue">{r}</Badge>
            <strong>{state.staff.filter(s => s.role === r).length}</strong>
          </div>
        ))}
      </div>

      <SectionCard title="Department Breakdown">
        <div className="dept-grid">
          {Object.entries(byDept).map(([dept, count]) => (
            <div key={dept} className="dept-chip">
              <strong>{count}</strong>
              <span>{dept}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Staff Directory" noPad>
        <DataTable columns={columns} data={state.staff} searchable searchKeys={['name','role','department','employeeId']} />
      </SectionCard>

      {showForm && (
        <Modal title="Add Staff Member" onClose={() => setShowForm(false)} size="lg">
          <form onSubmit={handleSubmit} className="form-grid-2">
            <FormField label="Full Name" name="name" value={form.name} onChange={set} required />
            <FormField label="Role" name="role" type="select" value={form.role} onChange={set}
              options={ROLES.map(r => ({ value: r, label: r }))} />
            <FormField label="Department" name="department" type="select" value={form.department} onChange={set}
              options={state.departments.map(d => ({ value: d.name, label: d.name }))} />
            <FormField label="Email" name="email" type="email" value={form.email} onChange={set} required />
            <FormField label="Phone" name="phone" type="tel" value={form.phone} onChange={set} required />
            <FormField label="Hire Date" name="hireDate" type="date" value={form.hireDate} onChange={set} required />
            <FormField label="Salary (NGN)" name="salary" type="number" value={form.salary} onChange={set} min={0} />
            <FormField label="Status" name="status" type="select" value={form.status} onChange={set}
              options={[{ value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }]} />
            <div className="form-actions">
              <button type="button" className="btn btn--ghost" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn--primary">Add Staff</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

