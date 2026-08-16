import { useState, type FormEvent, type ChangeEvent } from 'react'
import { UserCircle, Edit3, Save, X, Lock, Star, UserPlus } from 'lucide-react'
import { useHMS } from '../store/HMSContext'
import { PageHeader } from '../components/ui/PageHeader'
import { SectionCard } from '../components/ui/SectionCard'
import { Badge, statusVariant } from '../components/ui/Badge'
import { FormField } from '../components/ui/FormField'
import { getVisiblePatientIdsForUser } from '../utils/access'
import type { StaffProfile as StaffProfileType } from '../types'

export function StaffProfile() {
  const { currentUser, setCurrentUser, dispatch, state, addAuditLog, setActiveModule } = useHMS()
  const [editingProfile, setEditingProfile] = useState(false)
  const [editingPassword, setEditingPassword] = useState(false)
  const [profileForm, setProfileForm] = useState<StaffProfileType>(
    currentUser?.staffProfile ?? { bio: '', specialization: '', officeLocation: '', workPhone: '', emergencyContact: '', notes: '', stellarAddress: '' }
  )
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState('')
  const [saveMsg, setSaveMsg] = useState('')
  const [assignPatientId, setAssignPatientId] = useState('')
  const [assignMessage, setAssignMessage] = useState('')
  const [selectedPatientId, setSelectedPatientId] = useState('')

  if (!currentUser) return <div className="empty-hint">Not logged in.</div>

  // Data only for this staff member (role-based isolation)
  const isPatient = currentUser.role === 'Patient'
  const myAppointments = state.appointments.filter(a =>
    isPatient ? a.patientId === state.patients[0]?.id : a.doctorName === currentUser.name
  ).slice(0, 8)
  const myRecords = state.medicalRecords.filter(r =>
    isPatient ? r.patientId === state.patients[0]?.id : r.doctorName === currentUser.name
  ).slice(0, 8)
  const myAuditLogs = state.auditLogs.filter(l => l.userId === currentUser.id).slice(0, 10)

  const setP = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setProfileForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const saveProfile = (e: FormEvent) => {
    e.preventDefault()
    dispatch({ type: 'UPDATE_STAFF_PROFILE', payload: { userId: currentUser.id, profile: profileForm } })
    // update currentUser in context + localStorage
    const updated = { ...currentUser, staffProfile: profileForm }
    setCurrentUser(updated)
    localStorage.setItem('hms-auth-v4', JSON.stringify(updated))
    addAuditLog('UPDATE_PROFILE', 'StaffProfile', currentUser.id)
    setSaveMsg('Profile saved.')
    setEditingProfile(false)
    setTimeout(() => setSaveMsg(''), 3000)
  }

  const savePassword = (e: FormEvent) => {
    e.preventDefault()
    setPwError('')
    if (pwForm.current !== currentUser.password) { setPwError('Current password is incorrect.'); return }
    if (pwForm.next.length < 6) { setPwError('New password must be at least 6 characters.'); return }
    if (pwForm.next !== pwForm.confirm) { setPwError('Passwords do not match.'); return }
    const updated = { ...currentUser, password: pwForm.next }
    dispatch({ type: 'UPDATE_USER_ACCOUNT', payload: updated })
    setCurrentUser(updated)
    localStorage.setItem('hms-auth-v4', JSON.stringify(updated))
    addAuditLog('CHANGE_PASSWORD', 'StaffProfile', currentUser.id)
    setPwSuccess('Password changed successfully.')
    setEditingPassword(false)
    setPwForm({ current: '', next: '', confirm: '' })
    setTimeout(() => setPwSuccess(''), 4000)
  }

  const initials = currentUser.name.split(' ').map(w => w[0]).slice(0, 2).join('')
  const visiblePatientIds = currentUser ? getVisiblePatientIdsForUser(currentUser, state) : []
  const myPatients = state.patients.filter(patient => visiblePatientIds.includes(patient.id))
  const availablePatients = state.patients.filter(patient =>
    !myPatients.some(item => item.id === patient.id)
  )
  const selectedPatient = myPatients.find(patient => patient.id === selectedPatientId) ?? myPatients[0] ?? null
  const selectedPatientAppointments = selectedPatient
    ? state.appointments.filter(appt => appt.patientId === selectedPatient.id)
    : []
  const selectedPatientRecords = selectedPatient
    ? state.medicalRecords.filter(record => record.patientId === selectedPatient.id)
    : []

  const addPatientToList = (e: FormEvent) => {
    e.preventDefault()
    if (!assignPatientId) return

    const patient = state.patients.find(item => item.id === assignPatientId)
    if (!patient) return

    dispatch({
      type: 'UPDATE_PATIENT',
      payload: { ...patient, assignedDoctorId: currentUser.id, assignedDoctorName: currentUser.name },
    })
    addAuditLog('ASSIGN_PATIENT', 'StaffProfile', patient.id)
    setAssignPatientId('')
    setAssignMessage(`${patient.name} added to your patient list.`)
    setTimeout(() => setAssignMessage(''), 3000)
  }

  return (
    <div className="module-page">
      <PageHeader
        title="My Profile"
        subtitle="Your personal workspace — private notes and profile are visible only to you"
        icon={<UserCircle size={22} />}
      />

      {/* Identity card */}
      <div className="profile-identity-card">
        <div className="profile-avatar-lg">{initials}</div>
        <div className="profile-identity-info">
          <h2>{currentUser.name}</h2>
          <div className="profile-identity-meta">
            <Badge variant="blue">{currentUser.role}</Badge>
            <span>{currentUser.department || '—'}</span>
            <span>{currentUser.email}</span>
            {currentUser.phone && <span>{currentUser.phone}</span>}
          </div>
          {currentUser.staffProfile.specialization && (
            <p className="profile-specialization">
              <Star size={13} /> {currentUser.staffProfile.specialization}
            </p>
          )}
        </div>
        <div className="profile-identity-actions">
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => setEditingProfile(p => !p)}>
            {editingProfile ? <><X size={14} /> Cancel</> : <><Edit3 size={14} /> Edit Profile</>}
          </button>
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => setEditingPassword(p => !p)}>
            <Lock size={14} /> Change Password
          </button>
        </div>
      </div>

      {saveMsg && <div className="profile-save-msg">{saveMsg}</div>}
      {pwSuccess && <div className="profile-save-msg">{pwSuccess}</div>}

      {/* Edit Profile Form */}
      {editingProfile && (
        <SectionCard title="Edit Profile">
          <form onSubmit={saveProfile} className="form-grid-2">
            <FormField label="Bio / About" name="bio" type="textarea" value={profileForm.bio} onChange={setP} />
            <FormField label="Specialization" name="specialization" value={profileForm.specialization} onChange={setP} />
            <FormField label="Office Location" name="officeLocation" value={profileForm.officeLocation} onChange={setP} />
            <FormField label="Work Phone" name="workPhone" value={profileForm.workPhone} onChange={setP} />
            <FormField label="Emergency Contact" name="emergencyContact" value={profileForm.emergencyContact} onChange={setP} />
            <FormField label="Stellar XLM Wallet Address" name="stellarAddress" value={profileForm.stellarAddress} onChange={setP} placeholder="G..." />
            <div className="form-field form-field--full">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Lock size={13} /> Private Notes (only you can see this)
              </label>
              <textarea
                className="form-control"
                name="notes"
                value={profileForm.notes}
                onChange={setP}
                rows={4}
                placeholder="Personal reminders, observations, draft notes..."
              />
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn--ghost" onClick={() => setEditingProfile(false)}>Cancel</button>
              <button type="submit" className="btn btn--primary"><Save size={14} /> Save Profile</button>
            </div>
          </form>
        </SectionCard>
      )}

      {/* Change Password Form */}
      {editingPassword && (
        <SectionCard title="Change Password">
          <form onSubmit={savePassword} className="form-grid-2" style={{ maxWidth: 500 }}>
            <FormField label="Current Password" name="current" type="password" value={pwForm.current} onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))} required />
            <div />
            <FormField label="New Password" name="next" type="password" value={pwForm.next} onChange={e => setPwForm(f => ({ ...f, next: e.target.value }))} required />
            <FormField label="Confirm New Password" name="confirm" type="password" value={pwForm.confirm} onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} required />
            {pwError && <p className="login-page__error form-field--full">{pwError}</p>}
            <div className="form-actions">
              <button type="button" className="btn btn--ghost" onClick={() => { setEditingPassword(false); setPwError('') }}>Cancel</button>
              <button type="submit" className="btn btn--primary"><Lock size={14} /> Update Password</button>
            </div>
          </form>
        </SectionCard>
      )}

      {/* Profile details */}
      <div className="dashboard-charts-row">
        <SectionCard title="Profile Details">
          <div className="profile-detail-list">
            <div className="profile-detail-row"><span>Username</span><strong>{currentUser.username}</strong></div>
            <div className="profile-detail-row"><span>Role</span><Badge variant="blue">{currentUser.role}</Badge></div>
            <div className="profile-detail-row"><span>Department</span><strong>{currentUser.department || '—'}</strong></div>
            <div className="profile-detail-row"><span>Email</span><strong>{currentUser.email}</strong></div>
            <div className="profile-detail-row"><span>Phone</span><strong>{currentUser.phone || '—'}</strong></div>
            <div className="profile-detail-row"><span>Office</span><strong>{currentUser.staffProfile.officeLocation || '—'}</strong></div>
            <div className="profile-detail-row"><span>Work Phone</span><strong>{currentUser.staffProfile.workPhone || '—'}</strong></div>
            <div className="profile-detail-row"><span>Joined</span><strong>{currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : '—'}</strong></div>
            <div className="profile-detail-row"><span>Last Login</span><strong>{currentUser.lastLogin ? new Date(currentUser.lastLogin).toLocaleString() : '—'}</strong></div>
            <div className="profile-detail-row"><span>XLM Address</span><strong className="xlm-addr">{currentUser.staffProfile.stellarAddress || 'Not set'}</strong></div>
            {currentUser.staffProfile.bio && (
              <div className="profile-detail-row profile-detail-row--full"><span>Bio</span><span>{currentUser.staffProfile.bio}</span></div>
            )}
          </div>
        </SectionCard>

        {/* Private notes — only visible to this user */}
        <SectionCard title="🔒 Private Notes">
          {currentUser.staffProfile.notes
            ? <pre className="private-notes">{currentUser.staffProfile.notes}</pre>
            : <p className="empty-hint">No private notes yet. Edit your profile to add some.</p>}
        </SectionCard>
      </div>

      {currentUser.role === 'Doctor' && (
        <SectionCard title="Patient Management">
          {assignMessage && <div className="profile-save-msg">{assignMessage}</div>}

          <p className="form-hint">
            <UserPlus size={14} /> Patient registration is centralized in{' '}
            <button type="button" className="link-btn" onClick={() => setActiveModule('patients')}>Patient Management</button>.
            Select an existing patient below to add to your list.
          </p>

          <form onSubmit={addPatientToList} className="form-grid-2" style={{ marginBottom: 16 }}>
            <FormField
              label="Add existing patient to your list"
              name="patientId"
              type="select"
              value={assignPatientId}
              onChange={e => setAssignPatientId(e.target.value)}
              required
              options={availablePatients.map(patient => ({ value: patient.id, label: `${patient.id} – ${patient.name}` }))}
            />
            <div className="form-actions">
              <button type="submit" className="btn btn--ghost">Add to My List</button>
            </div>
          </form>

          {myPatients.length === 0 ? (
            <p className="empty-hint">No patients assigned to you yet.</p>
          ) : (
            <>
              <div className="mini-table-wrapper">
                <table className="mini-table">
                  <thead><tr><th>ID</th><th>Name</th><th>Status</th><th>Phone</th><th>Action</th></tr></thead>
                  <tbody>
                    {myPatients.map(patient => (
                      <tr key={patient.id}>
                        <td>{patient.id}</td>
                        <td>{patient.name}</td>
                        <td><Badge variant={statusVariant(patient.status)}>{patient.status}</Badge></td>
                        <td>{patient.phone || '—'}</td>
                        <td>
                          <button type="button" className="btn btn--ghost btn--sm" onClick={() => setSelectedPatientId(patient.id)}>
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {selectedPatient && (
                <div className="dashboard-charts-row" style={{ marginTop: 16 }}>
                  <SectionCard title={`Patient Details — ${selectedPatient.name}`}>
                    <div className="profile-detail-list">
                      <div className="profile-detail-row"><span>ID</span><strong>{selectedPatient.id}</strong></div>
                      <div className="profile-detail-row"><span>Phone</span><strong>{selectedPatient.phone || '—'}</strong></div>
                      <div className="profile-detail-row"><span>Email</span><strong>{selectedPatient.email || '—'}</strong></div>
                      <div className="profile-detail-row"><span>Address</span><strong>{selectedPatient.address || '—'}</strong></div>
                      <div className="profile-detail-row"><span>Allergies</span><strong>{selectedPatient.allergies || '—'}</strong></div>
                      <div className="profile-detail-row"><span>Insurance</span><strong>{selectedPatient.insuranceId || '—'}</strong></div>
                      <div className="profile-detail-row"><span>Status</span><Badge variant={statusVariant(selectedPatient.status)}>{selectedPatient.status}</Badge></div>
                    </div>
                  </SectionCard>

                  <SectionCard title="Recent Appointments">
                    {selectedPatientAppointments.length === 0 ? (
                      <p className="empty-hint">No appointments found for this patient.</p>
                    ) : (
                      <div className="mini-table-wrapper">
                        <table className="mini-table">
                          <thead><tr><th>Date</th><th>Time</th><th>Type</th><th>Status</th></tr></thead>
                          <tbody>
                            {selectedPatientAppointments.slice(0, 8).map(appt => (
                              <tr key={appt.id}>
                                <td>{appt.date}</td>
                                <td>{appt.time}</td>
                                <td>{appt.type}</td>
                                <td><Badge variant={statusVariant(appt.status)}>{appt.status}</Badge></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </SectionCard>

                  <SectionCard title="Medical Records">
                    {selectedPatientRecords.length === 0 ? (
                      <p className="empty-hint">No medical records found for this patient.</p>
                    ) : (
                      <div className="mini-table-wrapper">
                        <table className="mini-table">
                          <thead><tr><th>Visit</th><th>Diagnosis</th><th>Treatment</th><th>Date</th></tr></thead>
                          <tbody>
                            {selectedPatientRecords.slice(0, 8).map(record => (
                              <tr key={record.id}>
                                <td>{record.visitType}</td>
                                <td>{record.diagnosis}</td>
                                <td>{record.treatment}</td>
                                <td>{new Date(record.createdAt).toLocaleDateString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </SectionCard>
                </div>
              )}
            </>
          )}
        </SectionCard>
      )}

      {/* My activity */}
      <div className="dashboard-charts-row">
        <SectionCard title="My Recent Appointments">
          {myAppointments.length === 0
            ? <p className="empty-hint">No appointments found.</p>
            : (
              <div className="mini-table-wrapper">
                <table className="mini-table">
                  <thead><tr><th>Patient</th><th>Date</th><th>Type</th><th>Status</th></tr></thead>
                  <tbody>
                    {myAppointments.map(a => (
                      <tr key={a.id}>
                        <td>{a.patientName}</td><td>{a.date} {a.time}</td><td>{a.type}</td>
                        <td><Badge variant={statusVariant(a.status)}>{a.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </SectionCard>

        <SectionCard title="My Recent Records">
          {myRecords.length === 0
            ? <p className="empty-hint">No records found.</p>
            : (
              <div className="mini-table-wrapper">
                <table className="mini-table">
                  <thead><tr><th>Patient</th><th>Diagnosis</th><th>Type</th><th>Date</th></tr></thead>
                  <tbody>
                    {myRecords.map(r => (
                      <tr key={r.id}>
                        <td>{r.patientName}</td><td>{r.diagnosis}</td><td>{r.visitType}</td>
                        <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </SectionCard>
      </div>

      {/* My audit trail */}
      <SectionCard title="My Activity Log">
        {myAuditLogs.length === 0
          ? <p className="empty-hint">No activity logged yet.</p>
          : (
            <div className="mini-table-wrapper">
              <table className="mini-table">
                <thead><tr><th>Action</th><th>Module</th><th>Target</th><th>Result</th><th>Time</th></tr></thead>
                <tbody>
                  {myAuditLogs.map(l => (
                    <tr key={l.id}>
                      <td>{l.action}</td><td>{l.module}</td><td>{l.target}</td>
                      <td><Badge variant={statusVariant(l.result)}>{l.result}</Badge></td>
                      <td>{new Date(l.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </SectionCard>
    </div>
  )
}
