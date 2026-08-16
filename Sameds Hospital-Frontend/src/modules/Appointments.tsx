import { useState, type FormEvent, type ChangeEvent } from 'react'
import { CalendarPlus, CheckCircle, UserPlus, XCircle } from 'lucide-react'
import { useHMS } from '../store/HMSContext'
import { DataTable, type Column } from '../components/ui/DataTable'
import { Modal } from '../components/ui/Modal'
import { FormField } from '../components/ui/FormField'
import { Badge, statusVariant } from '../components/ui/Badge'
import { PageHeader } from '../components/ui/PageHeader'
import { SectionCard } from '../components/ui/SectionCard'
import { getVisiblePatientIdsForUser } from '../utils/access'
import type { Appointment } from '../types'

const EMPTY = {
  patientId: '',
  doctorId: '',
  department: '',
  date: new Date().toISOString().slice(0, 10),
  time: '09:00',
  type: 'Consultation' as Appointment['type'],
  priority: 'Routine' as Appointment['priority'],
  notes: '',
  status: 'Booked' as Appointment['status'],
}

export function Appointments() {
  const { state, dispatch, nextId, addAuditLog, currentUser, setActiveModule } = useHMS()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ ...EMPTY })

  const visiblePatientIds = currentUser ? getVisiblePatientIdsForUser(currentUser, state) : []

  const set = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const selectPatient = (patientId: string) => {
    const patient = state.patients.find(p => p.id === patientId)
    if (patient) {
      const doctor = state.doctors.find(
        d => d.id === patient.assignedDoctorId || d.name === patient.assignedDoctorName,
      )
      setForm(f => ({
        ...f,
        patientId,
        doctorId: doctor?.id ?? '',
        department: doctor?.department ?? f.department,
      }))
    } else {
      setForm(f => ({ ...f, patientId }))
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!form.patientId) return

    const patient = state.patients.find(p => p.id === form.patientId)
    const doctor = state.doctors.find(d => d.id === form.doctorId)

    const appt: Appointment = {
      id: nextId('AP', state.appointments),
      patientId: form.patientId,
      patientName: patient?.name ?? '',
      doctorId: form.doctorId,
      doctorName: doctor?.name ?? form.doctorId,
      department: form.department || doctor?.department || '',
      date: form.date,
      time: form.time,
      type: form.type,
      priority: form.priority,
      notes: form.notes,
      status: form.status,
    }

    dispatch({ type: 'ADD_APPOINTMENT', payload: appt })
    addAuditLog('BOOK_APPOINTMENT', 'Appointments', appt.id)
    // Auto appointment reminder notification
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: `NOTIF-${Date.now()}`,
        recipientId: appt.patientId,
        recipient: appt.patientName,
        type: 'Appointment',
        subject: `Appointment Reminder: ${appt.date} at ${appt.time}`,
        body: `Dear ${appt.patientName}, your ${appt.type} appointment with ${appt.doctorName} is confirmed for ${appt.date} at ${appt.time}. Please arrive 15 minutes early.`,
        status: 'Sent',
        channel: 'In-app',
        sentAt: new Date().toISOString(),
      },
    })
    setForm({ ...EMPTY })
    setShowForm(false)
  }

  const updateStatus = (appt: Appointment, status: Appointment['status']) => {
    dispatch({ type: 'UPDATE_APPOINTMENT', payload: { ...appt, status } })
  }

  const columns: Column<Appointment>[] = [
    { key: 'id', label: 'ID', width: '110px' },
    { key: 'patientName', label: 'Patient', sortable: true },
    { key: 'doctorName', label: 'Doctor', sortable: true },
    { key: 'department', label: 'Department' },
    { key: 'date', label: 'Date', sortable: true, width: '105px' },
    { key: 'time', label: 'Time', width: '70px' },
    { key: 'type', label: 'Type', badge: true },
    { key: 'priority', label: 'Priority', badge: true },
    { key: 'status', label: 'Status', badge: true, sortable: true },
    {
      key: 'actions',
      label: '',
      width: '100px',
      render: row => (
        <div className="row-actions">
          {row.status === 'Booked' && (
            <button type="button" className="icon-btn icon-btn--green" title="Confirm" onClick={e => { e.stopPropagation(); updateStatus(row, 'Confirmed') }}><CheckCircle size={14} /></button>
          )}
          {(row.status === 'Booked' || row.status === 'Confirmed') && (
            <button type="button" className="icon-btn icon-btn--red" title="Cancel" onClick={e => { e.stopPropagation(); updateStatus(row, 'Cancelled') }}><XCircle size={14} /></button>
          )}
          {row.status === 'Confirmed' && (
            <button type="button" className="icon-btn icon-btn--blue" title="Complete" onClick={e => { e.stopPropagation(); updateStatus(row, 'Completed') }}><CheckCircle size={14} /></button>
          )}
        </div>
      ),
    },
  ]

  const visibleAppointments = state.appointments.filter(appt => {
    if (!currentUser) return false
    if (currentUser.role === 'Patient') return appt.patientId === visiblePatientIds[0]
    if (currentUser.role === 'Doctor') return visiblePatientIds.includes(appt.patientId)
    return true
  })

  const today = new Date().toISOString().slice(0, 10)
  const todayAppts = visibleAppointments.filter(a => a.date === today)
  const upcoming = visibleAppointments.filter(a => a.date > today)
  const past = visibleAppointments.filter(a => a.date < today)

  const openPatientManagement = () => {
    setShowForm(false)
    setForm({ ...EMPTY })
    setActiveModule('patients')
  }

  return (
    <div className="module-page">
      <PageHeader
        title="Appointment Management"
        subtitle={`${state.appointments.length} total appointments`}
        icon={<CalendarPlus size={22} />}
        actions={
          <button type="button" className="btn btn--primary" onClick={() => setShowForm(true)}>
            <CalendarPlus size={16} /> Book Appointment
          </button>
        }
      />

      <div className="mini-stats-row">
        <div className="mini-stat"><span>Today</span><strong>{todayAppts.length}</strong></div>
        <div className="mini-stat"><span>Upcoming</span><strong>{upcoming.length}</strong></div>
        <div className="mini-stat"><span>Past</span><strong>{past.length}</strong></div>
        <div className="mini-stat"><span>Confirmed</span><strong>{state.appointments.filter(a => a.status === 'Confirmed').length}</strong></div>
        <div className="mini-stat"><span>Cancelled</span><strong>{state.appointments.filter(a => a.status === 'Cancelled').length}</strong></div>
      </div>

      {todayAppts.length > 0 && (
        <SectionCard title="Today's Schedule">
          <div className="appt-schedule">
            {todayAppts.sort((a, b) => a.time.localeCompare(b.time)).map(a => (
              <div key={a.id} className={`appt-slot appt-slot--${a.priority.toLowerCase()}`}>
                <span className="appt-slot__time">{a.time}</span>
                <div className="appt-slot__body">
                  <strong>{a.patientName}</strong>
                  <span>{a.doctorName} · {a.department}</span>
                </div>
                <Badge variant={statusVariant(a.status)}>{a.status}</Badge>
                <Badge variant={a.priority === 'Emergency' ? 'red' : a.priority === 'Urgent' ? 'orange' : 'gray'}>{a.priority}</Badge>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      <SectionCard title="All Appointments" noPad>
        <DataTable
          columns={columns}
          data={visibleAppointments}
          searchable
          searchKeys={['patientName', 'doctorName', 'department', 'id']}
        />
      </SectionCard>

      {showForm && (
        <Modal title="Book Appointment" onClose={() => setShowForm(false)} size="md">
          <form onSubmit={handleSubmit} className="form-grid-2">
            <FormField
              label="Select Patient"
              name="patientId"
              type="select"
              value={form.patientId}
              onChange={e => selectPatient(e.target.value)}
              required
              options={state.patients
                .filter(p => (currentUser?.role === 'Doctor' ? visiblePatientIds.includes(p.id) : true))
                .map(p => ({ value: p.id, label: `${p.id} – ${p.name}` }))}
            />

            <div className="form-hint">
              <UserPlus size={14} /> New patient? Patient registration lives in{' '}
              <button type="button" className="link-btn" onClick={openPatientManagement}>
                Patient Management
              </button>
              .
            </div>

            <FormField
              label="Doctor"
              name="doctorId"
              type="select"
              value={form.doctorId}
              onChange={e => {
                set(e)
                const doc = state.doctors.find(d => d.id === e.target.value)
                if (doc) setForm(f => ({ ...f, department: doc.department }))
              }}
              required
              options={state.doctors
                .filter(d => d.status === 'Active' || d.status === 'On call')
                .map(d => ({ value: d.id, label: `${d.name} (${d.specialty})` }))}
            />
            <FormField
              label="Department"
              name="department"
              value={form.department}
              onChange={set}
              placeholder="Auto-filled from doctor"
              required
            />
            <FormField label="Date" name="date" type="date" value={form.date} onChange={set} required />
            <FormField label="Time" name="time" type="time" value={form.time} onChange={set} required />
            <FormField
              label="Type"
              name="type"
              type="select"
              value={form.type}
              onChange={set}
              options={['Consultation', 'Follow-up', 'Lab', 'Scan', 'Procedure'].map(v => ({ value: v, label: v }))}
            />
            <FormField
              label="Priority"
              name="priority"
              type="select"
              value={form.priority}
              onChange={set}
              options={['Routine', 'Urgent', 'Emergency'].map(v => ({ value: v, label: v }))}
            />
            <FormField label="Notes" name="notes" type="textarea" value={form.notes} onChange={set} placeholder="Additional notes (optional)" />
            <div className="form-actions">
              <button type="button" className="btn btn--ghost" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn--primary">Book Appointment</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
