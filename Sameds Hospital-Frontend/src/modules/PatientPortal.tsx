import { UserCircle } from 'lucide-react'
import { useHMS } from '../store/HMSContext'
import { PageHeader } from '../components/ui/PageHeader'
import { SectionCard } from '../components/ui/SectionCard'
import { Badge, statusVariant } from '../components/ui/Badge'
import { PatientBarcode } from '../components/ui/PatientBarcode'

export function PatientPortal() {
  const { state, currentUser } = useHMS()

  const myPatient = currentUser?.role === 'Patient'
    ? state.patients.find(p => p.userId === currentUser.id || p.email === currentUser.email)
    : null

  const patient = myPatient ?? state.patients[0]
  const appts = state.appointments.filter(a => a.patientId === patient?.id).slice(0, 5)
  const records = state.medicalRecords.filter(r => r.patientId === patient?.id).slice(0, 3)
  const invoices = state.invoices.filter(i => i.patientId === patient?.id).slice(0, 3)
  const docs = state.documents.filter(d => d.patientId === patient?.id).slice(0, 3)
  const centralRecords = (currentUser?.role === 'Patient' ? state.centralRecords.filter(c => c.patientId === patient?.id) : state.centralRecords.filter(c => c.patientId === patient?.id)).slice(0, 5)

  return (
    <div className="module-page">
      <PageHeader
        title="Patient Portal"
        subtitle="View your medical records, appointments and bills"
        icon={<UserCircle size={22} />}
      />

      {patient && (
        <>
          <SectionCard title="My Profile">
            <div className="profile-grid">
              <div><strong>ID:</strong> {patient.id}</div>
              <div><strong>Name:</strong> {patient.name}</div>
              <div><strong>Age:</strong> {patient.age}</div>
              <div><strong>Gender:</strong> {patient.gender}</div>
              <div><strong>Blood:</strong> {patient.bloodGroup}</div>
              <div><strong>Status:</strong> <Badge variant={statusVariant(patient.status)}>{patient.status}</Badge></div>
              <div><strong>Phone:</strong> {patient.phone}</div>
              <div><strong>Email:</strong> {patient.email}</div>
            </div>
          </SectionCard>

          <div className="dashboard-charts-row">
            <SectionCard title="My Appointments">
              {appts.length === 0 ? <p className="empty-hint">No appointments scheduled.</p> : (
                <div className="mini-table-wrapper">
                  <table className="mini-table">
                    <thead><tr><th>Doctor</th><th>Date</th><th>Time</th><th>Status</th></tr></thead>
                    <tbody>
                      {appts.map(a => (
                        <tr key={a.id}><td>{a.doctorName}</td><td>{a.date}</td><td>{a.time}</td><td><Badge variant={statusVariant(a.status)}>{a.status}</Badge></td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </SectionCard>

            <SectionCard title="My Medical Records">
              {records.length === 0 ? <p className="empty-hint">No records on file.</p> : (
                <div className="mini-table-wrapper">
                  <table className="mini-table">
                    <thead><tr><th>Doctor</th><th>Type</th><th>Diagnosis</th><th>Date</th></tr></thead>
                    <tbody>
                      {records.map(r => (
                        <tr key={r.id}><td>{r.doctorName}</td><td>{r.visitType}</td><td>{r.diagnosis}</td><td>{new Date(r.createdAt).toLocaleDateString()}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </SectionCard>
          </div>

          <div className="dashboard-charts-row">
            <SectionCard title="My Invoices">
              {invoices.length === 0 ? <p className="empty-hint">No invoices.</p> : (
                <div className="mini-table-wrapper">
                  <table className="mini-table">
                    <thead><tr><th>Invoice</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
                    <tbody>
                      {invoices.map(i => (
                        <tr key={i.id}><td>{i.id}</td><td>${i.total.toFixed(2)}</td><td><Badge variant={statusVariant(i.status)}>{i.status}</Badge></td><td>{new Date(i.issuedAt).toLocaleDateString()}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </SectionCard>

            <SectionCard title="My Documents">
              {docs.length === 0 ? <p className="empty-hint">No documents.</p> : (
                <div className="doc-list">
                  {docs.map(d => (
                    <div key={d.id} className="doc-item">
                      <span>{d.title}</span>
                      <Badge variant="blue">{d.type}</Badge>
                      <button type="button" className="link-btn">Download</button>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>

          {centralRecords.length > 0 && (
            <SectionCard title="Shared Records (Central Database)">
              <div className="mini-table-wrapper">
                <table className="mini-table">
                  <thead><tr><th>Type</th><th>Summary</th><th>Submitted By</th><th>Date</th></tr></thead>
                  <tbody>
                    {centralRecords.map(c => (
                      <tr key={c.id}>
                        <td><Badge variant="blue">{c.recordType}</Badge></td>
                        <td>{c.summary}</td>
                        <td>{c.submittedByName}</td>
                        <td>{new Date(c.submittedAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          )}

          <SectionCard title="Patient QR / Barcode">
            <PatientBarcode patient={patient} size={140} />
          </SectionCard>
        </>
      )}
    </div>
  )
}

